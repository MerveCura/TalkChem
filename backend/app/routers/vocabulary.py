from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, VocabularyWord, SavedWord, UserSeenWord
from app.routers.auth import get_current_user
from app.static_vocabulary import get_static_vocab
import openai
import os
import json
import random
from concurrent.futures import ThreadPoolExecutor

router = APIRouter(prefix="/api/vocabulary", tags=["vocabulary"])

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
executor = ThreadPoolExecutor(max_workers=4)

# Kelime önbelleği: Load More'a basılınca hazır kelimeler anında gelsin
word_cache: dict[tuple, list] = {}
generating: set[tuple] = set()

LOAD_MORE_SIZE = 3

LEVEL_EXAMPLES = {
    "A1": {
        "desc": "absolute beginner level — only the most basic words a child would know",
        "examples": "eat, drink, house, big, small, go, come, good, bad, hot, cold",
        "forbidden": "never use words from A2, B1, B2, C1, C2 levels",
    },
    "A2": {
        "desc": "elementary level — simple everyday words, slightly more than A1",
        "examples": "schedule, travel, weekend, market, hobby, weather, family, colour",
        "forbidden": "never use A1 words like eat/drink/house, never use B1+ words",
    },
    "B1": {
        "desc": "intermediate level — practical words for common real-life situations",
        "examples": "commute, budget, appointment, responsibility, opportunity, challenge",
        "forbidden": "never use A1/A2 simple words, never use B2+ advanced words",
    },
    "B2": {
        "desc": "upper-intermediate level — nuanced vocabulary, more precise expressions",
        "examples": "procrastinate, sustainable, acquisition, stakeholder, ambiguous",
        "forbidden": "never use A1/A2/B1 common words, never use C1/C2 rare words",
    },
    "C1": {
        "desc": "advanced level — sophisticated, precise, academic vocabulary",
        "examples": "meticulous, pragmatic, jurisprudence, proliferate, scrutinize",
        "forbidden": "never use everyday words, must be clearly advanced vocabulary",
    },
    "C2": {
        "desc": "mastery level — rare, academic, highly sophisticated words",
        "examples": "quotidian, alacrity, ephemeral, perspicacious, loquacious",
        "forbidden": "must be genuinely rare or academic, not words a B2 speaker would know",
    },
}


# ── Prompt ───────────────────────────────────────────────────────────────────

def build_words_prompt(category: str, level: str, all_existing_words: list, count: int) -> str:
    level_info = LEVEL_EXAMPLES.get(level, {})
    desc = level_info.get("desc", level)
    examples = level_info.get("examples", "")
    forbidden = level_info.get("forbidden", "")

    return f"""You are a vocabulary teacher. Generate exactly {count} English words for:
- Category: "{category}"
- Level: {level} ({desc})
- Example words at this level: {examples}
- RULE: {forbidden}
- NEVER repeat any of these existing words: {json.dumps(all_existing_words)}
- Words MUST be relevant to "{category}" topic
- All {count} words must be DIFFERENT from each other

Return ONLY valid JSON array, no markdown:
[{{"word":"...","meaning":"...","meaning_tr":"...","example_sentence":"...","pronunciation":"..."}}]"""


# ── Yardımcı Fonksiyonlar ─────────────────────────────────────────────────────

def parse_json_response(content: str) -> any:
    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    return json.loads(content.strip())


def get_all_existing_words(category: str, db: Session) -> list:
    # O kategorideki TÜM seviyelerdeki kelimeler — tekrar engellemek için
    return [w.word for w in db.query(VocabularyWord).filter(
        VocabularyWord.category == category
    ).all()]


def get_unseen_db_words(user_id: int, category: str, level: str, count: int, db: Session) -> list:
    # Kullanıcının daha önce görmediği kelimeleri DB'den çeker
    seen_word_ids = {
        sw.word_id for sw in db.query(UserSeenWord).filter(
            UserSeenWord.user_id == user_id
        ).all()
    }

    query = db.query(VocabularyWord).filter(
        VocabularyWord.category == category,
        VocabularyWord.level == level,
    )
    if seen_word_ids:
        query = query.filter(~VocabularyWord.id.in_(seen_word_ids))

    available = query.all()
    if len(available) < count:
        return []
    return random.sample(available, min(count, len(available)))


def generate_and_save_words(category: str, level: str, count: int, db: Session) -> list:
    # TÜM seviyelerdeki mevcut kelimeler prompt'a verilir — tekrar engellenir
    all_existing = get_all_existing_words(category, db)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": build_words_prompt(category, level, all_existing, count)}],
        temperature=0.9,
        max_tokens=1000,
    )

    new_words_data = parse_json_response(response.choices[0].message.content)
    saved = []
    for w in new_words_data:
        word_text = w.get("word", "").strip().lower()
        if not word_text:
            continue
        # Herhangi bir seviyede bile olsa aynı kelime varsa atla
        already_exists = db.query(VocabularyWord).filter(
            VocabularyWord.category == category,
            VocabularyWord.word == word_text
        ).first()
        if already_exists:
            continue

        db_word = VocabularyWord(
            category=category,
            level=level,
            word=w.get("word", ""),
            meaning=w.get("meaning", ""),
            meaning_tr=w.get("meaning_tr", ""),
            example_sentence=w.get("example_sentence", ""),
            pronunciation=w.get("pronunciation", ""),
        )
        db.add(db_word)
        saved.append(db_word)
    db.commit()
    for w in saved:
        db.refresh(w)
    return saved


def mark_as_seen(user_id: int, words: list, db: Session):
    # Gösterilen kelimeleri kullanıcının görülen listesine ekler
    for word in words:
        word_id = word.id if hasattr(word, 'id') else None
        if not word_id:
            continue
        existing = db.query(UserSeenWord).filter(
            UserSeenWord.user_id == user_id,
            UserSeenWord.word_id == word_id
        ).first()
        if not existing:
            db.add(UserSeenWord(user_id=user_id, word_id=word_id))
    db.commit()


def format_db_words(words: list, user_id: int, db: Session) -> list:
    saved_word_ids = {
        sw.word_id for sw in db.query(SavedWord).filter(
            SavedWord.user_id == user_id
        ).all()
    }
    return [
        {
            "id": w.id,
            "word": w.word,
            "meaning": w.meaning,
            "meaning_tr": w.meaning_tr,
            "example_sentence": w.example_sentence,
            "pronunciation": w.pronunciation,
            "is_saved": w.id in saved_word_ids,
        }
        for w in words
    ]


def _generate_and_cache_next_page(user_id: int, category: str, level: str, page_no: int):
    # Thread pool'da çalışan fonksiyon — FastAPI event loop'unu bloklamaz
    cache_key = (user_id, category, level, page_no)
    if cache_key in generating:
        return
    generating.add(cache_key)

    try:
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            words = get_unseen_db_words(user_id, category, level, LOAD_MORE_SIZE, db)
            if not words:
                new_words = generate_and_save_words(category, level, LOAD_MORE_SIZE + 2, db)
                words = new_words[:LOAD_MORE_SIZE]

            mark_as_seen(user_id, words, db)
            formatted = format_db_words(words, user_id, db)
            if formatted:
                word_cache[cache_key] = formatted
        finally:
            db.close()
    except Exception as e:
        print(f"Vocabulary cache error [{category}/{level}] page {page_no}: {e}")
    finally:
        generating.discard(cache_key)


# ── Endpoint'ler ──────────────────────────────────────────────────────────────

@router.get("/words/{category}/{level}/seen")
async def get_seen_words(
    category: str,
    level: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Kullanıcının bu kategori+seviye için daha önce gördüğü kelimeleri döner
    # Kullanıcı sayfaya geri döndüğünde önceki kelimeler kaybolmaz
    seen_word_ids = {
        sw.word_id for sw in db.query(UserSeenWord).filter(
            UserSeenWord.user_id == current_user.id
        ).all()
    }

    if not seen_word_ids:
        return {"words": [], "count": 0}

    words = db.query(VocabularyWord).filter(
        VocabularyWord.category == category,
        VocabularyWord.level == level,
        VocabularyWord.id.in_(seen_word_ids)
    ).order_by(VocabularyWord.id.asc()).all()

    return {
        "words": format_db_words(words, current_user.id, db),
        "count": len(words)
    }


@router.get("/words/{category}/{level}/static")
async def get_static_words(
    category: str,
    level: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # İlk 3 statik kelimeyi döner — 0ms bekleme, anında gelir
    # Arka planda page 1 için 3 kelime hazırlanır
    words = get_static_vocab(category, level)

    cache_key = (current_user.id, category, level, 1)
    if cache_key not in word_cache and cache_key not in generating:
        executor.submit(_generate_and_cache_next_page, current_user.id, category, level, 1)

    return {"words": words, "is_static": True}


@router.get("/words/{category}/{level}/more/{page_no}")
async def get_more_words(
    category: str,
    level: str,
    page_no: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Load More butonuna basılınca çağrılır
    # Cache'de hazırsa anında döner
    user_id = current_user.id
    cache_key = (user_id, category, level, page_no)

    if cache_key in word_cache:
        words = word_cache.pop(cache_key)
    else:
        db_words = get_unseen_db_words(user_id, category, level, LOAD_MORE_SIZE, db)
        if not db_words:
            db_words = generate_and_save_words(category, level, LOAD_MORE_SIZE + 2, db)
            db_words = db_words[:LOAD_MORE_SIZE]
        mark_as_seen(user_id, db_words, db)
        words = format_db_words(db_words, user_id, db)

    # Bir sonraki sayfayı arka planda hazırla
    next_page = page_no + 1
    next_key = (user_id, category, level, next_page)
    if next_key not in word_cache and next_key not in generating:
        executor.submit(_generate_and_cache_next_page, user_id, category, level, next_page)

    return {"words": words, "page_no": page_no}


@router.post("/save/{word_id}")
async def save_word(
    word_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(SavedWord).filter(
        SavedWord.user_id == current_user.id,
        SavedWord.word_id == word_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False}
    else:
        db.add(SavedWord(user_id=current_user.id, word_id=word_id))
        db.commit()
        return {"saved": True}


@router.get("/saved")
async def get_saved_words(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    saved = db.query(SavedWord).filter(
        SavedWord.user_id == current_user.id
    ).order_by(SavedWord.created_at.desc()).all()

    return {
        "words": [
            {
                "id": sw.word.id,
                "word": sw.word.word,
                "meaning": sw.word.meaning,
                "meaning_tr": sw.word.meaning_tr,
                "example_sentence": sw.word.example_sentence,
                "pronunciation": sw.word.pronunciation,
                "category": sw.word.category,
                "level": sw.word.level,
                "saved_at": sw.created_at,
            }
            for sw in saved
        ]
    }