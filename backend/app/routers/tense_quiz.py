from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, TenseQuizAttempt, TenseQuizAnswer, TenseQuestionPool, TenseSeenQuestion
from app.routers.auth import get_current_user
from app.routers.homework import create_homework_for_user
from app.pregenerate import build_tense_pool_prompt
from app.static_questions import get_static_questions
import openai
import os
import json
import random
import time
from concurrent.futures import ThreadPoolExecutor

router = APIRouter(prefix="/api/tense-quiz", tags=["tense-quiz"])

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
executor = ThreadPoolExecutor(max_workers=4)

BATCH_SIZE = 5
TOTAL_QUESTIONS = 15
TOTAL_BATCHES = TOTAL_QUESTIONS // BATCH_SIZE  # 3 batch
MIN_POOL_SIZE = 20

question_cache: dict[tuple, list] = {}
generating: set[tuple] = set()


# ── Prompt Fonksiyonları ──────────────────────────────────────────────────────

def build_feedback_prompt(tense_id: str, question: dict, user_answer: str, correct_answer: str) -> str:
    tense_name = tense_id.replace("-", " ").title()
    return f"""The student answered a {tense_name} question incorrectly.
Question: {question.get("question")}
Student's answer: {user_answer}
Correct answer: {correct_answer}
Give a short, encouraging 2-3 sentence explanation. Focus on the grammar rule."""


# ── Yardımcı Fonksiyonlar ─────────────────────────────────────────────────────

def parse_json_response(content: str) -> any:
    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    return json.loads(content.strip())


def normalize_question_type(q: dict) -> dict:
    if q.get("type") == "fill_in_the_blank":
        q["type"] = "multiple_choice"
    return q


def get_unseen_questions(tense_id: str, user_id: int, count: int, db: Session) -> list:
    seen_ids = {
        sq.question_id for sq in db.query(TenseSeenQuestion).filter(
            TenseSeenQuestion.user_id == user_id
        ).all()
    }
    query = db.query(TenseQuestionPool).filter(
        TenseQuestionPool.tense_id == tense_id
    )
    if seen_ids:
        query = query.filter(~TenseQuestionPool.id.in_(seen_ids))
    available = query.all()
    if len(available) < count:
        return []
    return random.sample(available, min(count, len(available)))


def mark_as_seen(user_id: int, questions: list, db: Session):
    for q in questions:
        q_id = q.id if hasattr(q, 'id') else None
        if not q_id:
            continue
        existing = db.query(TenseSeenQuestion).filter(
            TenseSeenQuestion.user_id == user_id,
            TenseSeenQuestion.question_id == q_id
        ).first()
        if not existing:
            db.add(TenseSeenQuestion(user_id=user_id, question_id=q_id))
    db.commit()


def format_questions(questions: list) -> list:
    result = []
    for item in questions:
        q = {
            "id": item.id,
            "type": item.question_type,
            "question": item.question_text,
            "options": json.loads(item.options) if item.options else [],
            "correct_answer": item.correct_answer,
            "explanation": item.explanation or "",
            "difficulty": item.difficulty or "medium",
        }
        result.append(normalize_question_type(q))
    return result


def generate_and_add_to_pool(tense_id: str, count: int, db: Session) -> list:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": f"Generate unique tense questions. Seed: {time.time()}"},
            {"role": "user", "content": build_tense_pool_prompt(tense_id, count)}
        ],
        temperature=0.9,
        max_tokens=2000,
    )
    raw = parse_json_response(response.choices[0].message.content)
    saved = []
    for q in raw:
        pool_item = TenseQuestionPool(
            tense_id=tense_id,
            question_text=q.get("question", ""),
            question_type=q.get("type", "multiple_choice"),
            options=json.dumps(q.get("options", [])),
            correct_answer=q.get("correct_answer", ""),
            explanation=q.get("explanation", ""),
            difficulty=q.get("difficulty", "medium"),
        )
        db.add(pool_item)
        saved.append(pool_item)
    db.commit()
    for item in saved:
        db.refresh(item)
    return saved


def prepare_batches_for_user(tense_id: str, user_id: int):
    gen_key = (tense_id, "batches", user_id)
    if gen_key in generating:
        return
    generating.add(gen_key)

    try:
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            batch2_qs = get_unseen_questions(tense_id, user_id, BATCH_SIZE, db)

            if not batch2_qs:
                new_questions = generate_and_add_to_pool(tense_id, BATCH_SIZE * 2, db)
                batch2_qs = new_questions[:BATCH_SIZE]
                batch3_qs = new_questions[BATCH_SIZE:]
            else:
                mark_as_seen(user_id, batch2_qs, db)
                batch3_qs = get_unseen_questions(tense_id, user_id, BATCH_SIZE, db)
                if not batch3_qs:
                    new_questions = generate_and_add_to_pool(tense_id, BATCH_SIZE, db)
                    batch3_qs = new_questions

            if batch2_qs:
                mark_as_seen(user_id, batch2_qs, db)
                question_cache[(user_id, tense_id, 2)] = format_questions(batch2_qs)

            if batch3_qs:
                mark_as_seen(user_id, batch3_qs, db)
                question_cache[(user_id, tense_id, 3)] = format_questions(batch3_qs)

            total = db.query(TenseQuestionPool).filter(
                TenseQuestionPool.tense_id == tense_id
            ).count()
            if total < MIN_POOL_SIZE:
                generate_and_add_to_pool(tense_id, MIN_POOL_SIZE - total, db)

        finally:
            db.close()
    except Exception as e:
        print(f"Tense prepare error [{tense_id}]: {e}")
    finally:
        generating.discard(gen_key)


# ── Endpoint'ler ──────────────────────────────────────────────────────────────

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
        total_questions=TOTAL_QUESTIONS,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return {"attempt_id": attempt.id}


@router.get("/questions/{tense_id}/batch/{batch_no}")
async def get_question_batch(
    tense_id: str,
    batch_no: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if batch_no < 1 or batch_no > TOTAL_BATCHES:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"batch_no must be between 1 and {TOTAL_BATCHES}")

    user_id = current_user.id
    cache_key = (user_id, tense_id, batch_no)

    if batch_no == 1:
        questions = get_static_questions(tense_id)
        executor.submit(prepare_batches_for_user, tense_id, user_id)

    elif cache_key in question_cache:
        questions = question_cache.pop(cache_key)

    else:
        pool_qs = get_unseen_questions(tense_id, user_id, BATCH_SIZE, db)
        if pool_qs:
            mark_as_seen(user_id, pool_qs, db)
            questions = format_questions(pool_qs)
        else:
            new_qs = generate_and_add_to_pool(tense_id, BATCH_SIZE, db)
            mark_as_seen(user_id, new_qs, db)
            questions = format_questions(new_qs)

    return {
        "questions": questions,
        "batch_no": batch_no,
        "total_batches": TOTAL_BATCHES,
        "is_last_batch": batch_no == TOTAL_BATCHES,
    }


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
        feedback_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": build_feedback_prompt(tense_id, question, user_answer, correct_answer)}],
            temperature=0.5,
            max_tokens=200,
        )
        ai_feedback = feedback_response.choices[0].message.content.strip()

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


@router.post("/complete")
async def complete_quiz(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    attempt_id = payload.get("attempt_id")
    correct_count = payload.get("correct_count", 0)
    total = payload.get("total", TOTAL_QUESTIONS)
    tense_id = payload.get("tense_id")

    attempt = db.query(TenseQuizAttempt).filter(
        TenseQuizAttempt.id == attempt_id,
        TenseQuizAttempt.user_id == current_user.id
    ).first()

    if attempt:
        attempt.score = round((correct_count / total) * 100)
        attempt.completed = True
        attempt.perfect = correct_count == total
        db.commit()

    # Yanlış cevaplanan soruları topla
    wrong_answers = db.query(TenseQuizAnswer).filter(
        TenseQuizAnswer.attempt_id == attempt_id,
        TenseQuizAnswer.is_correct.is_(False),
    ).all()

    if wrong_answers and tense_id:
        wrong_questions = [
            {
                "question": a.question_text,
                "options": json.loads(a.options) if a.options else [],
                "user_answer": a.user_answer,
                "correct_answer": a.correct_answer,
            }
            for a in wrong_answers
        ]
        topic_name = tense_id.replace("-", " ").title()
        create_homework_for_user(
            user_id=current_user.id,
            quiz_type="tense",
            topic_id=tense_id,
            topic_name=topic_name,
            wrong_questions=wrong_questions,
            db=db,
        )

    keys_to_delete = [k for k in question_cache if k[0] == current_user.id]
    for k in keys_to_delete:
        del question_cache[k]

    return {
        "score": round((correct_count / total) * 100),
        "perfect": correct_count == total,
        "correct_count": correct_count,
        "total": total,
    }