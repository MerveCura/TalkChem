from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, LevelTestAttempt, LevelTestAnswer
from app.routers.auth import get_current_user
import openai
import os
import json
import time

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
    # Her batch farklı zorluk seviyesinde ve farklı konularda sorular üretir
    # Cambridge/Oxford/EF SET tarzı gerçek seviye sınavı yapısı kullanılır
    # Konular batch'ler arasında kesinlikle çakışmaz — her batch sadece kendi konularını kullanır
    # seed: her seferinde farklı sorular üretilmesini sağlar
    seed = int(time.time()) % 10000

    # Batch 1: A1-A2 — Temel grammar ve vocabulary
    # Sadece bu konular kullanılır: present simple, past simple, articles, basic vocabulary
    if batch_no == 1:
        level_desc = "A1-A2 (beginner to elementary)"
        open_ended_instruction = "Include exactly 5 multiple_choice questions. No open_ended questions."
        topics = """ONLY use these topics for Batch 1 — do NOT use any other topics:
- Present Simple (he/she/it forms, habits, routines): "She ___ to school every day."
- Past Simple (regular/irregular verbs): "Yesterday, I ___ a great movie."
- Articles (a, an, the, zero article): "She is ___ engineer."
- Basic prepositions of place/time (in, on, at): "The meeting is ___ Monday."
- Basic vocabulary (common everyday words, numbers, colors, jobs)

FORBIDDEN topics for Batch 1: present perfect, conditionals, passive voice, modal verbs, phrasal verbs, reported speech"""

        examples = """Good examples for this level:
- "She ___ her homework every evening." → ["do", "does", "doing", "did"]
- "They ___ to Paris last summer." → ["go", "goes", "went", "gone"]
- "I have ___ appointment at 3 pm." → ["a", "an", "the", "—"]
- "The supermarket is ___ the left." → ["in", "on", "at", "by"]"""

    # Batch 2: B1 — Orta seviye grammar
    # Sadece bu konular kullanılır: present perfect, comparatives, modal verbs, common phrasal verbs
    elif batch_no == 2:
        level_desc = "B1 (intermediate)"
        open_ended_instruction = "Include exactly 1 open_ended question and 4 multiple_choice questions."
        topics = """ONLY use these topics for Batch 2 — do NOT use any other topics:
- Present Perfect (have/has + past participle, ever/never/already/yet): "Have you ___ been to Paris?"
- Comparatives and superlatives: "This is ___ book I have ever read."
- Modal verbs (should, must, might, could): "You ___ see a doctor about that cough."
- Common phrasal verbs (look after, give up, find out, carry on): "She decided to ___ smoking."
- Prepositions of movement and time (during, while, until, since)

FORBIDDEN topics for Batch 2: present simple, past simple, articles, passive voice, conditionals, reported speech"""

        examples = """Good examples for this level:
- "I ___ never tried sushi before." → ["have", "had", "has", "am"]
- "This test is ___ than the last one." → ["more difficult", "most difficult", "difficulter", "much difficult"]
- "You really ___ call your parents more often." → ["should", "must", "will", "can"]
- "She decided to ___ her bad habits." → ["give up", "give in", "give out", "give off"]"""

    # Batch 3: B2 — Üst orta seviye grammar
    # Sadece bu konular kullanılır: passive voice, conditionals, reported speech, collocations
    elif batch_no == 3:
        level_desc = "B2 (upper intermediate)"
        open_ended_instruction = "Include exactly 1 open_ended question and 4 multiple_choice questions."
        topics = """ONLY use these topics for Batch 3 — do NOT use any other topics:
- Passive Voice (all tenses): "The report ___ by the manager last week."
- Conditional sentences (Type 1, 2, 3): "If I ___ you, I would apologize immediately."
- Reported Speech (say, tell, ask): "She said she ___ finish the project by Friday."
- Collocations and fixed expressions (make/do, strong collocations): "She ___ a big mistake during the presentation."
- Advanced prepositions and linking words (despite, although, whereas, nevertheless)

FORBIDDEN topics for Batch 3: present simple, past simple, present perfect, articles, comparatives, modal verbs, phrasal verbs"""

        examples = """Good examples for this level:
- "The new bridge ___ by 2025." → ["will be completed", "will complete", "completes", "is completing"]
- "If she ___ harder, she would have passed the exam." → ["had studied", "studied", "has studied", "would study"]
- "He told me he ___ finish the report by Friday." → ["would", "will", "can", "shall"]
- "She ___ a great impression on the interviewers." → ["made", "did", "had", "took"]"""

    # Batch 4: C1-C2 — İleri seviye grammar ve vocabulary
    # Sadece bu konular kullanılır: subjunctive, complex conditionals, idioms, academic vocabulary
    else:
        level_desc = "C1-C2 (advanced to mastery)"
        open_ended_instruction = "Include exactly 5 multiple_choice questions. No open_ended questions."
        topics = """ONLY use these topics for Batch 4 — do NOT use any other topics:
- Subjunctive mood and formal structures (It is essential that he BE present): "The committee recommended that the policy ___ revised."
- Mixed and inverted conditionals: "Had she known about the meeting, she ___ attended."
- Idiomatic expressions and advanced collocations: "The new policy is ___ hot water with the employees."
- Academic and formal vocabulary (nuanced word choice, avoid basic words): "The scientist's findings ___ previous assumptions about climate change."
- Cleft sentences and advanced emphasis structures: "___ the manager who made the final decision."

FORBIDDEN topics for Batch 4: present simple, past simple, present perfect, articles, comparatives, modal verbs, basic phrasal verbs, basic vocabulary"""

        examples = """Good examples for this level:
- "The board insisted that the CEO ___ his resignation." → ["submit", "submits", "submitted", "would submit"]
- "___ I known about the risks, I would never have invested." → ["Had", "Have", "Has", "Did"]
- "The merger deal fell ___  at the last minute." → ["through", "apart", "down", "out"]
- "The researcher's findings ___ long-held assumptions." → ["undermined", "underlined", "undertook", "underscored"]"""

    start_id = (batch_no - 1) * BATCH_SIZE + 1

    return f"""You are an expert English language test designer creating a CEFR proficiency test similar to Cambridge, Oxford Placement Test, or EF SET.

Generate exactly {BATCH_SIZE} English proficiency test questions at {level_desc} CEFR level.

{open_ended_instruction}

{topics}

{examples}

STRICT RULES:
- Questions MUST strictly follow the topic list above — no exceptions
- Every multiple_choice MUST have exactly 4 options
- Questions must be self-contained, no reading passage references
- Start question ids from {start_id}
- Use natural, real-world English sentences — not artificial or textbook-sounding
- open_ended: ask student to write 2-3 sentences on a real-life situation
- Vary sentence structures — do not repeat the same pattern
- SEED: {seed} — use this to ensure variety

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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user)
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
    db.flush()

    for question, answer in zip(questions, answers):
        is_open = question.get("type") == "open_ended"
        db_answer = LevelTestAnswer(
            attempt_id=attempt.id,
            question_text=question.get("question", ""),
            question_type=question.get("type", ""),
            user_answer=str(answer),
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