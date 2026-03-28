from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, VocabularyWord, SavedWord, UserSeenWord
from app.routers.auth import get_current_user
import openai
import os
import json
import random

router = APIRouter(prefix="/api/vocabulary", tags=["vocabulary"])
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@router.get("/words/{category}/{level}")
async def get_words(
    category: str,
    level: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seen_word_ids = [sw.word_id for sw in db.query(UserSeenWord).filter(
        UserSeenWord.user_id == current_user.id
    ).all()]

    available_words = db.query(VocabularyWord).filter(
        VocabularyWord.category == category,
        VocabularyWord.level == level,
        ~VocabularyWord.id.in_(seen_word_ids) if seen_word_ids else True
    ).all()

    if len(available_words) < 20:
        existing_words = [w.word for w in db.query(VocabularyWord).filter(
            VocabularyWord.category == category,
            VocabularyWord.level == level
        ).all()]

        prompt = f"""Generate exactly 20 English vocabulary words for the category "{category}" at CEFR level "{level}".

Rules:
- Words must be practical and commonly used in {category} context
- Level {level} appropriate difficulty
- Do NOT repeat these existing words: {json.dumps(existing_words)}
- Each word must have a clear English meaning, Turkish meaning, natural example sentence, and pronunciation tip

Return ONLY a JSON array, no other text:
[
  {{
    "word": "accomplish",
    "meaning": "to successfully complete something",
    "meaning_tr": "başarmak, tamamlamak",
    "example_sentence": "She accomplished all her goals by the end of the year.",
    "pronunciation": "uh-KOM-plish"
  }}
]"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.8,
        )

        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        content = content.strip()

        new_words_data = json.loads(content)

        for w in new_words_data:
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
        db.commit()

        available_words = db.query(VocabularyWord).filter(
            VocabularyWord.category == category,
            VocabularyWord.level == level,
            ~VocabularyWord.id.in_(seen_word_ids) if seen_word_ids else True
        ).all()

    selected = random.sample(available_words, min(20, len(available_words)))

    for word in selected:
        existing = db.query(UserSeenWord).filter(
            UserSeenWord.user_id == current_user.id,
            UserSeenWord.word_id == word.id
        ).first()
        if not existing:
            db.add(UserSeenWord(user_id=current_user.id, word_id=word.id))
    db.commit()

    saved_word_ids = [sw.word_id for sw in db.query(SavedWord).filter(
        SavedWord.user_id == current_user.id
    ).all()]

    return {
        "words": [
            {
                "id": w.id,
                "word": w.word,
                "meaning": w.meaning,
                "meaning_tr": w.meaning_tr,
                "example_sentence": w.example_sentence,
                "pronunciation": w.pronunciation,
                "is_saved": w.id in saved_word_ids,
            }
            for w in selected
        ]
    }


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
        return {"saved": False, "message": "Word removed from saved"}
    else:
        db.add(SavedWord(user_id=current_user.id, word_id=word_id))
        db.commit()
        return {"saved": True, "message": "Word saved successfully"}


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