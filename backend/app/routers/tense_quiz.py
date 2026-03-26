from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, TenseQuizAttempt, TenseQuizAnswer
from app.routers.auth import get_current_user
import openai
import os
import json

router = APIRouter(prefix="/api/tense-quiz", tags=["tense-quiz"])
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


@router.get("/questions/{tense_id}")
async def get_questions(
    tense_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Kullanıcının bu tense'deki geçmiş yanlış sorularını bul
    past_wrong = (
        db.query(TenseQuizAnswer)
        .join(TenseQuizAttempt)
        .filter(
            TenseQuizAttempt.user_id == current_user.id,
            TenseQuizAttempt.tense_id == tense_id,
            TenseQuizAnswer.is_correct == False
        )
        .order_by(TenseQuizAnswer.created_at.desc())
        .limit(5)
        .all()
    )

    wrong_context = ""
    if past_wrong:
        wrong_context = f"""
The student has previously struggled with these types of questions:
{json.dumps([{"question": a.question_text, "user_answer": a.user_answer, "correct": a.correct_answer} for a in past_wrong], indent=2)}
Include similar question types to help them practice their weak areas.
"""

    tense_name = tense_id.replace("-", " ").title()

    prompt = f"""Generate exactly 15 English quiz questions about the "{tense_name}" tense.

{wrong_context}

Mix of question types:
- 8 multiple_choice questions (4 options each)
- 7 fill_in_the_blank questions (provide the sentence with ___ and 4 options)

Rules:
- All questions must be about {tense_name} usage
- Vary difficulty from easy to hard
- Use everyday, natural English sentences
- Every question MUST have exactly 4 options
- Make questions engaging and practical

Return ONLY a JSON array, no other text:
[
  {{
    "id": 1,
    "type": "multiple_choice",
    "question": "Which sentence uses {tense_name} correctly?",
    "options": ["She walk to school.", "She walks to school.", "She walking to school.", "She walked to school."],
    "correct_answer": "She walks to school.",
    "explanation": "In {tense_name}, we use the base form of the verb with 's' for he/she/it."
  }},
  {{
    "id": 2,
    "type": "fill_in_the_blank",
    "question": "She ___ to school every day.",
    "options": ["walk", "walks", "walking", "walked"],
    "correct_answer": "walks",
    "explanation": "We use 'walks' because the subject is 'she' (third person singular)."
  }}
]"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )

    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()

    questions = json.loads(content)
    return {"questions": questions, "tense_id": tense_id}


@router.post("/check-answer")
async def check_answer(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question = payload.get("question")
    user_answer = payload.get("user_answer")
    correct_answer = payload.get("correct_answer")
    tense_id = payload.get("tense_id")
    attempt_id = payload.get("attempt_id")

    is_correct = user_answer.strip().lower() == correct_answer.strip().lower()

    ai_feedback = None
    if not is_correct:
        feedback_prompt = f"""The student answered a {tense_id.replace("-", " ").title()} question incorrectly.

Question: {question.get("question")}
Student's answer: {user_answer}
Correct answer: {correct_answer}
Explanation: {question.get("explanation", "")}

Give a short, encouraging 2-3 sentence explanation of why the correct answer is right.
Be friendly and educational. Focus on the grammar rule."""

        feedback_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": feedback_prompt}],
            temperature=0.5,
        )
        ai_feedback = feedback_response.choices[0].message.content.strip()

    # DB'ye kaydet
    if attempt_id:
        db_answer = TenseQuizAnswer(
            attempt_id=attempt_id,
            question_text=question.get("question", ""),
            question_type=question.get("type", ""),
            options=json.dumps(question.get("options", [])),
            user_answer=user_answer,
            correct_answer=correct_answer,
            is_correct=is_correct,
            ai_feedback=ai_feedback,
        )
        db.add(db_answer)
        db.commit()

    return {
        "is_correct": is_correct,
        "correct_answer": correct_answer,
        "ai_feedback": ai_feedback,
        "explanation": question.get("explanation", ""),
    }


@router.post("/start")
async def start_quiz(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tense_id = payload.get("tense_id")
    attempt = TenseQuizAttempt(
        user_id=current_user.id,
        tense_id=tense_id,
        total_questions=15,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return {"attempt_id": attempt.id}


@router.post("/complete")
async def complete_quiz(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt_id = payload.get("attempt_id")
    correct_count = payload.get("correct_count", 0)
    total = payload.get("total", 15)

    attempt = db.query(TenseQuizAttempt).filter(
        TenseQuizAttempt.id == attempt_id,
        TenseQuizAttempt.user_id == current_user.id
    ).first()

    if attempt:
        attempt.score = round((correct_count / total) * 100)
        attempt.completed = True
        attempt.perfect = correct_count == total
        db.commit()

    return {
        "score": round((correct_count / total) * 100),
        "perfect": correct_count == total,
        "correct_count": correct_count,
        "total": total,
    }