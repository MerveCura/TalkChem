from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, LevelTestAttempt, LevelTestAnswer
from app.routers.auth import get_current_user
import openai
import os
import json

router = APIRouter(prefix="/api/level-test", tags=["level-test"])

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def determine_level(score: int) -> str:
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

@router.get("/questions")
async def get_questions():
    prompt = """Generate exactly 20 English proficiency test questions for a CEFR level test (A1 to C2).

IMPORTANT RULES:
- Use ONLY "multiple_choice" or "open_ended" types. NEVER use "fill_in_the_blank".
- Every "multiple_choice" MUST have exactly 4 options.
- Questions must be MIXED (not grouped by level) - shuffle them randomly.
- Cover these topics naturally mixed together: verb tenses, articles, prepositions, modal verbs, conditional sentences, phrasal verbs, vocabulary, idioms, reported speech, passive voice.
- Questions 1-5: easier (A1-A2), Questions 6-14: medium (B1-B2), Questions 15-20: harder (C1-C2) - but mix the exact order within each group.
- 17 multiple_choice + 3 open_ended (at positions 7, 12, 17 approximately)
- open_ended: conversational, 2-3 sentences only (e.g. "What did you do last weekend?")
- ALL questions must be self-contained. NO reading passage references. NO "what is the main idea of the passage" type questions.
- Use real-world, everyday English - similar to Cambridge, Oxford, or EF SET style tests.

Good examples:
- "She ___ her homework before dinner." → ["had finished", "has finished", "finished", "would finish"]
- "If I ___ you, I would apologize." → ["were", "am", "was", "be"]
- "He's very good ___ playing the piano." → ["at", "in", "on", "for"]
- "The meeting has been ___." → ["postponed", "postponing", "postpone", "to postpone"]
- "What ___ when I called you?" → ["did you do", "were you doing", "have you done", "do you do"]

Return ONLY a JSON array, no other text:
[
  {
    "id": 1,
    "type": "multiple_choice",
    "level": "A1",
    "question": "What ___ your name?",
    "options": ["is", "are", "am", "be"],
    "correct_answer": "is"
  },
  {
    "id": 7,
    "type": "open_ended",
    "level": "B1",
    "question": "What did you do last weekend? Describe in 2-3 sentences.",
    "correct_answer": null
  }
]"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.8,
    )

    content = response.choices[0].message.content
    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()

    questions = json.loads(content)

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

    return {"questions": questions}


@router.post("/submit")
async def submit_answers(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    answers = payload.get("answers", [])
    questions = payload.get("questions", [])

    # Multiple choice skoru (her biri 5 puan, 17 soru = max 85)
    mc_questions = [(q, a) for q, a in zip(questions, answers) if q.get("type") == "multiple_choice"]
    mc_correct = sum(1 for q, a in mc_questions if q.get("correct_answer") == a)
    mc_score = round((mc_correct / max(len(mc_questions), 1)) * 85)

    # Open ended soruları AI ile değerlendir (max 15 puan)
    open_questions = [(q, a) for q, a in zip(questions, answers) if q.get("type") == "open_ended"]
    open_score = 0

    if open_questions:
        open_eval_prompt = f"""You are an English language examiner. Evaluate these short answers.
For each answer give a score 0-5 based on grammar, vocabulary, and clarity.
5=Excellent, 4=Good, 3=Acceptable, 2=Weak, 1=Very weak, 0=No answer

Questions and answers:
{json.dumps([{"question": q.get("question"), "level": q.get("level"), "answer": a} for q, a in open_questions], ensure_ascii=False, indent=2)}

Return ONLY a JSON array, no other text:
[
  {{"question_index": 0, "score": 4}},
  {{"question_index": 1, "score": 2}}
]"""

        open_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": open_eval_prompt}],
            temperature=0.3,
        )

        open_content = open_response.choices[0].message.content.strip()
        if open_content.startswith("```"):
            open_content = open_content.split("```")[1]
            if open_content.startswith("json"):
                open_content = open_content[4:]
        open_content = open_content.strip()

        open_results = json.loads(open_content)
        for r in open_results:
            open_score += r.get("score", 0)

    # Toplam skor (max 100)
    total_score = min(100, mc_score + open_score)

    # Seviyeyi skora göre belirle (AI değil, deterministik)
    level = determine_level(total_score)

    # AI sadece feedback için kullanılır
    feedback_prompt = f"""The student scored {total_score}/100 on an English CEFR test and their level is {level}.
Write a short, encouraging 2-sentence feedback about their performance.
Return ONLY a JSON object, no other text:
{{
  "feedback": "Your feedback here.",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"]
}}"""

    feedback_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": feedback_prompt}],
        temperature=0.5,
    )

    feedback_content = feedback_response.choices[0].message.content.strip()
    if feedback_content.startswith("```"):
        feedback_content = feedback_content.split("```")[1]
        if feedback_content.startswith("json"):
            feedback_content = feedback_content[4:]
    feedback_content = feedback_content.strip()

    feedback_result = json.loads(feedback_content)

    # DB'ye kaydet
    attempt = LevelTestAttempt(
        user_id=current_user.id,
        level=level,
        score=total_score
    )
    db.add(attempt)
    db.flush()

    for i, (question, answer) in enumerate(zip(questions, answers)):
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

    current_user.english_level = level
    db.commit()

    return {
        "level": level,
        "score": total_score,
        "feedback": feedback_result.get("feedback", ""),
        "strengths": feedback_result.get("strengths", []),
        "weaknesses": feedback_result.get("weaknesses", [])
    }