from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import hashlib
import base64

# ✅ ABSOLUTE IMPORT (IMPORTANT)
from db.mongo import users_collection

router = APIRouter(prefix="/auth", tags=["Auth"])

# =========================
# PASSWORD HASHING SETUP
# =========================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    """
    Pre-hash with SHA-256 and encode as base64 to avoid bcrypt 72-byte limit.
    Allows unlimited password length safely.
    """
    sha = hashlib.sha256(password.encode("utf-8")).digest()
    sha_b64 = base64.b64encode(sha).decode("utf-8")
    return pwd_context.hash(sha_b64)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    sha = hashlib.sha256(plain_password.encode("utf-8")).digest()
    sha_b64 = base64.b64encode(sha).decode("utf-8")
    return pwd_context.verify(sha_b64, hashed_password)

# =========================
# SCHEMAS
# =========================

class AuthRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    email: EmailStr

# =========================
# SIGNUP
# =========================

@router.post("/signup", response_model=AuthResponse)
def signup(data: AuthRequest):
    existing_user = users_collection.find_one({"email": data.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    user_doc = {
        "email": data.email,
        "password": hash_password(data.password)
    }

    users_collection.insert_one(user_doc)

    return {"email": data.email}

# =========================
# LOGIN
# =========================

@router.post("/login", response_model=AuthResponse)
def login(data: AuthRequest):
    user = users_collection.find_one({"email": data.email})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"email": user["email"]}
