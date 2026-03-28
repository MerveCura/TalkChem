from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, LevelTestAttempt, LevelTestAnswer, TenseQuizAttempt, TenseQuizAnswer, SavedWord, VocabularyWord
from app.routers.auth import get_current_user
from datetime import datetime
import os
import shutil

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Level test
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

    # Tense quiz istatistikleri
    tense_quizzes = (
        db.query(TenseQuizAttempt)
        .filter(
            TenseQuizAttempt.user_id == current_user.id,
            TenseQuizAttempt.completed.is_(True)
        )
        .order_by(TenseQuizAttempt.created_at.desc())
        .all()
    )

    quiz_history = []
    tense_progress = {}

    for quiz in tense_quizzes:
        wrong_answers = (
            db.query(TenseQuizAnswer)
            .filter(
                TenseQuizAnswer.attempt_id == quiz.id,
                TenseQuizAnswer.is_correct.is_(False)
            )
            .all()
        )
        wrong_list = [
            {
                "question_text": a.question_text,
                "user_answer": a.user_answer,
                "correct_answer": a.correct_answer,
                "ai_feedback": a.ai_feedback,
            }
            for a in wrong_answers
        ]

        quiz_history.append({
            "id": quiz.id,
            "tense_id": quiz.tense_id,
            "score": quiz.score,
            "perfect": quiz.perfect,
            "total_questions": quiz.total_questions,
            "created_at": quiz.created_at,
            "wrong_answers": wrong_list,
        })

        if quiz.tense_id not in tense_progress:
            tense_progress[quiz.tense_id] = []
        tense_progress[quiz.tense_id].append(quiz.score)

    tense_stats = {
        tense: {
            "average_score": round(sum(scores) / len(scores)),
            "attempt_count": len(scores),
            "latest_score": scores[0],
        }
        for tense, scores in tense_progress.items()
    }

    # Kayıtlı kelimeler
    saved_words = (
        db.query(SavedWord)
        .filter(SavedWord.user_id == current_user.id)
        .order_by(SavedWord.created_at.desc())
        .all()
    )

    saved_words_list = [
        {
            "id": sw.word.id,
            "word": sw.word.word,
            "meaning": sw.word.meaning,
            "meaning_tr": sw.word.meaning_tr,
            "example_sentence": sw.word.example_sentence,
            "pronunciation": sw.word.pronunciation,
            "category": sw.word.category,
            "level": sw.word.level,
        }
        for sw in saved_words
    ]

    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "english_level": current_user.english_level,
        "created_at": current_user.created_at,
        "profile_image": current_user.profile_image,
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
        },
        "quiz_stats": {
            "total_quizzes": len(tense_quizzes),
            "perfect_quizzes": sum(1 for q in tense_quizzes if q.perfect),
            "average_score": round(sum(q.score for q in tense_quizzes) / len(tense_quizzes)) if tense_quizzes else 0,
            "history": quiz_history,
            "tense_stats": tense_stats,
        },
        "saved_words": {
            "total": len(saved_words_list),
            "words": saved_words_list,
        }
    }


@router.post("/upload-photo")
async def upload_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    upload_dir = "uploads/profiles"
    os.makedirs(upload_dir, exist_ok=True)

    file_ext = file.filename.split(".")[-1] if file.filename else "jpg"
    file_path = f"{upload_dir}/{current_user.id}.{file_ext}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    current_user.profile_image = file_path
    db.commit()
    db.refresh(current_user)

    return {"profile_image": file_path}