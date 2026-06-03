from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, ShadowingSession
from app.routers.auth import get_current_user
import openai
import os
import json
import io
import base64
import re

router = APIRouter(prefix="/api/shadowing", tags=["shadowing"])

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

CATEGORIES = {
    "daily": "Daily Conversations",
    "job-interview": "Job Interview",
    "cafe": "At the Café",
    "supermarket": "At the Supermarket",
    "doctor": "Doctor's Appointment",
    "airport": "At the Airport",
}

DIFFICULTY_MAP = {
    1: "easy", 2: "easy",
    3: "medium", 4: "medium", 5: "medium",
    6: "medium", 7: "medium", 8: "medium",
    9: "hard", 10: "hard",
}

DIFFICULTY_INSTRUCTIONS = {
    "easy": "EASY level: Very short sentence, max 6 words. Simple vocabulary. A1-A2 level.",
    "medium": "MEDIUM level: Natural, everyday sentence, 8-12 words. B1-B2 level.",
    "hard": "HARD level: More complex sentence, 13-18 words. C1 level, richer vocabulary.",
}

CATEGORY_PROMPTS = {
    "daily": {
        "context": "everyday casual conversations — with friends, colleagues, neighbors, or strangers",
        "situations": """Cover a wide variety of everyday situations:
- Greeting someone and asking how they are
- Making plans or suggesting something
- Talking about your day, week, or weekend
- Expressing feelings or opinions
- Apologizing or thanking someone
- Making small talk about weather, news, or surroundings
- Asking for or giving advice
- Talking about habits and routines
- Expressing agreement or disagreement politely
- Saying goodbye or wrapping up a conversation""",
        "examples": {
            "easy": ["I'm doing well, thanks for asking.", "Let's grab lunch together.", "It's really cold today, isn't it?"],
            "medium": ["I've been really busy lately but I'm managing to keep up.", "We should catch up sometime, it's been a while.", "I completely forgot about that, thanks for reminding me."],
            "hard": ["I've been meaning to reach out sooner, but things have been unexpectedly hectic on my end.", "Honestly, I think the best approach would be to take it one step at a time rather than rushing into anything."],
        },
    },
    "job-interview": {
        "context": "a professional job interview from start to finish",
        "situations": """Cover the full arc of a job interview:
- Greeting the interviewer when you walk in
- Introducing yourself briefly
- Talking about your educational background
- Describing your work experience
- Explaining your strengths and skills
- Talking about a challenge you overcame
- Explaining why you want this job
- Describing how you work in a team
- Asking the interviewer a question about the role or company
- Thanking the interviewer and closing the conversation""",
        "examples": {
            "easy": ["Thank you for having me today.", "I studied business at university.", "I enjoy working with people."],
            "medium": ["I have three years of experience working in customer service.", "My greatest strength is my ability to stay calm under pressure.", "I'm particularly drawn to this role because of the growth opportunities it offers."],
            "hard": ["One of the most challenging projects I handled involved coordinating between three departments under a very tight deadline.", "I'd love to learn more about how the team typically approaches professional development and whether there are mentoring opportunities."],
        },
    },
    "cafe": {
        "context": "a café visit from start to finish",
        "situations": """Cover everything that can happen at a café:
- Asking for a table or finding a seat
- Looking at the menu and asking about items
- Ordering drinks and food
- Asking for modifications (dairy-free, less sugar, to go, etc.)
- Asking about wait times or ingredients
- Complimenting the food or drink
- Asking for the bill or to pay
- Dealing with a wrong order politely
- Asking for recommendations from the barista
- Making small talk with the staff""",
        "examples": {
            "easy": ["I'll have a black coffee, please.", "Can I get this to go?", "Do you have oat milk?"],
            "medium": ["Could I get a medium latte with oat milk and no sugar, please?", "What would you recommend if I want something not too sweet?", "Excuse me, I think there's been a mix-up with my order."],
            "hard": ["I'm trying to avoid caffeine at the moment — do you have any herbal teas or decaf options that you'd particularly recommend?", "Could you let me know what's in the seasonal special? I have a nut allergy and I want to make sure it's safe for me."],
        },
    },
    "supermarket": {
        "context": "a supermarket or grocery store visit",
        "situations": """Cover all typical supermarket interactions:
- Asking where to find a specific product
- Asking about product availability or alternatives
- Asking about prices or discounts
- Asking a staff member for a recommendation
- Asking about the freshness or expiry of something
- Dealing with a damaged or incorrect item
- Asking about store policies
- Talking to the cashier at checkout
- Making small talk with staff""",
        "examples": {
            "easy": ["Excuse me, where are the eggs?", "Is this on sale this week?", "Do you have a larger size?"],
            "medium": ["I can't seem to find the gluten-free section — could you point me in the right direction?", "Do you know if this product is available in a different flavor?", "I bought this yesterday and it was already expired when I opened it."],
            "hard": ["I noticed the price on the shelf said five pounds but I was charged six at the register — could you help me sort that out?", "I'm looking for a specific type of cheese I saw advertised in your flyer last week, but I can't find it anywhere on the shelves."],
        },
    },
    "doctor": {
        "context": "a doctor's appointment from check-in to wrap-up",
        "situations": """Cover the full doctor's appointment experience:
- Checking in at the reception
- Explaining why you've come in today
- Describing symptoms clearly
- Answering the doctor's questions about your history
- Mentioning allergies or existing medications
- Asking what the diagnosis might be
- Asking about treatment options
- Asking about side effects of medication
- Asking how long recovery will take
- Following up or scheduling another appointment""",
        "examples": {
            "easy": ["I have a headache since yesterday.", "I'm allergic to penicillin.", "It hurts when I swallow."],
            "medium": ["I've had a sore throat and mild fever for about three days now.", "The pain is mostly on my lower right side and gets worse when I move.", "How long should I take this before I start feeling better?"],
            "hard": ["I've been experiencing recurring headaches every afternoon for the past two weeks, accompanied by some sensitivity to light.", "I want to make sure I understand the dosage correctly — should I take this with food, and are there any foods I should avoid?"],
        },
    },
    "airport": {
        "context": "an airport experience from arrival to boarding",
        "situations": """Cover the full airport journey:
- Approaching the check-in counter
- Asking about seat preferences
- Checking in luggage and asking about weight limits
- Going through security and customs
- Asking for directions to a gate or facility
- Asking about flight delays or changes
- Dealing with a missed flight or baggage issue
- Boarding the plane and talking to cabin crew""",
        "examples": {
            "easy": ["I'd like a window seat, please.", "Where is gate B12?", "Is my flight on time?"],
            "medium": ["I'd like to check in this bag and keep my carry-on with me.", "Could you tell me how far gate C22 is from here?", "I think my flight has been delayed — where can I get more information?"],
            "hard": ["I missed my connecting flight due to a delay — could you help me find the next available option and see if my checked luggage has been rerouted?", "I wasn't aware that my carry-on exceeds the size limit — is there any way to check it in at the gate without paying the full fee?"],
        },
    },
}


def clean_text(text: str) -> list:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\s+", " ", text)
    return [w for w in text.split() if w]


def compare_sentences(original: str, spoken: str) -> dict:
    original_words = clean_text(original)
    spoken_words = clean_text(spoken)

    if not original_words:
        return {"accuracy": 0, "correct_words": 0, "total_words": 0, "wrong_words": [], "missing_words": [], "extra_words": [], "is_correct": False}

    original_set = set(original_words)
    spoken_set = set(spoken_words)
    correct = len(original_set & spoken_set)
    missing = list(original_set - spoken_set)
    extra = list(spoken_set - original_set)

    wrong_words = []
    min_len = min(len(original_words), len(spoken_words))
    for i in range(min_len):
        if original_words[i] != spoken_words[i] and original_words[i] not in spoken_set:
            wrong_words.append({"expected": original_words[i], "said": spoken_words[i]})

    total = len(original_words)
    accuracy = round((correct / total) * 100) if total > 0 else 0

    return {
        "accuracy": accuracy,
        "correct_words": correct,
        "total_words": total,
        "wrong_words": wrong_words[:3],
        "missing_words": missing[:3],
        "extra_words": extra[:3],
        "is_correct": accuracy >= 70,
    }


def build_pronunciation_feedback(original: str, spoken: str, comparison: dict) -> str:
    if not spoken or not original:
        return ""
    original_words = clean_text(original)
    spoken_words = clean_text(spoken)
    spoken_set = set(spoken_words)
    pron_issues = []
    for orig_word in original_words:
        if orig_word not in spoken_set and len(orig_word) > 3:
            for sp_word in spoken_words:
                if sp_word not in set(original_words) and len(sp_word) > 2:
                    if abs(len(orig_word) - len(sp_word)) <= 2:
                        pron_issues.append(f'"{orig_word}" → you said "{sp_word}"')
                        break
    if pron_issues:
        return "🗣️ " + ", ".join(pron_issues[:2])
    return ""


@router.get("/categories")
def get_categories(current_user: User = Depends(get_current_user)):
    return [{"id": k, "name": v} for k, v in CATEGORIES.items()]


@router.post("/sentence")
async def get_sentence(
    payload: dict,
    current_user: User = Depends(get_current_user),
):
    category = payload.get("category", "daily")
    sentence_no = payload.get("sentence_no", 1)
    exclude_sentences = payload.get("exclude_sentences", [])

    cat = CATEGORY_PROMPTS.get(category, CATEGORY_PROMPTS["daily"])
    difficulty = DIFFICULTY_MAP.get(sentence_no, "medium")
    difficulty_instruction = DIFFICULTY_INSTRUCTIONS[difficulty]
    examples = cat["examples"].get(difficulty, cat["examples"]["medium"])
    examples_text = "\n".join([f'- "{ex}"' for ex in examples])

    exclude_text = ""
    if exclude_sentences:
        exclude_text = f"\nDo NOT use any of these sentences: {json.dumps(exclude_sentences[:10])}"

    prompt = f"""You are generating sentences for an English shadowing practice app.

Scenario: {cat["context"]}
Sentence number: {sentence_no} of 10
Difficulty: {difficulty_instruction}

What to cover in this scenario:
{cat["situations"]}

Example sentences at this difficulty level:
{examples_text}
{exclude_text}

Rules:
- Generate exactly ONE sentence that someone would actually say in this scenario
- Match the difficulty level strictly
- Do NOT use questions — use statements only
- The sentence must sound completely natural

Also identify any phrasal verbs, fixed expressions, or multi-word phrases in the sentence that have a special meaning together (e.g. "look after", "to go", "come up with", "window seat", "check in").

Return ONLY a JSON object, nothing else:
{{
  "sentence": "Your sentence here.",
  "tip": "One short pronunciation tip for a specific word in this sentence",
  "phrases": ["phrase1", "phrase2"]
}}

If there are no special phrases, return an empty array for phrases."""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.9,
        max_tokens=200,
    )

    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()

    data = json.loads(content)
    return {
        "sentence": data.get("sentence", ""),
        "tip": data.get("tip", ""),
        "phrases": data.get("phrases", []),
        "sentence_no": sentence_no,
        "category": category,
    }


@router.post("/translate")
async def translate_word(
    payload: dict,
    current_user: User = Depends(get_current_user),
):
    word = payload.get("word", "").strip()
    sentence = payload.get("sentence", "").strip()

    if not word:
        return {"word": word, "translation": "", "explanation": ""}

    prompt = f"""Translate the English word or phrase "{word}" to Turkish, in the context of this sentence:
"{sentence}"

Return ONLY a JSON object:
{{
  "translation": "Turkish translation",
  "explanation": "One short sentence explaining what this means in this context (in Turkish)"
}}"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=100,
    )

    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()

    data = json.loads(content)
    return {
        "word": word,
        "translation": data.get("translation", ""),
        "explanation": data.get("explanation", ""),
    }


@router.post("/tts")
async def text_to_speech(
    payload: dict,
    current_user: User = Depends(get_current_user),
):
    text = payload.get("text", "")
    response = client.audio.speech.create(
        model="tts-1",
        voice="nova",
        input=text,
        response_format="mp3",
    )
    audio_base64 = base64.b64encode(response.content).decode("utf-8")
    return {"audio_base64": audio_base64}


@router.post("/evaluate")
async def evaluate_shadowing(
    audio: UploadFile = File(...),
    sentence: str = Form(""),
    current_user: User = Depends(get_current_user),
):
    audio_bytes = await audio.read()

    if len(audio_bytes) < 500:
        return {"spoken_text": "", "accuracy": 0, "is_correct": False, "wrong_words": [], "missing_words": [], "pronunciation_feedback": "", "error": "Audio too short"}

    audio_file = io.BytesIO(audio_bytes)
    audio_file.name = "audio.m4a"

    try:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="en",
            response_format="text",
        )
        spoken_text = transcript.strip() if isinstance(transcript, str) else transcript.text.strip()
    except Exception as e:
        print(f"Whisper error: {e}")
        return {"spoken_text": "", "accuracy": 0, "is_correct": False, "wrong_words": [], "missing_words": [], "pronunciation_feedback": "", "error": "Could not transcribe audio"}

    comparison = compare_sentences(sentence, spoken_text)
    pron_feedback = build_pronunciation_feedback(sentence, spoken_text, comparison)

    return {
        "spoken_text": spoken_text,
        "accuracy": comparison["accuracy"],
        "is_correct": comparison["is_correct"],
        "correct_words": comparison["correct_words"],
        "total_words": comparison["total_words"],
        "wrong_words": comparison["wrong_words"],
        "missing_words": comparison["missing_words"],
        "extra_words": comparison["extra_words"],
        "pronunciation_feedback": pron_feedback,
    }


@router.post("/finish")
async def finish_session(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    category = payload.get("category", "daily")
    level = payload.get("level", "B1")
    sentences = payload.get("sentences", [])

    total = len(sentences)
    correct = sum(1 for s in sentences if s.get("is_correct", False))
    accuracy = round((correct / total) * 100) if total > 0 else 0

    session = ShadowingSession(
        user_id=current_user.id,
        level=level,
        category=category,
        total_sentences=total,
        correct_sentences=correct,
        accuracy_score=accuracy,
        sentences=json.dumps(sentences, ensure_ascii=False),
    )
    db.add(session)
    db.commit()

    return {"session_id": session.id, "total_sentences": total, "correct_sentences": correct, "accuracy_score": accuracy}


@router.get("/history")
def get_shadowing_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = db.query(ShadowingSession).filter(
        ShadowingSession.user_id == current_user.id
    ).order_by(ShadowingSession.created_at.desc()).all()

    return [
        {
            "id": s.id,
            "level": s.level,
            "category": s.category,
            "category_name": CATEGORIES.get(s.category, s.category),
            "total_sentences": s.total_sentences,
            "correct_sentences": s.correct_sentences,
            "accuracy_score": s.accuracy_score,
            "created_at": s.created_at.isoformat(),
        }
        for s in sessions
    ]