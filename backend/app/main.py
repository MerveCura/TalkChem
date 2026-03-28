from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routers import auth, level_test, users, tense_quiz, vocabulary
from app.database import init_db
import os

app = FastAPI(title="TalkChem API", version="0.1.0")

@app.on_event("startup")
async def startup():
    init_db()
    os.makedirs("uploads/profiles", exist_ok=True)

@app.get("/health")
async def health():
    return {"status": "ok"}

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(level_test.router)
app.include_router(users.router)
app.include_router(tense_quiz.router)
app.include_router(vocabulary.router)