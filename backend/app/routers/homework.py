from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Homework
from app.routers.auth import get_current_user
import openai
import os
import json
from datetime import datetime

router = APIRouter(prefix="/api/homework", tags=["homework"])

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def build_homework_prompt(quiz_type: str, topic_name: str, wrong_questions: list) -> str:
    # Yanlış soruları prompt'a ekle — AI aynı konuya odaklı yeni sorular üretsin
    wrong_summary = "\n".join([
        f"- Q: {q.get('question', '')} | Wrong answer: {q.get('user_answer', '')} | Correct: {q.get('correct_answer', '')}"
        for q in wrong_questions[:10]  # max 10 soru gönder
    ])
    count = min(len(wrong_questions) + 2, 10)  # yanlış soru sayısı + 2 ekstra, max 10

    return f"""The student made mistakes on a {topic_name} quiz. Generate {count} new practice questions targeting their weak areas.

Student's wrong answers:
{wrong_summary}

Rules:
- Focus on the same grammar patterns the student got wrong
- All questions must be multiple choice with exactly 4 options
- correct_answer must be the FULL TEXT of the correct option
- Mix easy and medium difficulty
- Return ONLY a JSON array, no other text:
[{{"question":"...","options":["opt1","opt2","opt3","opt4"],"correct_answer":"full text","explanation":"short explanation of the rule"}}]"""


def create_homework_for_user(
    user_id: int,
    quiz_type: str,
    topic_id: str,
    topic_name: str,
    wrong_questions: list,
    db: Session,
):
    # Yanlış soru yoksa ödev oluşturma
    if not wrong_questions:
        return None

    # Aynı topic için zaten pending ödev varsa yenisini oluşturma
    existing = db.query(Homework).filter(
        Homework.user_id == user_id,
        Homework.topic_id == topic_id,
        Homework.status == "pending",
    ).first()
    if existing:
        # Mevcut ödevi güncelle — yeni yanlışları ekle
        existing_questions = json.loads(existing.wrong_questions)
        merged = {q["question"]: q for q in existing_questions + wrong_questions}
        existing.wrong_questions = json.dumps(list(merged.values()), ensure_ascii=False)
        existing.created_at = datetime.utcnow()
        db.commit()
        return existing

    homework = Homework(
        user_id=user_id,
        quiz_type=quiz_type,
        topic_id=topic_id,
        topic_name=topic_name,
        wrong_questions=json.dumps(wrong_questions, ensure_ascii=False),
        status="pending",
    )
    db.add(homework)
    db.commit()
    db.refresh(homework)
    return homework


# ── Endpoint'ler ──────────────────────────────────────────────────────────────

@router.get("/list")
async def get_homeworks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    homeworks = db.query(Homework).filter(
        Homework.user_id == current_user.id,
    ).order_by(Homework.created_at.desc()).all()

    return [
        {
            "id": hw.id,
            "quiz_type": hw.quiz_type,
            "topic_id": hw.topic_id,
            "topic_name": hw.topic_name,
            "status": hw.status,
            "score": hw.score,
            "question_count": 5,
            "created_at": hw.created_at.isoformat(),
            "completed_at": hw.completed_at.isoformat() if hw.completed_at else None,
        }
        for hw in homeworks
    ]


@router.get("/{homework_id}/questions")
async def get_homework_questions(
    homework_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    hw = db.query(Homework).filter(
        Homework.id == homework_id,
        Homework.user_id == current_user.id,
    ).first()

    if not hw:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Homework not found")

    wrong_questions = json.loads(hw.wrong_questions)

    # AI ile yanlış sorulara odaklı yeni sorular üret
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": build_homework_prompt(
            hw.quiz_type, hw.topic_name, wrong_questions
        )}],
        temperature=0.7,
        max_tokens=2000,
    )
    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    questions = json.loads(content.strip())

    return {
        "homework_id": hw.id,
        "topic_name": hw.topic_name,
        "quiz_type": hw.quiz_type,
        "questions": questions,
    }


@router.post("/{homework_id}/complete")
async def complete_homework(
    homework_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    hw = db.query(Homework).filter(
        Homework.id == homework_id,
        Homework.user_id == current_user.id,
    ).first()

    if not hw:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Homework not found")

    correct_count = payload.get("correct_count", 0)
    total = payload.get("total", 1)

    hw.status = "done"
    hw.score = round((correct_count / total) * 100)
    hw.completed_at = datetime.utcnow()
    db.commit()

    return {
        "score": hw.score,
        "status": hw.status,
        "perfect": hw.score == 100,
    }