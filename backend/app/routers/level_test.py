from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, LevelTestAttempt, LevelTestAnswer
from app.routers.auth import get_current_user
import openai
import os
import json

router = APIRouter(prefix="/api/level-test", tags=["level-test"])

# OpenAI istemcisi modül seviyesinde bir kez oluşturulur
# Her request'te yeniden oluşturmak gereksiz kaynak tüketir
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Batch önbelleği: 5'er soruluk grupları tutar
# key: (user_id, batch_no) → value: 5 soruluk liste
# Uygulama yeniden başlatılınca temizlenir
question_cache: dict[tuple, list] = {}

TOTAL_QUESTIONS = 20
BATCH_SIZE = 5
TOTAL_BATCHES = TOTAL_QUESTIONS // BATCH_SIZE  # 4 batch


# ── Prompt Fonksiyonları ──────────────────────────────────────────────────────

def build_batch_prompt(batch_no: int) -> str:
    # Her batch farklı zorluk seviyesinde sorular üretir
    # Batch 1 → A1-A2, Batch 2 → B1, Batch 3 → B2, Batch 4 → C1-C2
    # temperature=0.8: yüksek çeşitlilik — her seferinde farklı sorular üretilir
    level_map = {
        1: "A1-A2 (beginner to elementary)",
        2: "B1 (intermediate)",
        3: "B2 (upper intermediate)",
        4: "C1-C2 (advanced to mastery)",
    }
    level_desc = level_map.get(batch_no, "B1")
    start_id = (batch_no - 1) * BATCH_SIZE + 1

    # Batch 2 ve 3'te 1 açık uçlu soru olur, diğerlerinde sadece çoktan seçmeli
    if batch_no == 2:
        open_ended_instruction = "Include exactly 1 open_ended question and 4 multiple_choice questions."
    elif batch_no == 3:
        open_ended_instruction = "Include exactly 1 open_ended question and 4 multiple_choice questions."
    else:
        open_ended_instruction = "Include exactly 5 multiple_choice questions. No open_ended questions."

    return f"""Generate exactly {BATCH_SIZE} English proficiency test questions at {level_desc} CEFR level.

{open_ended_instruction}

STRICT RULES:
- Questions MUST test English grammar or vocabulary — NOT personal preferences or opinions
- Every multiple_choice MUST have exactly 4 options
- Questions must be self-contained, no reading passage references
- Start question ids from {start_id}
- Cover these topics naturally: verb tenses, articles, prepositions, modal verbs, conditional sentences, phrasal verbs, vocabulary, idioms, reported speech, passive voice
- Use real-world everyday English — similar to Cambridge, Oxford, or EF SET style tests
- open_ended: ask student to write 2-3 sentences (e.g. "Describe a time when you had to make a difficult decision.")

Good examples:
- "She ___ her homework before dinner." → ["had finished", "has finished", "finished", "would finish"]
- "If I ___ you, I would apologize." → ["were", "am", "was", "be"]
- "He's very good ___ playing the piano." → ["at", "in", "on", "for"]
- "The meeting has been ___." → ["postponed", "postponing", "postpone", "to postpone"]
- "What ___ when I called you?" → ["did you do", "were you doing", "have you done", "do you do"]

Return ONLY a JSON array, no other text:
[
  {{
    "id": {start_id},
    "type": "multiple_choice",
    "level": "A1",
    "question": "She ___ to school every day.",
    "options": ["walk", "walks", "walking", "walked"],
    "correct_answer": "walks"
  }},
  {{
    "id": {start_id + 1},
    "type": "open_ended",
    "level": "B1",
    "question": "Describe a time when you had to make a difficult decision.",
    "correct_answer": null
  }}
]"""


def build_open_ended_eval_prompt(open_questions: list) -> str:
    # Açık uçlu soruların değerlendirilmesi için prompt
    # json.dumps ile dict list'i string'e çevrilir — f-string içinde dict kullanımı TypeError verir
    # temperature=0.3: düşük değer tutarlı ve öngörülebilir puanlama sağlar
    questions_text = json.dumps([
        {"question": q.get("question"), "level": q.get("level"), "answer": a}
        for q, a in open_questions
    ], ensure_ascii=False, indent=2)

    return f"""You are an English language examiner. Evaluate these short answers.
For each answer give a score 0-5 based on grammar, vocabulary, and clarity.
5=Excellent, 4=Good, 3=Acceptable, 2=Weak, 1=Very weak, 0=No answer

Questions and answers:
{questions_text}

Return ONLY a JSON array, no other text:
[
  {{"question_index": 0, "score": 4}}
]"""


def build_feedback_prompt(total_score: int, level: str) -> str:
    # Kullanıcıya geri bildirim vermek için prompt
    # temperature=0.5: orta değer — hem tutarlı hem doğal bir dil sağlar
    return f"""The student scored {total_score}/100 on an English CEFR test and their level is {level}.
Write a short, encouraging 2-sentence feedback about their performance.
Return ONLY a JSON object, no other text:
{{
  "feedback": "Your feedback here.",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"]
}}"""


# ── Yardımcı Fonksiyonlar ─────────────────────────────────────────────────────

def parse_json_response(content: str) -> any:
    # OpenAI bazen yanıtı ```json ... ``` bloğu içinde döner
    # Bu fonksiyon her iki durumu da işler: düz JSON veya kod bloğu içinde JSON
    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    return json.loads(content.strip())


def normalize_questions(questions: list) -> list:
    # fill_in_the_blank tipi istenmedi ama model bazen üretebilir
    # Seçeneği varsa multiple_choice'a, yoksa open_ended'a dönüştürülür
    for q in questions:
        if q.get("type") == "fill_in_the_blank":
            if q.get("options") and len(q.get("options", [])) > 0:
                q["type"] = "multiple_choice"
            else:
                q["type"] = "open_ended"
                q["options"] = []
        if q.get("type") == "multiple_choice" and not q.get("options"):
            q["type"] = "open_ended"
            q["options"] = []
    return questions


def determine_level(score: int) -> str:
    # Seviye belirleme AI'ya bırakılmaz — deterministik eşik değerleriyle yapılır
    # AI seviye belirlemede tutarsız olabilir, bu yüzden sabit kurallar kullanılır
    if score >= 90:
        return "C2"
    elif score >= 80:
        return "C1"
    elif score >= 70:
        return "B2"
    elif score >= 45:
        return "B1"
    elif score >= 30:
        return "A2"
    else:
        return "A1"


def generate_batch_sync(user_id: int, batch_no: int):
    # Arka planda çalışan senkron fonksiyon
    # Bir sonraki batch'i üretip cache'e yazar, kullanıcı beklemez
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": build_batch_prompt(batch_no)}],
        temperature=0.8,
        max_tokens=2000,
    )
    questions = parse_json_response(response.choices[0].message.content)
    questions = normalize_questions(questions)
    question_cache[(user_id, batch_no)] = questions


# ── Endpoint'ler ──────────────────────────────────────────────────────────────

@router.get("/questions/batch/{batch_no}")
async def get_question_batch(
    batch_no: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),  # JWT zorunlu
    db: Session = Depends(get_db)
):
    if batch_no < 1 or batch_no > TOTAL_BATCHES:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"batch_no must be between 1 and {TOTAL_BATCHES}")

    user_id = current_user.id
    cache_key = (user_id, batch_no)

    # Cache'de bu batch hazırsa direkt dön — kullanıcı beklemez
    if cache_key in question_cache:
        questions = question_cache.pop(cache_key)
        # Bir sonraki batch için arka planda üretim başlat
        next_batch = batch_no + 1
        if next_batch <= TOTAL_BATCHES and (user_id, next_batch) not in question_cache:
            background_tasks.add_task(generate_batch_sync, user_id, next_batch)
        return {
            "questions": questions,
            "batch_no": batch_no,
            "total_batches": TOTAL_BATCHES,
            "is_last_batch": batch_no == TOTAL_BATCHES,
        }

    # Cache'de yoksa senkron olarak üret
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": build_batch_prompt(batch_no)}],
        temperature=0.8,
        max_tokens=2000,
    )
    questions = parse_json_response(response.choices[0].message.content)
    questions = normalize_questions(questions)

    # Bir sonraki batch arka planda hazırla
    next_batch = batch_no + 1
    if next_batch <= TOTAL_BATCHES and (user_id, next_batch) not in question_cache:
        background_tasks.add_task(generate_batch_sync, user_id, next_batch)

    return {
        "questions": questions,
        "batch_no": batch_no,
        "total_batches": TOTAL_BATCHES,
        "is_last_batch": batch_no == TOTAL_BATCHES,
    }


@router.post("/submit")
async def submit_answers(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # JWT zorunlu
):
    answers = payload.get("answers", [])
    questions = payload.get("questions", [])

    # Çoktan seçmeli sorular: 18 soru → max 85 puan
    mc_questions = [
        (q, a) for q, a in zip(questions, answers)
        if q.get("type") == "multiple_choice"
    ]
    mc_correct = sum(1 for q, a in mc_questions if q.get("correct_answer") == a)
    mc_score = round((mc_correct / max(len(mc_questions), 1)) * 85)

    # Açık uçlu sorular: 2 soru × max 5 puan = max 10 puan
    # correct_answer DB'de None olarak saklanır çünkü bu tür soruların
    # tek bir doğru cevabı yoktur — AI gramer, kelime ve netliğe göre puanlar
    open_questions = [
        (q, a) for q, a in zip(questions, answers)
        if q.get("type") == "open_ended"
    ]
    open_score = 0

    if open_questions:
        open_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": build_open_ended_eval_prompt(open_questions)}],
            temperature=0.3,
            max_tokens=200,
        )
        open_results = parse_json_response(open_response.choices[0].message.content)
        for r in open_results:
            open_score += r.get("score", 0)

    # Toplam skor 100'ü geçemez
    total_score = min(100, mc_score + open_score)

    # Seviye deterministik olarak belirlenir, AI'ya bırakılmaz
    level = determine_level(total_score)

    # Geri bildirim için ayrı bir API çağrısı yapılır
    feedback_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": build_feedback_prompt(total_score, level)}],
        temperature=0.5,
        max_tokens=300,
    )
    feedback_result = parse_json_response(feedback_response.choices[0].message.content)

    # Sınav sonuçları DB'ye kaydedilir
    attempt = LevelTestAttempt(
        user_id=current_user.id,
        level=level,
        score=total_score
    )
    db.add(attempt)
    db.flush()  # id üretilsin ama commit atılmasın — cevaplar da aynı transaction'da kaydedilsin

    for question, answer in zip(questions, answers):
        is_open = question.get("type") == "open_ended"
        db_answer = LevelTestAnswer(
            attempt_id=attempt.id,
            question_text=question.get("question", ""),
            question_type=question.get("type", ""),
            user_answer=str(answer),
            # Açık uçlu soruların tek bir doğru cevabı olmadığı için None kaydedilir
            # Puanlama AI tarafından gramer ve netlik kriterlerine göre yapılır
            correct_answer=question.get("correct_answer") if not is_open else None,
            question_level=question.get("level", "")
        )
        db.add(db_answer)

    # Kullanıcının seviyesi güncellenir
    current_user.english_level = level
    db.commit()

    # Sınav tamamlandı, bu kullanıcıya ait kalan cache temizlenir
    keys_to_delete = [k for k in question_cache if k[0] == current_user.id]
    for k in keys_to_delete:
        del question_cache[k]

    return {
        "level": level,
        "score": total_score,
        "feedback": feedback_result.get("feedback", ""),
        "strengths": feedback_result.get("strengths", []),
        "weaknesses": feedback_result.get("weaknesses", [])
    }