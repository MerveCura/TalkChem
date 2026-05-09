from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Duel, Friendship
from app.routers.auth import get_current_user
import openai
import os
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

router = APIRouter(prefix="/api/duels", tags=["duels"])

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
executor = ThreadPoolExecutor(max_workers=4)

DUEL_QUESTION_COUNT = 10

TOPICS = {
    "mixed": "Mixed",
    "present-simple": "Present Simple",
    "present-continuous": "Present Continuous",
    "past-simple": "Past Simple",
    "present-perfect": "Present Perfect",
    "future-tenses": "Future Tenses",
    "articles": "Articles",
    "prepositions": "Prepositions",
    "modal-verbs": "Modal Verbs",
    "conditionals": "Conditionals",
    "passive-voice": "Passive Voice",
    "reported-speech": "Reported Speech",
    "comparatives": "Comparatives & Superlatives",
    "phrasal-verbs": "Phrasal Verbs",
}


def generate_duel_questions(topic: str) -> list:
    topic_name = TOPICS.get(topic, topic.replace("-", " ").title())

    if topic == "mixed":
        prompt = f"""Generate exactly {DUEL_QUESTION_COUNT} English grammar quiz questions covering a MIX of different topics: tenses, articles, prepositions, modal verbs, conditionals, passive voice, reported speech, comparatives, phrasal verbs.
Make sure questions cover at least 5 different grammar topics.
All must be multiple choice with exactly 4 options.
correct_answer must be the FULL TEXT of the correct option.
Keep explanations SHORT (max 10 words).
Return ONLY a raw JSON array:
[{{"question":"...","options":["opt1","opt2","opt3","opt4"],"correct_answer":"full text","explanation":"short"}}]"""
    else:
        prompt = f"""Generate exactly {DUEL_QUESTION_COUNT} English grammar quiz questions about "{topic_name}".
All must be multiple choice with exactly 4 options.
correct_answer must be the FULL TEXT of the correct option.
Keep explanations SHORT (max 10 words).
Return ONLY a raw JSON array:
[{{"question":"...","options":["opt1","opt2","opt3","opt4"],"correct_answer":"full text","explanation":"short"}}]"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
        max_tokens=3000,
    )
    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()
    start = content.find("[")
    end = content.rfind("]")
    return json.loads(content[start:end + 1])


def fill_duel_questions(duel_id: int, topic: str):
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        try:
            questions = generate_duel_questions(topic)
            duel = db.query(Duel).filter(Duel.id == duel_id).first()
            if duel:
                duel.questions = json.dumps(questions, ensure_ascii=False)
                duel.status = "pending"
                db.commit()
        finally:
            db.close()
    except Exception as e:
        print(f"Duel question generation error: {e}")


def format_user(user: User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "english_level": user.english_level,
        "profile_image": user.profile_image,
    }


# ── Endpoint'ler ──────────────────────────────────────────────────────────────

@router.post("/challenge/{opponent_id}")
def send_duel_challenge(
    opponent_id: int,
    payload: dict,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    topic = payload.get("topic", "present-simple")
    topic_name = TOPICS.get(topic, topic.replace("-", " ").title())

    # Arkadaş mı kontrol et
    friendship = db.query(Friendship).filter(
        ((Friendship.requester_id == current_user.id) & (Friendship.addressee_id == opponent_id)) |
        ((Friendship.requester_id == opponent_id) & (Friendship.addressee_id == current_user.id)),
        Friendship.status == "accepted",
    ).first()
    if not friendship:
        raise HTTPException(status_code=400, detail="You can only duel with friends")

    opponent = db.query(User).filter(User.id == opponent_id).first()
    if not opponent:
        raise HTTPException(status_code=404, detail="User not found")

    # Zaten aktif duel var mı?
    existing = db.query(Duel).filter(
        ((Duel.challenger_id == current_user.id) & (Duel.opponent_id == opponent_id)) |
        ((Duel.challenger_id == opponent_id) & (Duel.opponent_id == current_user.id)),
        Duel.status.in_(["generating", "pending", "accepted", "challenger_done"]),
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already have an active duel with this user")

    # Duel'i hemen oluştur, soruları arka planda üret
    duel = Duel(
        challenger_id=current_user.id,
        opponent_id=opponent_id,
        status="generating",
        topic=topic,
        topic_name=topic_name,
        questions=None,
    )
    db.add(duel)
    db.commit()
    db.refresh(duel)

    # Soruları arka planda üret
    background_tasks.add_task(fill_duel_questions, duel.id, topic)

    return {"message": "Duel challenge sent", "duel_id": duel.id}


@router.post("/{duel_id}/accept")
def accept_duel(
    duel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    duel = db.query(Duel).filter(
        Duel.id == duel_id,
        Duel.opponent_id == current_user.id,
        Duel.status == "pending",
    ).first()
    if not duel:
        raise HTTPException(status_code=404, detail="Duel not found")

    duel.status = "accepted"
    db.commit()
    return {"message": "Duel accepted"}


@router.post("/{duel_id}/reject")
def reject_duel(
    duel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    duel = db.query(Duel).filter(
        Duel.id == duel_id,
        Duel.opponent_id == current_user.id,
        Duel.status.in_(["pending", "generating"]),
    ).first()
    if not duel:
        raise HTTPException(status_code=404, detail="Duel not found")

    duel.status = "rejected"
    db.commit()
    return {"message": "Duel rejected"}


@router.get("/{duel_id}/questions")
def get_duel_questions(
    duel_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    duel = db.query(Duel).filter(Duel.id == duel_id).first()
    if not duel:
        raise HTTPException(status_code=404, detail="Duel not found")

    if current_user.id not in [duel.challenger_id, duel.opponent_id]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if current_user.id == duel.opponent_id and duel.status == "pending":
        raise HTTPException(status_code=400, detail="Accept the duel first")

    if not duel.questions:
        raise HTTPException(status_code=400, detail="Questions are being prepared, try again in a moment")

    questions = json.loads(duel.questions)
    return {
        "duel_id": duel.id,
        "topic_name": duel.topic_name,
        "questions": questions,
        "status": duel.status,
    }


@router.post("/{duel_id}/submit")
def submit_duel_result(
    duel_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    duel = db.query(Duel).filter(Duel.id == duel_id).first()
    if not duel:
        raise HTTPException(status_code=404, detail="Duel not found")

    correct_count = payload.get("correct_count", 0)
    total = payload.get("total", DUEL_QUESTION_COUNT)
    score = round((correct_count / total) * 100)

    is_challenger = current_user.id == duel.challenger_id
    is_opponent = current_user.id == duel.opponent_id

    if not is_challenger and not is_opponent:
        raise HTTPException(status_code=403, detail="Not authorized")

    if is_challenger:
        if duel.challenger_score is not None:
            raise HTTPException(status_code=400, detail="Already submitted")
        duel.challenger_score = score
        duel.status = "challenger_done"
    else:
        if duel.opponent_score is not None:
            raise HTTPException(status_code=400, detail="Already submitted")
        duel.opponent_score = score

    # Her ikisi de tamamladıysa sonucu belirle
    if duel.challenger_score is not None and duel.opponent_score is not None:
        duel.status = "completed"
        duel.completed_at = datetime.utcnow()
        if duel.challenger_score > duel.opponent_score:
            duel.winner_id = duel.challenger_id
        elif duel.opponent_score > duel.challenger_score:
            duel.winner_id = duel.opponent_id
        else:
            duel.winner_id = None  # Berabere

    db.commit()
    return {
        "score": score,
        "status": duel.status,
        "challenger_score": duel.challenger_score,
        "opponent_score": duel.opponent_score,
        "winner_id": duel.winner_id,
    }


@router.get("/my-turn")
def get_my_turn_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    active = db.query(Duel).filter(
        (Duel.challenger_id == current_user.id) | (Duel.opponent_id == current_user.id),
        Duel.status.in_(["accepted", "challenger_done"]),
    ).all()

    count = 0
    for d in active:
        is_challenger = d.challenger_id == current_user.id
        my_score = d.challenger_score if is_challenger else d.opponent_score
        if my_score is None:
            count += 1
    return {"count": count}


@router.get("/list")
def get_my_duels(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    duels = db.query(Duel).filter(
        (Duel.challenger_id == current_user.id) | (Duel.opponent_id == current_user.id)
    ).order_by(Duel.created_at.desc()).all()

    result = []
    for d in duels:
        opponent = d.opponent if d.challenger_id == current_user.id else d.challenger
        is_challenger = d.challenger_id == current_user.id
        my_score = d.challenger_score if is_challenger else d.opponent_score
        their_score = d.opponent_score if is_challenger else d.challenger_score

        result.append({
            "id": d.id,
            "opponent": format_user(opponent),
            "topic_name": d.topic_name,
            "topic": d.topic,
            "status": d.status,
            "my_score": my_score,
            "their_score": their_score,
            "winner_id": d.winner_id,
            "is_challenger": is_challenger,
            "i_won": d.winner_id == current_user.id if d.winner_id else None,
            "created_at": d.created_at.isoformat(),
            "completed_at": d.completed_at.isoformat() if d.completed_at else None,
        })
    return result


@router.get("/pending")
def get_pending_duels(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pending = db.query(Duel).filter(
        Duel.opponent_id == current_user.id,
        Duel.status.in_(["pending", "generating"]),
    ).all()

    return [
        {
            "id": d.id,
            "challenger": format_user(d.challenger),
            "topic_name": d.topic_name,
            "topic": d.topic,
            "status": d.status,
            "is_ready": d.status == "pending",
            "created_at": d.created_at.isoformat(),
        }
        for d in pending
    ]


@router.get("/active")
def get_active_duels(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    active = db.query(Duel).filter(
        (Duel.challenger_id == current_user.id) | (Duel.opponent_id == current_user.id),
        Duel.status.in_(["accepted", "challenger_done"]),
    ).all()

    result = []
    for d in active:
        is_challenger = d.challenger_id == current_user.id
        my_score = d.challenger_score if is_challenger else d.opponent_score
        already_played = my_score is not None
        opponent = d.opponent if is_challenger else d.challenger

        result.append({
            "id": d.id,
            "opponent": format_user(opponent),
            "topic_name": d.topic_name,
            "topic": d.topic,
            "status": d.status,
            "already_played": already_played,
            "waiting_for_opponent": already_played,
            "your_turn": not already_played,
        })
    return result