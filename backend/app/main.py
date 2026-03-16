from fastapi import FastAPI
from app.routers import auth, level_test, users
from app.database import init_db

app = FastAPI(title="TalkChem API", version="0.1.0")

@app.on_event("startup")
async def startup():
    init_db()

@app.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(level_test.router)
app.include_router(users.router)