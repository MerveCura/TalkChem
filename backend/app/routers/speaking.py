from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, SpeakingSession
from app.routers.auth import get_current_user
import openai
import os
import json
import io
import base64

router = APIRouter(prefix="/api/speaking", tags=["speaking"])

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SCENARIOS = {
    "free": {
        "name": "Free Conversation",
        "emoji": "💬",
        "description": "Talk about anything you want",
        "system": """You are a friendly English conversation partner.
Have a natural conversation AND always analyze every user message for language errors.

After EVERY user message, you MUST provide:
1. A natural conversational reply
2. Detailed feedback on their English — ALWAYS, even if minor issues exist

Feedback rules:
- ALWAYS find something to improve. Even good sentences can be more natural or formal.
- Point out grammar errors, wrong word choice, unnatural phrasing, missing articles, wrong tense
- Give the corrected/better version
- If truly perfect, mention what they did well and suggest a more advanced alternative

Return ONLY this JSON format, nothing else:
{
  "reply": "your conversational response",
  "feedback": "💡 [grammar/vocab note]. ✏️ Better: [improved version of their sentence]",
  "has_error": true
}

Set has_error to true if there were grammar/vocabulary mistakes, false if perfect."""
    },
    "cafe": {
        "name": "At the Café",
        "emoji": "☕",
        "description": "Order drinks and food, chat with the barista",
        "system": """You are a friendly barista at a busy café in London.
Stay in character AND always analyze their English.

After EVERY user message, you MUST provide:
1. A natural in-character barista response
2. Detailed English feedback — ALWAYS

Feedback rules:
- ALWAYS find something to improve. Even good sentences can be more natural or formal.
- Point out grammar errors, wrong word choice, unnatural phrasing, missing articles, wrong tense
- Give the corrected/better version

Return ONLY this JSON format:
{
  "reply": "your barista response",
  "feedback": "💡 [grammar/vocab note]. ✏️ Better: [improved version]",
  "has_error": true
}

Set has_error to true if there were any mistakes, false if perfect."""
    },
    "job-interview": {
        "name": "Job Interview",
        "emoji": "💼",
        "description": "Practice common job interview questions",
        "system": """You are a professional HR interviewer at a tech company.
Conduct a realistic interview AND always analyze the candidate's English.

After EVERY user answer, you MUST provide:
1. A professional interviewer response or follow-up question
2. Detailed English feedback — ALWAYS

Feedback rules:
- ALWAYS find something to improve. Even good sentences can be more natural or formal.
- Point out grammar errors, wrong word choice, unnatural phrasing, missing articles, wrong tense
- Give the corrected/better version

Return ONLY this JSON format:
{
  "reply": "your interviewer response",
  "feedback": "💡 [grammar/professional language note]. ✏️ Better: [more professional version]",
  "has_error": true
}

Set has_error to true if there were any mistakes, false if perfect."""
    },
    "travel": {
        "name": "At the Airport",
        "emoji": "✈️",
        "description": "Check-in, customs, asking for directions",
        "system": """You are a helpful airport staff member.
Help the traveller AND always analyze their English.

After EVERY user message, you MUST provide:
1. A helpful in-character airport staff response
2. Detailed English feedback — ALWAYS

Feedback rules:
- ALWAYS find something to improve. Even good sentences can be more natural or formal.
- Point out grammar errors, wrong word choice, unnatural phrasing, missing articles, wrong tense
- Give the corrected/better version

Return ONLY this JSON format:
{
  "reply": "your airport staff response",
  "feedback": "💡 [grammar/vocab note]. ✏️ Better: [improved version]",
  "has_error": true
}

Set has_error to true if there were any mistakes, false if perfect."""
    },
    "doctor": {
        "name": "Doctor's Appointment",
        "emoji": "🏥",
        "description": "Describe symptoms, ask questions at the clinic",
        "system": """You are a friendly doctor. Help the patient AND always analyze their English.

After EVERY user message, you MUST provide:
1. A professional doctor's response
2. Detailed English feedback — ALWAYS

Feedback rules:
- ALWAYS find something to improve. Even good sentences can be more natural or formal.
- Point out grammar errors, wrong word choice, unnatural phrasing, missing articles, wrong tense
- Give the corrected/better version

Return ONLY this JSON format:
{
  "reply": "your doctor response",
  "feedback": "💡 [grammar/vocab note]. ✏️ Better: [improved version]",
  "has_error": true
}

Set has_error to true if there were any mistakes, false if perfect."""
    },
    "shopping": {
        "name": "Shopping",
        "emoji": "🛍️",
        "description": "Shop for clothes, ask about sizes and prices",
        "system": """You are a friendly shop assistant. Help the customer AND always analyze their English.

After EVERY user message, you MUST provide:
1. A helpful shop assistant response
2. Detailed English feedback — ALWAYS

Feedback rules:
- ALWAYS find something to improve. Even good sentences can be more natural or formal.
- Point out grammar errors, wrong word choice, unnatural phrasing, missing articles, wrong tense
- Give the corrected/better version

Return ONLY this JSON format:
{
  "reply": "your shop assistant response",
  "feedback": "💡 [grammar/vocab note]. ✏️ Better: [improved version]",
  "has_error": true
}

Set has_error to true if there were any mistakes, false if perfect."""
    },
}


def parse_json_safe(content: str) -> dict:
    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()
    start = content.find("{")
    end = content.rfind("}")
    if start != -1 and end != -1:
        return json.loads(content[start:end + 1])
    return {"reply": content, "feedback": None, "has_error": False}


def calculate_scores(messages_with_feedback: list) -> dict:
    user_messages = [m for m in messages_with_feedback if m.get("role") == "user"]
    ai_messages = [m for m in messages_with_feedback if m.get("role") == "assistant"]

    if not user_messages:
        return {"grammar": 70, "vocabulary": 70, "fluency": 70, "pronunciation": None, "overall": 70}

    error_count = sum(1 for m in ai_messages if m.get("has_error", False))
    total_ai = len(ai_messages)
    error_rate = error_count / total_ai if total_ai > 0 else 0
    grammar_score = max(30, round(100 - (error_rate * 70)))

    all_words = []
    for m in user_messages:
        words = m.get("content", "").lower().split()
        all_words.extend(words)
    unique_ratio = len(set(all_words)) / len(all_words) if all_words else 0.5
    avg_words_per_msg = len(all_words) / len(user_messages)
    vocabulary_score = max(30, min(100, round(
        (unique_ratio * 50) + (min(avg_words_per_msg, 20) / 20 * 50)
    )))

    lengths = [len(m.get("content", "").split()) for m in user_messages]
    avg_length = sum(lengths) / len(lengths) if lengths else 0
    fluency_score = max(30, min(100, round(min(avg_length / 12 * 100, 100))))

    confidence_scores = [
        m.get("pronunciation_score")
        for m in messages_with_feedback
        if m.get("role") == "user" and m.get("pronunciation_score") is not None
    ]
    if confidence_scores:
        avg_confidence = sum(confidence_scores) / len(confidence_scores)
        pronunciation_score = max(30, min(100, round(avg_confidence * 100)))
    else:
        pronunciation_score = None

    overall = round(
        grammar_score * 0.35 +
        vocabulary_score * 0.25 +
        fluency_score * 0.25 +
        (pronunciation_score or 70) * 0.15
    )

    return {
        "grammar": grammar_score,
        "vocabulary": vocabulary_score,
        "fluency": fluency_score,
        "pronunciation": pronunciation_score,
        "overall": overall,
    }


@router.get("/scenarios")
def get_scenarios(current_user: User = Depends(get_current_user)):
    return [
        {
            "id": k,
            "name": v["name"],
            "emoji": v["emoji"],
            "description": v["description"],
        }
        for k, v in SCENARIOS.items()
    ]


@router.get("/history")
def get_speaking_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = db.query(SpeakingSession).filter(
        SpeakingSession.user_id == current_user.id
    ).order_by(SpeakingSession.created_at.desc()).all()

    return [
        {
            "id": s.id,
            "scenario_id": s.scenario_id,
            "scenario_name": s.scenario_name,
            "overall_score": s.overall_score,
            "grammar_score": s.grammar_score,
            "vocabulary_score": s.vocabulary_score,
            "fluency_score": s.fluency_score,
            "pronunciation_score": s.pronunciation_score,
            "message_count": len(json.loads(s.messages)),
            "created_at": s.created_at.isoformat(),
        }
        for s in sessions
    ]


@router.get("/history/{session_id}")
def get_speaking_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = db.query(SpeakingSession).filter(
        SpeakingSession.id == session_id,
        SpeakingSession.user_id == current_user.id,
    ).first()

    if not session:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "id": session.id,
        "scenario_id": session.scenario_id,
        "scenario_name": session.scenario_name,
        "messages": json.loads(session.messages),
        "analysis": json.loads(session.analysis) if session.analysis else None,
        "overall_score": session.overall_score,
        "grammar_score": session.grammar_score,
        "vocabulary_score": session.vocabulary_score,
        "fluency_score": session.fluency_score,
        "pronunciation_score": session.pronunciation_score,
        "created_at": session.created_at.isoformat(),
    }


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    audio_bytes = await audio.read()

    if len(audio_bytes) < 1000:
        return {"text": "", "whisper_raw": "", "language": "en", "pronunciation_score": None}

    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = "audio.m4a"

    try:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="en",
            response_format="verbose_json",
            timestamp_granularities=["word"],
        )

        words = getattr(transcript, "words", []) or []
        if words:
            confidences = [
                w.get("probability", 1.0) if isinstance(w, dict) else getattr(w, "probability", 1.0)
                for w in words
            ]
            avg_confidence = sum(confidences) / len(confidences)
        else:
            avg_confidence = None

        return {
            "text": transcript.text,
            "whisper_raw": transcript.text,
            "language": getattr(transcript, "language", "en"),
            "pronunciation_score": avg_confidence,
        }
    except Exception as e:
        print(f"Transcribe error: {e}")
        try:
            audio_file.seek(0)
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language="en",
                response_format="text",
            )
            return {"text": transcript, "whisper_raw": transcript, "language": "en", "pronunciation_score": None}
        except Exception as e2:
            print(f"Transcribe fallback error: {e2}")
            return {"text": "", "whisper_raw": "", "language": "en", "pronunciation_score": None}


@router.post("/respond")
async def get_ai_response(
    payload: dict,
    current_user: User = Depends(get_current_user),
):
    scenario_id = payload.get("scenario_id", "free")
    history = payload.get("history", [])
    user_message = payload.get("user_message", "")

    scenario = SCENARIOS.get(scenario_id, SCENARIOS["free"])

    messages = [{"role": "system", "content": scenario["system"]}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.7,
        max_tokens=600,
    )

    content = response.choices[0].message.content
    parsed = parse_json_safe(content)

    return {
        "reply": parsed.get("reply", content),
        "feedback": parsed.get("feedback"),
        "has_error": parsed.get("has_error", False),
    }


@router.post("/tts")
async def text_to_speech(
    payload: dict,
    current_user: User = Depends(get_current_user),
):
    text = payload.get("text", "")
    voice = payload.get("voice", "nova")

    response = client.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=text,
        response_format="mp3",
    )

    audio_base64 = base64.b64encode(response.content).decode("utf-8")
    return {"audio_base64": audio_base64}


@router.post("/finish")
async def finish_session(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scenario_id = payload.get("scenario_id", "free")
    history = payload.get("history", [])
    messages_with_feedback = payload.get("messages_with_feedback", [])
    scenario = SCENARIOS.get(scenario_id, SCENARIOS["free"])

    if len(history) < 2:
        return {"analysis": "Not enough conversation to analyze."}

    scores = calculate_scores(messages_with_feedback)

    user_messages = [m["content"] for m in history if m["role"] == "user"]
    conversation_text = "\n".join([f"User: {m}" for m in user_messages])

    analysis_prompt = f"""Analyze this English speaking practice session.
Scenario: {scenario["name"]}

User's messages:
{conversation_text}

Grammar score: {scores["grammar"]}/100
Vocabulary score: {scores["vocabulary"]}/100
Fluency score: {scores["fluency"]}/100

IMPORTANT: Write all feedback directly to the user using "you/your". Never say "the user".

Provide:
1. Top 3 specific strengths (with examples from their speech, addressed to them directly)
2. Top 3 specific areas to improve (with examples, addressed to them directly)
3. Specific corrections for their mistakes
4. An encouraging message addressed directly to them

Return ONLY JSON:
{{
  "strengths": ["You did X well, for example when you said '...'", "...", "..."],
  "improvements": ["You should work on X, for example instead of '...' try '...'", "...", "..."],
  "examples": [{{"original": "what they said", "corrected": "correct version", "note": "brief explanation"}}],
  "encouragement": "encouraging message directly to them"
}}"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": analysis_prompt}],
        temperature=0.3,
        max_tokens=1000,
    )

    qualitative = parse_json_safe(response.choices[0].message.content)

    analysis = {
        "overall_score": scores["overall"],
        "grammar_score": scores["grammar"],
        "vocabulary_score": scores["vocabulary"],
        "fluency_score": scores["fluency"],
        "pronunciation_score": scores.get("pronunciation"),
        "strengths": qualitative.get("strengths", []),
        "improvements": qualitative.get("improvements", []),
        "examples": qualitative.get("examples", []),
        "encouragement": qualitative.get("encouragement", ""),
    }

    session = SpeakingSession(
        user_id=current_user.id,
        scenario_id=scenario_id,
        scenario_name=scenario["name"],
        messages=json.dumps(messages_with_feedback, ensure_ascii=False),
        overall_score=scores["overall"],
        grammar_score=scores["grammar"],
        vocabulary_score=scores["vocabulary"],
        fluency_score=scores["fluency"],
        pronunciation_score=scores.get("pronunciation"),
        analysis=json.dumps(analysis, ensure_ascii=False),
    )
    db.add(session)
    db.commit()

    return {"analysis": analysis, "session_id": session.id}