from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, GrammarQuizAttempt, GrammarQuizAnswer, GrammarQuestionPool, GrammarSeenQuestion
from app.routers.auth import get_current_user
from app.static_grammar_questions import get_static_grammar_questions
import openai
import os
import json
import random
import time
from concurrent.futures import ThreadPoolExecutor

router = APIRouter(prefix="/api/grammar-quiz", tags=["grammar-quiz"])

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
executor = ThreadPoolExecutor(max_workers=4)

BATCH_SIZE = 5
TOTAL_QUESTIONS = 15
TOTAL_BATCHES = TOTAL_QUESTIONS // BATCH_SIZE  # 3 batch
MIN_POOL_SIZE = 20  # Her topic için havuzda bulunması gereken minimum soru

question_cache: dict[tuple, list] = {}
generating: set[tuple] = set()

TOPIC_NAMES = {
    "articles": "Articles (a, an, the)",
    "prepositions": "Prepositions",
    "modal-verbs": "Modal Verbs",
    "conditionals": "Conditionals",
    "passive-voice": "Passive Voice",
    "reported-speech": "Reported Speech",
    "comparatives": "Comparatives & Superlatives",
    "phrasal-verbs": "Phrasal Verbs",
}


def build_grammar_prompt(topic_id: str, count: int) -> str:
    topic_name = TOPIC_NAMES.get(topic_id, topic_id.replace("-", " ").title())
    return f"""Generate exactly {count} UNIQUE English grammar quiz questions about "{topic_name}".
All must be multiple choice with exactly 4 options.
IMPORTANT: correct_answer must be the FULL TEXT of the correct option, never a letter like "a" or "b".
Make sure all {count} questions are completely different from each other.
Mix easy, medium and hard questions.
Return ONLY JSON array:
[{{"type":"multiple_choice","question":"...","options":["opt1","opt2","opt3","opt4"],"correct_answer":"full text","explanation":"...","difficulty":"easy|medium|hard"}}]"""


def parse_json_response(content: str) -> any:
    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    return json.loads(content.strip())


def get_unseen_questions(topic_id: str, user_id: int, count: int, db: Session) -> list:
    # Kullanıcının daha önce görmediği soruları havuzdan çeker
    seen_ids = {
        sq.question_id for sq in db.query(GrammarSeenQuestion).filter(
            GrammarSeenQuestion.user_id == user_id
        ).all()
    }

    query = db.query(GrammarQuestionPool).filter(
        GrammarQuestionPool.topic_id == topic_id
    )
    if seen_ids:
        query = query.filter(~GrammarQuestionPool.id.in_(seen_ids))

    available = query.all()
    if len(available) < count:
        return []

    return random.sample(available, min(count, len(available)))


def mark_as_seen(user_id: int, questions: list, db: Session):
    # Gösterilen soruları kullanıcının görülen listesine ekler
    for q in questions:
        q_id = q.id if hasattr(q, 'id') else q.get('id')
        if not q_id:
            continue
        existing = db.query(GrammarSeenQuestion).filter(
            GrammarSeenQuestion.user_id == user_id,
            GrammarSeenQuestion.question_id == q_id
        ).first()
        if not existing:
            db.add(GrammarSeenQuestion(user_id=user_id, question_id=q_id))
    db.commit()


def format_questions(questions: list) -> list:
    return [
        {
            "id": q.id,
            "type": q.question_type,
            "question": q.question_text,
            "options": json.loads(q.options) if q.options else [],
            "correct_answer": q.correct_answer,
            "explanation": q.explanation or "",
            "difficulty": q.difficulty or "medium",
        }
        for q in questions
    ]


def refill_pool_if_needed(topic_id: str, db: Session):
    # Havuzda az soru varsa yeni sorular üretip ekler
    total = db.query(GrammarQuestionPool).filter(
        GrammarQuestionPool.topic_id == topic_id
    ).count()

    if total >= MIN_POOL_SIZE:
        return

    needed = MIN_POOL_SIZE - total
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": f"Generate unique grammar questions. Seed: {time.time()}"},
            {"role": "user", "content": build_grammar_prompt(topic_id, needed)}
        ],
        temperature=0.9,
        max_tokens=2000,
    )
    raw = parse_json_response(response.choices[0].message.content)
    for q in raw:
        db.add(GrammarQuestionPool(
            topic_id=topic_id,
            question_text=q.get("question", ""),
            question_type=q.get("type", "multiple_choice"),
            options=json.dumps(q.get("options", [])),
            correct_answer=q.get("correct_answer", ""),
            explanation=q.get("explanation", ""),
            difficulty=q.get("difficulty", "medium"),
        ))
    db.commit()


def prepare_batches_for_user(topic_id: str, user_id: int):
    # Kullanıcı batch 1'i çözerken arka planda çalışır
    # Batch 2 ve 3 için sorular hazırlanır ve cache'e alınır
    gen_key = (topic_id, "batches", user_id)
    if gen_key in generating:
        return
    generating.add(gen_key)

    try:
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            # Havuzda yeterli soru var mı kontrol et, yoksa üret
            refill_pool_if_needed(topic_id, db)

            # Batch 2 için sorular — kullanıcının görmediği
            batch2_qs = get_unseen_questions(topic_id, user_id, BATCH_SIZE, db)
            if batch2_qs:
                mark_as_seen(user_id, batch2_qs, db)
                question_cache[(user_id, topic_id, 2)] = format_questions(batch2_qs)

            # Batch 3 için sorular — batch 2'dekiler artık seen, farklı sorular gelir
            batch3_qs = get_unseen_questions(topic_id, user_id, BATCH_SIZE, db)
            if batch3_qs:
                mark_as_seen(user_id, batch3_qs, db)
                question_cache[(user_id, topic_id, 3)] = format_questions(batch3_qs)

        finally:
            db.close()
    except Exception as e:
        print(f"Grammar prepare error [{topic_id}]: {e}")
    finally:
        generating.discard(gen_key)


# ── Endpoint'ler ──────────────────────────────────────────────────────────────

@router.post("/start")
async def start_quiz(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    topic_id = payload.get("topic_id")
    attempt = GrammarQuizAttempt(
        user_id=current_user.id,
        topic_id=topic_id,
        total_questions=TOTAL_QUESTIONS,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return {"attempt_id": attempt.id}


@router.get("/questions/{topic_id}/batch/{batch_no}")
async def get_question_batch(
    topic_id: str,
    batch_no: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if batch_no < 1 or batch_no > TOTAL_BATCHES:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"batch_no must be between 1 and {TOTAL_BATCHES}")

    user_id = current_user.id
    cache_key = (user_id, topic_id, batch_no)

    if batch_no == 1:
        # İlk batch: statik sorular — 0ms bekleme
        questions = get_static_grammar_questions(topic_id)
        # Batch 2 ve 3'ü arka planda hazırla
        executor.submit(prepare_batches_for_user, topic_id, user_id)

    elif cache_key in question_cache:
        # Cache'de hazır — anında gelir
        questions = question_cache.pop(cache_key)

    else:
        # Nadir durum: senkron üret
        pool_qs = get_unseen_questions(topic_id, user_id, BATCH_SIZE, db)
        if pool_qs:
            mark_as_seen(user_id, pool_qs, db)
            questions = format_questions(pool_qs)
        else:
            # Havuz tükendi — yeni sorular üret
            refill_pool_if_needed(topic_id, db)
            pool_qs = get_unseen_questions(topic_id, user_id, BATCH_SIZE, db)
            if pool_qs:
                mark_as_seen(user_id, pool_qs, db)
                questions = format_questions(pool_qs)
            else:
                questions = []

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
    topic_id = payload.get("topic_id")
    attempt_id = payload.get("attempt_id")

    is_correct = user_answer.strip().lower() == correct_answer.strip().lower()

    ai_feedback = None
    if not is_correct:
        topic_name = TOPIC_NAMES.get(topic_id, topic_id)
        feedback_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": f"""The student answered a {topic_name} grammar question incorrectly.
Question: {question.get("question")}
Student's answer: {user_answer}
Correct answer: {correct_answer}
Give a short, encouraging 2-3 sentence explanation. Focus on the grammar rule."""
            }],
            temperature=0.5,
            max_tokens=200,
        )
        ai_feedback = feedback_response.choices[0].message.content.strip()

    if attempt_id:
        db_answer = GrammarQuizAnswer(
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

    attempt = db.query(GrammarQuizAttempt).filter(
        GrammarQuizAttempt.id == attempt_id,
        GrammarQuizAttempt.user_id == current_user.id
    ).first()

    if attempt:
        attempt.score = round((correct_count / total) * 100)
        attempt.completed = True
        attempt.perfect = correct_count == total
        db.commit()

    keys_to_delete = [k for k in question_cache if k[0] == current_user.id]
    for k in keys_to_delete:
        del question_cache[k]

    return {
        "score": round((correct_count / total) * 100),
        "perfect": correct_count == total,
        "correct_count": correct_count,
        "total": total,
    }