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

For meaning_tr: Translate the word to Turkish like a dictionary. MAXIMUM 5 WORDS. NO sentences. NO explanations.
CORRECT examples: "kitap", "koşmak", "güzel", "hijyen", "sorumluluk", "ertelemek", "sürdürülebilir", "paydaş", "belirsiz"
WRONG examples: "hastalıkları önlemek için temizlik yapma", "bir şeyi daha sonraya bırakma alışkanlığı", "çevreye duyarlı üretim süreci"

Return ONLY valid JSON array, no markdown:
[{{"word":"...","meaning":"brief English definition","meaning_tr":"Turkish word (MAX 5 WORDS, NO sentences)","example_sentence":"...","pronunciation":"..."}}]"""


def parse_json_response(content: str) -> any:
    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    return json.loads(content.strip())


def get_all_existing_words(category: str, db: Session) -> list:
    return [w.word for w in db.query(VocabularyWord).filter(
        VocabularyWord.category == category
    ).all()]


def get_unseen_db_words(user_id: int, category: str, level: str, count: int, db: Session) -> list:
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
    return {"words": format_db_words(words, current_user.id, db), "count": len(words)}


@router.get("/words/{category}/{level}/static")
async def get_static_words(
    category: str,
    level: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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

    next_page = page_no + 1
    next_key = (user_id, category, level, next_page)
    if next_key not in word_cache and next_key not in generating:
        executor.submit(_generate_and_cache_next_page, user_id, category, level, next_page)

    return {"words": words, "page_no": page_no}


@router.post("/save-static")
async def save_static_word(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    word_text = payload.get("word", "").strip()
    category = payload.get("category", "")
    level = payload.get("level", "")
    meaning = payload.get("meaning", "")
    meaning_tr = payload.get("meaning_tr", "")
    example_sentence = payload.get("example_sentence", "")
    pronunciation = payload.get("pronunciation", "")

    existing = db.query(VocabularyWord).filter(
        VocabularyWord.category == category,
        VocabularyWord.word == word_text.lower()
    ).first()

    if existing:
        db_word = existing
    else:
        db_word = VocabularyWord(
            category=category,
            level=level,
            word=word_text,
            meaning=meaning,
            meaning_tr=meaning_tr,
            example_sentence=example_sentence,
            pronunciation=pronunciation,
        )
        db.add(db_word)
        db.commit()
        db.refresh(db_word)

    seen_exists = db.query(UserSeenWord).filter(
        UserSeenWord.user_id == current_user.id,
        UserSeenWord.word_id == db_word.id
    ).first()
    if not seen_exists:
        db.add(UserSeenWord(user_id=current_user.id, word_id=db_word.id))

    saved_exists = db.query(SavedWord).filter(
        SavedWord.user_id == current_user.id,
        SavedWord.word_id == db_word.id
    ).first()

    if saved_exists:
        db.delete(saved_exists)
        db.commit()
        return {"saved": False, "word_id": db_word.id}
    else:
        db.add(SavedWord(user_id=current_user.id, word_id=db_word.id))
        db.commit()
        return {"saved": True, "word_id": db_word.id}


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


@router.post("/fix-translations")
async def fix_translations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    words = db.query(VocabularyWord).all()
    to_fix = [w for w in words if w.meaning_tr and len(w.meaning_tr) > 20]

    if not to_fix:
        return {"fixed": 0, "message": "All translations are already short"}

    batch = to_fix[:20]
    word_list = [{"id": w.id, "word": w.word} for w in batch]

    prompt = f"""Translate these English words to Turkish. Dictionary style only. MAXIMUM 5 WORDS. NO sentences. NO explanations.
CORRECT: book→kitap, run→koşmak, hygiene→hijyen, procrastinate→ertelemek, sustainable→sürdürülebilir
WRONG: "hastalıkları önlemek için temizlik", "daha sonraya bırakma alışkanlığı"

Words:
{json.dumps(word_list)}

Return ONLY JSON array:
[{{"id": 1, "meaning_tr": "türkçe"}}]"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=500,
    )

    results = parse_json_response(response.choices[0].message.content)
    fixed = 0
    for r in results:
        word = db.query(VocabularyWord).filter(VocabularyWord.id == r["id"]).first()
        if word:
            word.meaning_tr = r["meaning_tr"]
            fixed += 1

    db.commit()
    return {"fixed": fixed, "total_long": len(to_fix), "message": f"Fixed {fixed}. Call again if total_long > 20."}


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