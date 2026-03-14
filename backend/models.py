from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    age: int
    height: float
    weight: float
    gender: str
    pregnant: bool = False
    level: str
    goal: str
    health_issues: Optional[str] = None
    location: str
    food_preference: Optional[str] = None  # 'veg' or 'mixed' (default)


class WorkoutPlan(BaseModel):
    day: int
    place: str
    difficulty: str
    exercises: List[Dict]


class DietPlan(BaseModel):
    day: int
    calories: int
    meals: List[Dict]  # List of meal dicts with name, time, calories, quantity, foodType, etc.


class Feedback(BaseModel):
    day: int
    mood: str
    energy: int
    difficulty: int
    comment: str
