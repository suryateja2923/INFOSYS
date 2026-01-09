from pydantic import BaseModel
from typing import Optional, Dict, List

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class FitnessRequest(BaseModel):
    age: int
    gender: str
    height: int
    weight: int
    fitness_level: str
    diet_type: str
    goal: Optional[str] = None
    pregnant: bool = False
    pregnancy_month: Optional[int] = None

class SavePlanRequest(BaseModel):
    email: str
    plan: Dict
