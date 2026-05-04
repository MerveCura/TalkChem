import openai
import os
import json
import asyncio
from sqlalchemy.orm import Session
from app.models import TenseQuestionPool, VocabularyWord
from app.database import SessionLocal

client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

ALL_TENSES = [
    "present-simple", "present-continuous", "present-perfect",
    "present-perfect-continuous", "past-simple", "past-continuous",
    "past-perfect", "past-perfect-continuous", "future-simple",
    "future-continuous", "future-perfect", "future-perfect-continuous",
]

ALL_CATEGORIES = [
    "daily-life", "travel", "business", "food", "technology",
    "health", "education", "nature", "sports", "emotions",
    "shopping", "family", "art", "science", "social-media",
    "home", "weather", "transportation", "entertainment", "law-politics",
]

POOL_MIN_THRESHOLD = 10
POOL_TARGET = 30
VOCAB_TARGET = 30

# Her tense için kural, yaygın hatalar ve örnek sorular
TENSE_DETAILS = {
    "present-simple": {
        "rule": "Subject + V1 (he/she/it → V1+s/es). Negatives: don't/doesn't + V1. Questions: Do/Does + subject + V1?",
        "uses": "habits, routines, facts, general truths, timetables",
        "common_mistakes": "forgetting -s for he/she/it, using 'do' instead of 'does', using present continuous for habits",
        "example_questions": [
            "She ___ (go) to the gym every Monday. → goes",
            "He doesn't ___ (like) coffee. → like",
            "___ they ___ (work) on weekends? → Do / work",
        ]
    },
    "present-continuous": {
        "rule": "Subject + am/is/are + V-ing. Negatives: am/is/are + not + V-ing.",
        "uses": "actions happening now, temporary situations, future arrangements, annoying habits (always)",
        "common_mistakes": "using with stative verbs (know, want, like), forgetting -ing, wrong auxiliary",
        "example_questions": [
            "She ___ (study) for her exam right now. → is studying",
            "They ___ (not/watch) TV at the moment. → aren't watching",
            "We ___ (meet) the client tomorrow. → are meeting",
        ]
    },
    "present-perfect": {
        "rule": "Subject + have/has + past participle (V3). Negatives: haven't/hasn't + V3.",
        "uses": "past actions with present relevance, life experiences, recent actions (just/already/yet), unfinished time periods",
        "common_mistakes": "using past simple instead, wrong past participle, confusing 'since' and 'for'",
        "example_questions": [
            "She ___ (live) here since 2010. → has lived",
            "I ___ (never/try) sushi before. → have never tried",
            "___ you ___ (finish) your homework yet? → Have / finished",
        ]
    },
    "present-perfect-continuous": {
        "rule": "Subject + have/has + been + V-ing.",
        "uses": "actions that started in past and continue now, emphasising duration, explaining a present result",
        "common_mistakes": "confusing with present perfect simple, forgetting 'been', using with stative verbs",
        "example_questions": [
            "She ___ (work) here for ten years. → has been working",
            "How long ___ you ___ (wait)? → have / been waiting",
            "He looks tired because he ___ (study) all night. → has been studying",
        ]
    },
    "past-simple": {
        "rule": "Subject + V2 (regular: +ed, irregular: see list). Negatives: didn't + V1. Questions: Did + subject + V1?",
        "uses": "completed actions in the past, sequences of past events, past habits/states",
        "common_mistakes": "using V2 after did/didn't, wrong irregular past form, confusing with present perfect",
        "example_questions": [
            "She ___ (go) to Paris last summer. → went",
            "He didn't ___ (finish) his homework. → finish",
            "___ they ___ (enjoy) the concert? → Did / enjoy",
        ]
    },
    "past-continuous": {
        "rule": "Subject + was/were + V-ing.",
        "uses": "actions in progress at a past time, interrupted past actions (with past simple), parallel past actions, background in stories",
        "common_mistakes": "using past simple instead, wrong auxiliary (was/were), forgetting -ing",
        "example_questions": [
            "I ___ (read) when the phone rang. → was reading",
            "They ___ (not/sleep) at midnight. → weren't sleeping",
            "What ___ you ___ (do) at 8pm yesterday? → were / doing",
        ]
    },
    "past-perfect": {
        "rule": "Subject + had + past participle (V3). Negatives: hadn't + V3.",
        "uses": "actions completed before another past action, reported speech, third conditional",
        "common_mistakes": "confusing with past simple, wrong past participle, overusing it",
        "example_questions": [
            "By the time she arrived, he ___ (leave). → had left",
            "She failed because she ___ (not/study). → hadn't studied",
            "He said he ___ (see) that film before. → had seen",
        ]
    },
    "past-perfect-continuous": {
        "rule": "Subject + had + been + V-ing.",
        "uses": "duration of an action before another past event, explaining a past result, emphasising continuity",
        "common_mistakes": "confusing with past perfect simple, forgetting 'been', using with stative verbs",
        "example_questions": [
            "She was tired because she ___ (drive) for six hours. → had been driving",
            "How long ___ he ___ (wait) when she arrived? → had / been waiting",
            "They ___ (live) there for years before they moved. → had been living",
        ]
    },
    "future-simple": {
        "rule": "Subject + will + V1 (bare infinitive). Negatives: won't + V1.",
        "uses": "predictions, spontaneous decisions, promises, offers, facts about the future",
        "common_mistakes": "using 'will' for plans (use going to), adding -s after will, confusing with going to",
        "example_questions": [
            "I think it ___ (rain) tomorrow. → will rain",
            "Don't worry, I ___ (help) you. → will help",
            "She ___ (not/be) at the meeting. → won't be",
        ]
    },
    "future-continuous": {
        "rule": "Subject + will + be + V-ing.",
        "uses": "actions in progress at a specific future time, polite questions about plans, actions that will be ongoing",
        "common_mistakes": "confusing with future simple, forgetting 'be', forgetting -ing",
        "example_questions": [
            "At 8pm, she ___ (cook) dinner. → will be cooking",
            "This time next week, I ___ (fly) to New York. → will be flying",
            "___ you ___ (use) the car tomorrow afternoon? → Will / be using",
        ]
    },
    "future-perfect": {
        "rule": "Subject + will + have + past participle (V3).",
        "uses": "actions that will be completed before a specific future time",
        "common_mistakes": "confusing with future simple, wrong past participle, forgetting 'have'",
        "example_questions": [
            "By 2030, they ___ (build) the new bridge. → will have built",
            "She ___ (finish) the report by Monday. → will have finished",
            "___ you ___ (read) the book by next week? → Will / have read",
        ]
    },
    "future-perfect-continuous": {
        "rule": "Subject + will + have + been + V-ing.",
        "uses": "duration of an action up to a specific future point",
        "common_mistakes": "confusing with future perfect simple, forgetting 'been', using with stative verbs",
        "example_questions": [
            "By June, she ___ (teach) for twenty years. → will have been teaching",
            "They ___ (wait) for three hours by the time we arrive. → will have been waiting",
            "In 2025, I ___ (study) English for a decade. → will have been studying",
        ]
    },
}


# ── Tense Soru Üretimi ────────────────────────────────────────────────────────

def build_tense_pool_prompt(tense_id: str, count: int) -> str:
    tense_name = tense_id.replace("-", " ").title()
    details = TENSE_DETAILS.get(tense_id, {})
    rule = details.get("rule", "")
    uses = details.get("uses", "")
    mistakes = details.get("common_mistakes", "")
    examples = details.get("example_questions", [])

    return f"""You are an expert English grammar teacher creating high-quality quiz questions for the {tense_name} tense.

TENSE INFORMATION:
- Rule: {rule}
- Common uses: {uses}
- Common mistakes to test: {mistakes}
- Example question styles: {json.dumps(examples)}

Generate exactly {count} multiple choice questions about the {tense_name} tense.

QUALITY REQUIREMENTS:
- Questions must feel like Cambridge or IELTS exam questions — professional and natural
- Use realistic, everyday contexts (work, travel, relationships, daily life)
- All 4 options must be plausible and grammatically structured — no obviously wrong options
- Mix question types: fill-in-the-blank sentences, error correction, choosing the correct form
- Mix difficulty: some easy, some medium, some hard
- Each question must clearly test the {tense_name} tense specifically
- correct_answer must be the FULL TEXT of the correct option, never a letter like "a" or "b"
- Never repeat the same sentence structure twice

Return ONLY a valid JSON array, no markdown:
[{{"type":"multiple_choice","question":"...","options":["opt1","opt2","opt3","opt4"],"correct_answer":"full text of correct option","explanation":"brief explanation of why this is correct","difficulty":"easy|medium|hard"}}]"""


async def generate_tense_questions_async(tense_id: str, count: int) -> list:
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": build_tense_pool_prompt(tense_id, count)}],
            temperature=0.8,
            max_tokens=2000,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        return json.loads(content.strip())
    except Exception:
        return []


def save_tense_questions_to_pool(tense_id: str, questions: list, db: Session):
    for q in questions:
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
    db.commit()


def get_pool_count(tense_id: str, db: Session) -> int:
    return db.query(TenseQuestionPool).filter(
        TenseQuestionPool.tense_id == tense_id,
    ).count()


# ── Vocabulary Kelime Üretimi ─────────────────────────────────────────────────

def build_vocab_prompt(category: str, level: str, existing_words: list, count: int) -> str:
    return f"""Generate {count} English vocabulary words for "{category}" at CEFR "{level}" level.
Do NOT repeat: {json.dumps(existing_words[:20])}
Return ONLY JSON array:
[{{"word":"...","meaning":"...","meaning_tr":"...","example_sentence":"...","pronunciation":"..."}}]"""


async def generate_vocab_async(category: str, level: str, existing_words: list, count: int) -> list:
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": build_vocab_prompt(category, level, existing_words, count)}],
            temperature=0.8,
            max_tokens=1000,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("```")[1]
            if content.startswith("json"):
                content = content[4:]
        return json.loads(content.strip())
    except Exception:
        return []


def save_vocab_to_db(category: str, level: str, words: list, db: Session):
    for w in words:
        db_word = VocabularyWord(
            category=category,
            level=level,
            word=w.get("word", ""),
            meaning=w.get("meaning", ""),
            meaning_tr=w.get("meaning_tr", ""),
            example_sentence=w.get("example_sentence", ""),
            pronunciation=w.get("pronunciation", ""),
        )
        db.add(db_word)
    db.commit()


def get_vocab_count(category: str, level: str, db: Session) -> int:
    return db.query(VocabularyWord).filter(
        VocabularyWord.category == category,
        VocabularyWord.level == level
    ).count()


# ── Ana Pre-generation Fonksiyonu ─────────────────────────────────────────────

async def pregenerate_for_user(user_level: str):
    db = SessionLocal()
    try:
        tense_tasks = []
        tenses_to_fill = []

        for tense_id in ALL_TENSES:
            count = get_pool_count(tense_id, db)
            if count < POOL_MIN_THRESHOLD:
                needed = POOL_TARGET - count
                tenses_to_fill.append((tense_id, needed))
                tense_tasks.append(generate_tense_questions_async(tense_id, needed))

        if tense_tasks:
            tense_results = await asyncio.gather(*tense_tasks, return_exceptions=True)
            for (tense_id, _), questions in zip(tenses_to_fill, tense_results):
                if isinstance(questions, list) and questions:
                    save_tense_questions_to_pool(tense_id, questions, db)

        vocab_tasks = []
        vocab_keys = []

        for category in ALL_CATEGORIES:
            count = get_vocab_count(category, user_level, db)
            if count < VOCAB_TARGET:
                existing = [
                    w.word for w in db.query(VocabularyWord).filter(
                        VocabularyWord.category == category,
                        VocabularyWord.level == user_level
                    ).all()
                ]
                needed = VOCAB_TARGET - count
                vocab_keys.append((category, user_level))
                vocab_tasks.append(generate_vocab_async(category, user_level, existing, needed))

        if vocab_tasks:
            vocab_results = await asyncio.gather(*vocab_tasks, return_exceptions=True)
            for (category, level), words in zip(vocab_keys, vocab_results):
                if isinstance(words, list) and words:
                    save_vocab_to_db(category, level, words, db)

    finally:
        db.close()


def trigger_pregeneration(user_level: str):
    asyncio.run(pregenerate_for_user(user_level or "B1"))


def refill_tense_pool_if_needed(tense_id: str, db: Session):
    count = get_pool_count(tense_id, db)
    if count < POOL_MIN_THRESHOLD:
        needed = POOL_TARGET - count
        asyncio.run(generate_tense_questions_async(tense_id, needed))