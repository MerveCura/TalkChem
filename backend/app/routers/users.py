from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import User, LevelTestAttempt, LevelTestAnswer, TenseQuizAttempt, GrammarQuizAttempt, SavedWord
from app.routers.auth import get_current_user
from datetime import datetime
import os
import shutil

router = APIRouter(prefix="/api/users", tags=["users"])


def get_level_test_data(user_id: int, db: Session) -> dict:
    last_attempt = (
        db.query(LevelTestAttempt)
        .filter(LevelTestAttempt.user_id == user_id)
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

    return {
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


def get_quiz_stats(user_id: int, db: Session) -> dict:
    # Tense quizleri
    tense_quizzes = (
        db.query(TenseQuizAttempt)
        .filter(
            TenseQuizAttempt.user_id == user_id,
            TenseQuizAttempt.completed.is_(True)
        )
        .options(joinedload(TenseQuizAttempt.answers))
        .order_by(TenseQuizAttempt.created_at.desc())
        .all()
    )

    # Grammar quizleri
    grammar_quizzes = (
        db.query(GrammarQuizAttempt)
        .filter(
            GrammarQuizAttempt.user_id == user_id,
            GrammarQuizAttempt.completed.is_(True)
        )
        .options(joinedload(GrammarQuizAttempt.answers))
        .order_by(GrammarQuizAttempt.created_at.desc())
        .all()
    )

    quiz_history = []
    topic_progress = {}

    # Tense quiz history
    for quiz in tense_quizzes:
        wrong_list = [
            {
                "question_text": a.question_text,
                "user_answer": a.user_answer,
                "correct_answer": a.correct_answer,
                "ai_feedback": a.ai_feedback,
            }
            for a in quiz.answers
            if not a.is_correct
        ]
        quiz_history.append({
            "id": quiz.id,
            "topic_id": quiz.tense_id,
            "quiz_type": "tense",
            "score": quiz.score,
            "perfect": quiz.perfect,
            "total_questions": quiz.total_questions,
            "created_at": quiz.created_at,
            "wrong_answers": wrong_list,
        })
        key = f"tense:{quiz.tense_id}"
        topic_progress.setdefault(key, {"name": quiz.tense_id.replace("-", " ").title(), "scores": []})
        topic_progress[key]["scores"].append(quiz.score)

    # Grammar quiz history
    for quiz in grammar_quizzes:
        wrong_list = [
            {
                "question_text": a.question_text,
                "user_answer": a.user_answer,
                "correct_answer": a.correct_answer,
                "ai_feedback": a.ai_feedback,
            }
            for a in quiz.answers
            if not a.is_correct
        ]
        quiz_history.append({
            "id": quiz.id,
            "topic_id": quiz.topic_id,
            "quiz_type": "grammar",
            "score": quiz.score,
            "perfect": quiz.perfect,
            "total_questions": quiz.total_questions,
            "created_at": quiz.created_at,
            "wrong_answers": wrong_list,
        })
        key = f"grammar:{quiz.topic_id}"
        topic_progress.setdefault(key, {"name": quiz.topic_id.replace("-", " ").title(), "scores": []})
        topic_progress[key]["scores"].append(quiz.score)

    # Tarihe göre sırala
    quiz_history.sort(key=lambda x: x["created_at"], reverse=True)

    topic_stats = {
        key: {
            "name": val["name"],
            "average_score": round(sum(val["scores"]) / len(val["scores"])),
            "attempt_count": len(val["scores"]),
            "latest_score": val["scores"][0],
        }
        for key, val in topic_progress.items()
    }

    all_quizzes = tense_quizzes + grammar_quizzes
    total = len(all_quizzes)

    return {
        "total_quizzes": total,
        "perfect_quizzes": sum(1 for q in all_quizzes if q.perfect),
        "average_score": round(sum(q.score for q in all_quizzes) / total) if total > 0 else 0,
        "history": quiz_history,
        "tense_stats": topic_stats,  # profil ekranı bu key'i kullanıyor, isim değişmedi
    }


def get_saved_words_data(user_id: int, db: Session) -> dict:
    saved_words = (
        db.query(SavedWord)
        .filter(SavedWord.user_id == user_id)
        .options(joinedload(SavedWord.word))
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
        "total": len(saved_words_list),
        "words": saved_words_list,
    }


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "english_level": current_user.english_level,
        "created_at": current_user.created_at,
        "profile_image": current_user.profile_image,
        "level_test": get_level_test_data(current_user.id, db),
        "quiz_stats": get_quiz_stats(current_user.id, db),
        "saved_words": get_saved_words_data(current_user.id, db),
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