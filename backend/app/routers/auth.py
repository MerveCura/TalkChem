from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from app.database import get_db
from app import models

router = APIRouter()

# bcrypt: şifreleri hash'lemek için kullanılan algoritma
# "deprecated=auto" → eski algoritmaları otomatik olarak geçersiz sayar
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# SECRET_KEY: token'ı imzalamak için kullanılan gizli anahtar
# Üretimde mutlaka .env dosyasından okunmalı, kodda yazılmamalı
SECRET_KEY = os.getenv("SECRET_KEY", "changeme-in-production")

# HS256: simetrik imzalama algoritması, aynı key ile hem imzalanır hem doğrulanır
ALGORITHM = "HS256"

# Token süresi: 24 saat — kullanıcı her gün yeniden giriş yapmak zorunda kalmaz
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# OAuth2PasswordBearer: Authorization header'dan "Bearer <token>" formatında token okur
# tokenUrl → Swagger UI'da login endpoint'ini gösterir
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# credentials_exception: token geçersiz veya eksik olduğunda fırlatılan standart hata
# WWW-Authenticate header'ı → RFC 6750 standardına uygunluk için eklenir
# Tek yerde tanımlanır, tüm router'lardan import edilerek kullanılır
credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


# Pydantic modelleri: gelen request body'yi otomatik doğrular ve tip kontrolü yapar
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr  # EmailStr: geçerli email formatını otomatik kontrol eder
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


def create_token(user_id: int, username: str) -> str:
    # sub: JWT standardında kullanıcıyı tanımlayan alan (subject)
    # String olarak saklanır çünkü JWT spec sub'ı string bekler
    # iat (issued at): token'ın ne zaman üretildiğini tutar
    # exp: token'ın geçerlilik süresi — bu tarihten sonra jose kütüphanesi otomatik reddeder
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "username": username,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),  # Depends: FastAPI'nin dependency injection sistemi
    db: Session = Depends(get_db)
):
    # JWTError: hem imza hatalarını hem de decode hatalarını yakalar
    # Örneğin token değiştirilmişse, süresi dolmuşsa veya format bozuksa buraya düşer
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        # sub yoksa token içeriği beklenen formatta değil
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Token geçerli olsa bile kullanıcı silinmiş olabilir
    # Bu yüzden DB'den tekrar sorgulanır
    user = db.query(models.User).filter(
        models.User.id == int(user_id)
    ).first()

    if user is None:
        raise credentials_exception

    return user


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED
)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # Aynı email veya username ile tekrar kayıt olunmasını engelle
    if db.query(models.User).filter(models.User.email == req.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    if db.query(models.User).filter(models.User.username == req.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    user = models.User(
        username=req.username,
        email=req.email,
        # Şifre düz metin olarak saklanmaz, bcrypt ile hash'lenir
        password_hash=pwd_context.hash(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return TokenResponse(access_token=create_token(user.id, user.username))


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()

    # pwd_context.verify: girilen şifreyi hash ile karşılaştırır
    if not user or not pwd_context.verify(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenResponse(access_token=create_token(user.id, user.username))