from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db.mongo import users_collection
from services.gemini_service import generate_plan_with_gemini  # ✅ EXACT NAME

router = APIRouter(prefix="/plan", tags=["Fitness Plan"])


# ---------- REQUEST SCHEMA ----------
class PlanRequest(BaseModel):
    email: str
    age: int
    gender: str
    height: int
    weight: int
    fitness_level: str
    diet_type: str
    goal: str | None = None
    pregnant: bool | None = False
    pregnancy_month: int | None = None


# ---------- GENERATE & SAVE PLAN ----------
@router.post("/generate")
def generate_plan(data: PlanRequest):
    user = users_collection.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        plan = generate_plan_with_gemini(data.dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    users_collection.update_one(
        {"email": data.email},
        {"$set": {"fitness_plan": plan}}
    )

    return plan


# ---------- FETCH SAVED PLAN ----------
@router.get("/saved/{email}")
def get_saved_plan(email: str):
    user = users_collection.find_one({"email": email})
    if not user or "fitness_plan" not in user:
        raise HTTPException(status_code=404, detail="No saved plan")

    return user["fitness_plan"]
