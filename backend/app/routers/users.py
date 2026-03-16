from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, LevelTestAttempt, LevelTestAnswer
from app.routers.auth import get_current_user
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    last_attempt = (
        db.query(LevelTestAttempt)
        .filter(LevelTestAttempt.user_id == current_user.id)
        .order_by(LevelTestAttempt.created_at.desc())
        .first()
    )

    can_retake = True
    days_until_retake = 0

    if last_attempt:
        days_passed = (datetime.utcnow() - last_attempt.created_at).days
        if days_passed < 15:
            can_retake = False
            days_until_retake = 15 - days_passed

    answers = []
    if last_attempt:
        db_answers = (
            db.query(LevelTestAnswer)
            .filter(LevelTestAnswer.attempt_id == last_attempt.id)
            .all()
        )
        for a in db_answers:
            # Open ended sorular her zaman correct sayılır
            # Multiple choice sorular correct_answer ile karşılaştırılır
            if a.question_type == "open_ended":
                is_correct = True
            else:
                is_correct = (
                    a.correct_answer is not None
                    and a.correct_answer != "None"
                    and a.user_answer == a.correct_answer
                )

            answers.append({
                "question_text": a.question_text,
                "question_type": a.question_type,
                "user_answer": a.user_answer,
                "correct_answer": a.correct_answer,
                "question_level": a.question_level,
                "is_correct": is_correct,
            })

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "english_level": current_user.english_level,
        "created_at": current_user.created_at,
        "level_test": {
            "attempt": {
                "id": last_attempt.id,
                "level": last_attempt.level,
                "score": last_attempt.score,
                "created_at": last_attempt.created_at,
            } if last_attempt else None,
            "can_retake": can_retake,
            "days_until_retake": days_until_retake,
            "answers": answers,
        }
    }