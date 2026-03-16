from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, LevelTestAttempt, LevelTestAnswer
from app.routers.auth import get_current_user
import openai
import os
import json

router = APIRouter(prefix="/api/level-test", tags=["level-test"])

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@router.get("/questions")
async def get_questions():
    """AI ile 20 soru üret"""
    prompt = """Generate exactly 20 English proficiency test questions to determine if someone is A1, A2, B1, B2, C1, or C2 level.

Mix of:
- 10 multiple choice questions (with 4 options each)
- 10 open-ended questions (short answer)

Start from very easy (A1) and gradually get harder (C2).

Return ONLY a JSON array like this, no other text:
[
  {
    "id": 1,
    "type": "multiple_choice",
    "level": "A1",
    "question": "What ___ your name?",
    "options": ["is", "are", "am", "be"],
    "correct_answer": "is"
  },
  {
    "id": 2,
    "type": "open_ended",
    "level": "B1",
    "question": "Describe what you did last weekend in 2-3 sentences.",
    "correct_answer": null
  }
]"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    content = response.choices[0].message.content
    # JSON temizle
    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()

    questions = json.loads(content)
    return {"questions": questions}


@router.post("/submit")
async def submit_answers(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cevapları kaydet ve seviyeyi belirle"""
    answers = payload.get("answers", [])
    questions = payload.get("questions", [])

    # Cevapları AI ile değerlendir
    evaluation_prompt = f"""You are an English language examiner. Evaluate these answers and determine the student's CEFR level (A1, A2, B1, B2, C1, or C2).

Questions and answers:
{json.dumps(list(zip(questions, answers)), ensure_ascii=False, indent=2)}

Analyze each answer carefully. For multiple choice, check if it matches the correct answer. For open-ended, evaluate grammar, vocabulary, and complexity.

Return ONLY a JSON object like this, no other text:
{{
  "level": "B1",
  "score": 65,
  "feedback": "Your English is at an intermediate level. You handle everyday situations well but struggle with complex grammar.",
  "strengths": ["Basic grammar", "Common vocabulary"],
  "weaknesses": ["Complex tenses", "Advanced vocabulary"]
}}"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": evaluation_prompt}],
        temperature=0.3,
    )

    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()

    result = json.loads(content)

    # DB'ye kaydet
    attempt = LevelTestAttempt(
        user_id=current_user.id,
        level=result["level"],
        score=result["score"]
    )
    db.add(attempt)
    db.flush()

    for i, (question, answer) in enumerate(zip(questions, answers)):
        db_answer = LevelTestAnswer(
            attempt_id=attempt.id,
            question_text=question.get("question", ""),
            question_type=question.get("type", ""),
            user_answer=str(answer),
            correct_answer=str(question.get("correct_answer", "")),
            question_level=question.get("level", "")
        )
        db.add(db_answer)

    # Kullanıcının seviyesini güncelle
    current_user.english_level = result["level"]
    db.commit()

    return {
        "level": result["level"],
        "score": result["score"],
        "feedback": result["feedback"],
        "strengths": result["strengths"],
        "weaknesses": result["weaknesses"]
    }