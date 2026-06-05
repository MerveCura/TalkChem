import os
import json
from dotenv import load_dotenv
load_dotenv()
import openai
from app.database import SessionLocal
from app.models import VocabularyWord

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
db = SessionLocal()

words = db.query(VocabularyWord).all()
to_fix = [w for w in words if w.meaning_tr and len(w.meaning_tr) > 20]
print(f"Fixing {len(to_fix)} words...")

for i in range(0, len(to_fix), 20):
    batch = to_fix[i:i+20]
    word_list = [{"id": w.id, "word": w.word} for w in batch]
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"Translate to Turkish, dictionary style, MAX 5 WORDS, NO sentences. CORRECT: kitap, koşmak, ertelemek. WRONG: uzun cümleler. Words: {json.dumps(word_list)}. Return ONLY JSON array: [{{\"id\": 1, \"meaning_tr\": \"türkçe\"}}]"}],
        temperature=0.1,
        max_tokens=500,
    )
    content = response.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    results = json.loads(content.strip())
    for r in results:
        word = db.query(VocabularyWord).filter(VocabularyWord.id == r["id"]).first()
        if word:
            word.meaning_tr = r["meaning_tr"]
    db.commit()
    print(f"Batch {i//20+1} done")

print("All done!")
db.close()