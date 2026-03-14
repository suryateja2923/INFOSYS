from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from datetime import datetime
from database import (
    users_collection,
    profiles_collection,
    workout_collection,
    diet_collection,
    feedback_collection,
    init_database
)
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user
)
from models import (
    UserRegister,
    UserLogin,
    UserProfile,
    WorkoutPlan,
    DietPlan,
    Feedback
)
from validations import (
    validate_profile,
    assess_health_risk,
    sanitize_profile_data,
    sanitize_string,
    calculate_bmi,
    get_bmi_category
)
from geminiapi import (
    get_ai_workout,
    get_ai_diet,
    get_health_assessment,
    get_recovery_recommendations,
    get_ai_recommendations
)
from youtube_service import youtube_service

# ==================== Lifespan Event Handler ====================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Modern lifespan event handler for startup/shutdown
    Replaces deprecated @app.on_event decorators
    """
    # Startup: Initialize database
    await init_database()
    print("✅ Application started successfully")
    
    yield
    
    # Shutdown: Add cleanup logic here if needed
    print("👋 Application shutting down")

app = FastAPI(
    title="Fitplan.ai API",
    description="AI-powered fitness planning backend",
    version="1.0.0",
    lifespan=lifespan
)

# ==================== CORS Configuration ====================
# Allow frontend to make requests
ALLOWED_ORIGINS = [
    "http://localhost:3000",      # Development
    "http://localhost:5173",       # Vite development
    "http://localhost:8080",       # Development (alternative port)
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "https://fitplan-ai.vercel.app",  # Production (update with actual domain)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== Health Check Endpoint ====================
@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    Returns application readiness status
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

# ==================== Authentication Endpoints ====================
@app.post("/register")
async def register_user(user: UserRegister):
    """
    Register a new user
    - Validates email format
    - Hashes password securely
    - Prevents duplicate emails
    """
    try:
        # Check if email already exists
        existing_user = await users_collection.find_one({"email": user.email.lower()})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Validate password length
        if len(user.password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters"
            )
        
        # Create user
        result = await users_collection.insert_one({
            "name": sanitize_string(user.name, 100),
            "email": user.email.lower(),
            "hashed_password": hash_password(user.password),
            "created_at": datetime.utcnow(),
            "is_active": True
        })
        
        return {
            "message": "✅ User registered successfully",
            "user_id": str(result.inserted_id)
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@app.post("/login")
async def login_user(user: UserLogin):
    """
    User login with JWT token generation
    - Validates credentials
    - Returns access token valid for 30 minutes
    """
    try:
        # Find user by email
        db_user = await users_collection.find_one({"email": user.email.lower()})
        
        if not db_user or not verify_password(user.password, db_user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not db_user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive"
            )
        
        # Create JWT token
        token = create_access_token({"user_id": str(db_user["_id"])})
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user_id": str(db_user["_id"])
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

# ==================== User Profile Endpoints ====================
@app.post("/user/profile")
async def save_profile(
    profile: UserProfile,
    user_id: str = Depends(get_current_user)
):
    """
    Save/Update user profile with comprehensive validation
    - Age validation (1-120)
    - Pregnancy validation (18-50 for females only)
    - BMI calculation and assessment
    - Health risk assessment
    - Input sanitization
    """
    try:
        # Convert to dict and sanitize
        profile_dict = profile.dict()
        profile_dict = sanitize_profile_data(profile_dict)
        profile_dict["user_id"] = user_id
        
        # Comprehensive profile validation
        is_valid, errors = validate_profile(profile_dict)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": "Profile validation failed",
                    "errors": errors
                }
            )
        
        # Calculate BMI and add metrics
        bmi = calculate_bmi(profile_dict["height"], profile_dict["weight"])
        bmi_category = get_bmi_category(bmi)
        
        profile_dict["bmi"] = bmi
        profile_dict["bmi_category"] = bmi_category
        
        # Assess health risk
        health_risk = assess_health_risk(profile_dict)
        profile_dict["health_risk"] = health_risk
        
        # Save to database (upsert)
        result = await profiles_collection.update_one(
            {"user_id": user_id},
            {"$set": {
                **profile_dict,
                "updated_at": datetime.utcnow()
            }},
            upsert=True
        )
        
        return {
            "message": "✅ Profile saved successfully",
            "bmi": bmi,
            "bmi_category": bmi_category,
            "health_risk": health_risk["risk_level"],
            "warnings": health_risk.get("risk_factors", [])
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile save failed: {str(e)}"
        )


@app.get("/user/profile")
async def get_profile(user_id: str = Depends(get_current_user)):
    """
    Retrieve user profile with all metrics
    """
    try:
        profile = await profiles_collection.find_one({"user_id": user_id})
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found. Please complete your profile first."
            )
        
        # Convert ObjectId to string
        profile["_id"] = str(profile["_id"])
        
        return {
            "message": "✅ Profile retrieved",
            "profile": profile
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve profile"
        )

# ==================== Workout Endpoints ====================
@app.post("/workout")
async def save_workout(
    workout: WorkoutPlan,
    user_id: str = Depends(get_current_user)
):
    """
    Save user's workout plan for a specific day
    """
    try:
        # Validate day
        if workout.day < 1 or workout.day > 365:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Day must be between 1 and 365"
            )
        
        # Validate place
        if workout.place.lower() not in ["gym", "home"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Place must be 'gym' or 'home'"
            )
        
        result = await workout_collection.update_one(
            {"user_id": user_id, "day": workout.day},
            {
                "$set": {
                    "place": workout.place.lower(),
                    "difficulty": sanitize_string(workout.difficulty, 50),
                    "exercises": workout.exercises,
                    "updated_at": datetime.utcnow()
                },
                "$setOnInsert": {
                    "user_id": user_id,
                    "day": workout.day,
                    "created_at": datetime.utcnow(),
                    "completed": False
                }
            },
            upsert=True
        )
        
        return {
            "message": "✅ Workout saved successfully",
            "workout_id": str(result.upserted_id) if result.upserted_id else None,
            "updated": result.modified_count > 0
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save workout: {str(e)}"
        )


@app.get("/workout/today")
async def get_workout(user_id: str = Depends(get_current_user)):
    """
    Get today's (most recent) workout plan
    """
    try:
        workout = await workout_collection.find_one(
            {"user_id": user_id},
            sort=[("day", -1)]
        )
        
        if not workout:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No workout plan found"
            )
        
        workout["_id"] = str(workout["_id"])
        
        return {
            "message": "✅ Workout retrieved",
            "workout": workout
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve workout"
        )


@app.get("/workout/day/{day}")
async def get_workout_by_day(day: int, user_id: str = Depends(get_current_user)):
    """
    Get workout plan for a specific day
    """
    try:
        workout = await workout_collection.find_one(
            {"user_id": user_id, "day": day},
            sort=[("updated_at", -1), ("created_at", -1)]
        )
        
        if not workout:
            return {
                "message": "No workout plan found for this day",
                "workout": None
            }
        
        workout["_id"] = str(workout["_id"])
        
        return {
            "message": "✅ Workout retrieved",
            "workout": workout
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve workout: {str(e)}"
        )

# ==================== Diet Endpoints ====================
@app.post("/diet")
async def save_diet(
    diet: DietPlan,
    user_id: str = Depends(get_current_user)
):
    """
    Save user's diet plan for a specific day
    """
    try:
        # Validate day
        if diet.day < 1 or diet.day > 365:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Day must be between 1 and 365"
            )
        
        # Validate calories
        if diet.calories < 800 or diet.calories > 5000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Daily calories should be between 800-5000"
            )
        
        result = await diet_collection.update_one(
            {"user_id": user_id, "day": diet.day},
            {
                "$set": {
                    "calories": diet.calories,
                    "meals": diet.meals,
                    "updated_at": datetime.utcnow()
                },
                "$setOnInsert": {
                    "user_id": user_id,
                    "day": diet.day,
                    "created_at": datetime.utcnow(),
                    "completed": False
                }
            },
            upsert=True
        )
        
        return {
            "message": "✅ Diet plan saved successfully",
            "diet_id": str(result.upserted_id) if result.upserted_id else None,
            "updated": result.modified_count > 0
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save diet: {str(e)}"
        )


@app.get("/diet/today")
async def get_diet(user_id: str = Depends(get_current_user)):
    """
    Get today's (most recent) diet plan
    """
    try:
        diet = await diet_collection.find_one(
            {"user_id": user_id},
            sort=[("day", -1)]
        )
        
        if not diet:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No diet plan found"
            )
        
        diet["_id"] = str(diet["_id"])
        
        return {
            "message": "✅ Diet retrieved",
            "diet": diet
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve diet"
        )


@app.get("/diet/day/{day}")
async def get_diet_by_day(day: int, user_id: str = Depends(get_current_user)):
    """
    Get diet plan for a specific day
    """
    try:
        diet = await diet_collection.find_one(
            {"user_id": user_id, "day": day},
            sort=[("updated_at", -1), ("created_at", -1)]
        )
        
        if not diet:
            return {
                "message": "No diet plan found for this day",
                "diet": None
            }
        
        diet["_id"] = str(diet["_id"])
        
        return {
            "message": "✅ Diet retrieved",
            "diet": diet
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve diet: {str(e)}"
        )


@app.delete("/plans/clear")
async def clear_all_plans(user_id: str = Depends(get_current_user)):
    """
    Clear all workout and diet plans for a user (when profile changes)
    """
    try:
        workout_result = await workout_collection.delete_many({"user_id": user_id})
        diet_result = await diet_collection.delete_many({"user_id": user_id})
        
        return {
            "message": "✅ All plans cleared successfully",
            "workouts_deleted": workout_result.deleted_count,
            "diets_deleted": diet_result.deleted_count
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear plans: {str(e)}"
        )

# ==================== Feedback Endpoints ====================
@app.post("/feedback")
async def submit_feedback(
    feedback: Feedback,
    user_id: str = Depends(get_current_user)
):
    """
    Submit user feedback for a specific day
    - Validates mood
    - Validates energy level (1-10)
    - Sanitizes comments
    """
    try:
        # Validate day
        if feedback.day < 1 or feedback.day > 365:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Day must be between 1 and 365"
            )
        
        # Validate mood
        valid_moods = ["stressed", "exhausted", "energetic"]
        if feedback.mood.lower() not in valid_moods:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Mood must be one of: {', '.join(valid_moods)}"
            )
        
        # Validate energy (1-10)
        if feedback.energy < 1 or feedback.energy > 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Energy level must be between 1-10"
            )
        
        # Validate difficulty (1-10)
        if feedback.difficulty < 1 or feedback.difficulty > 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Difficulty level must be between 1-10"
            )
        
        result = await feedback_collection.insert_one({
            "user_id": user_id,
            "day": feedback.day,
            "mood": feedback.mood.lower(),
            "energy": feedback.energy,
            "difficulty": feedback.difficulty,
            "comment": sanitize_string(feedback.comment, 500),
            "created_at": datetime.utcnow()
        })
        
        return {
            "message": "✅ Feedback submitted successfully",
            "feedback_id": str(result.inserted_id)
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit feedback: {str(e)}"
        )

# ==================== AI Generation Endpoints ====================
@app.post("/ai/workout")
async def generate_ai_workout(
    profile: dict,
    user_id: str = Depends(get_current_user)
):
    """
    Generate personalized AI workout plan using Google Gemini
    - Analyzes user profile and preferences
    - Generates pregnancy-safe workouts if applicable
    - Adjusts for fitness level and health risk
    """
    try:
        # Use profile from request, or fetch from database
        ai_profile = profile.copy() if profile else {}
        
        # If profile is incomplete, try to get from database
        if not all(k in ai_profile for k in ["age", "gender", "level", "goal"]):
            user_profile = await profiles_collection.find_one(
                {"user_id": user_id}
            )
            
            if user_profile:
                # Merge database profile with request profile (request takes precedence)
                db_profile = {
                    "age": user_profile.get("age"),
                    "gender": user_profile.get("gender"),
                    "level": user_profile.get("level"),
                    "goal": user_profile.get("goal"),
                    "bmi": user_profile.get("bmi"),
                    "bmi_category": user_profile.get("bmi_category"),
                    "location": user_profile.get("location"),
                    "is_pregnant": user_profile.get("pregnant", False),
                    "health_issues": user_profile.get("health_issues"),
                    "health_risk": user_profile.get("health_risk", {}).get("risk_level")
                }
                ai_profile = {**db_profile, **ai_profile}
        
        # Ensure required fields
        ai_profile.setdefault("mode", "gym")
        ai_profile.setdefault("mood", "energetic")
        ai_profile.setdefault("is_pregnant", False)
        
        # Generate workout plan
        ai_response = await get_ai_workout(ai_profile)
        
        return {
            "message": "✅ AI Workout generated successfully",
            "workout": ai_response
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate workout: {str(e)}"
        )


@app.post("/ai/diet")
async def generate_ai_diet(
    profile: dict,
    user_id: str = Depends(get_current_user)
):
    """
    Generate personalized AI diet plan using Google Gemini
    - Considers user's goal
    - Pregnancy nutrition if applicable
    - Dietary restrictions and preferences
    """
    try:
        # Use profile from request, or fetch from database
        ai_profile = profile.copy() if profile else {}
        
        # If profile is incomplete, try to get from database
        if not all(k in ai_profile for k in ["age", "gender", "goal", "level"]):
            user_profile = await profiles_collection.find_one(
                {"user_id": user_id}
            )
            
            if user_profile:
                # Calculate daily calories if not provided
                daily_calories = ai_profile.get("daily_calories", 2000)
                
                # Merge database profile with request profile (request takes precedence)
                db_profile = {
                    "age": user_profile.get("age"),
                    "gender": user_profile.get("gender"),
                    "goal": user_profile.get("goal"),
                    "bmi": user_profile.get("bmi"),
                    "weight": user_profile.get("weight"),
                    "height": user_profile.get("height"),
                    "health_issues": user_profile.get("health_issues"),
                    "is_pregnant": user_profile.get("pregnant", False),
                    "level": user_profile.get("level"),
                    "location": user_profile.get("location", "Unknown"),
                    "food_preference": user_profile.get("food_preference", "mixed"),
                    "daily_calories": daily_calories,
                }
                ai_profile = {**db_profile, **ai_profile}
        
        # Ensure required fields
        daily_calories = ai_profile.get("daily_calories", 2000)
        ai_profile.setdefault("dietary_restrictions", "None")
        ai_profile.setdefault("is_pregnant", False)
        ai_profile.setdefault("location", "Unknown")
        ai_profile.setdefault("food_preference", "mixed")
        ai_profile.setdefault("protein_grams", daily_calories * 0.3 / 4)
        ai_profile.setdefault("carbs_grams", daily_calories * 0.45 / 4)
        ai_profile.setdefault("fats_grams", daily_calories * 0.25 / 9)
        
        # Generate diet plan
        ai_response = await get_ai_diet(ai_profile)
        
        return {
            "message": "✅ AI Diet plan generated successfully",
            "diet": ai_response
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate diet: {str(e)}"
        )


@app.post("/ai/health-assessment")
async def get_ai_health_assessment(
    user_id: str = Depends(get_current_user)
):
    """
    Get AI-powered health risk assessment
    - Analyzes health factors
    - Provides personalized recommendations
    """
    try:
        user_profile = await profiles_collection.find_one(
            {"user_id": user_id}
        )
        
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        ai_profile = {
            "age": user_profile.get("age"),
            "bmi": user_profile.get("bmi"),
            "bmi_category": user_profile.get("bmi_category"),
            "gender": user_profile.get("gender"),
            "health_issues": user_profile.get("health_issues"),
            "level": user_profile.get("level"),
            "medications": "Unknown",
            "family_history": "Unknown"
        }
        
        ai_response = await get_health_assessment(ai_profile)
        
        return {
            "message": "✅ Health assessment completed",
            "assessment": ai_response
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate health assessment"
        )


@app.post("/ai/recovery")
async def get_ai_recovery_plan(
    recovery_data: dict,
    user_id: str = Depends(get_current_user)
):
    """
    Get AI-powered recovery recommendations
    - Based on last workout intensity
    - Current fatigue level
    - Sleep and stress
    """
    try:
        user_profile = await profiles_collection.find_one(
            {"user_id": user_id}
        )
        
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        ai_profile = {
            "age": user_profile.get("age"),
            "last_workout": recovery_data.get("last_workout", "Unknown"),
            "intensity": recovery_data.get("intensity", "moderate"),
            "duration": recovery_data.get("duration", 45),
            "fatigue_level": recovery_data.get("fatigue", 5),
            "sleep_hours": recovery_data.get("sleep_hours", 8),
            "stress_level": recovery_data.get("stress", 5)
        }
        
        ai_response = await get_recovery_recommendations(ai_profile)
        
        return {
            "message": "✅ Recovery plan generated",
            "recovery": ai_response
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recovery plan"
        )


@app.post("/ai/recommendations")
async def get_ai_fitness_recommendations(
    user_id: str = Depends(get_current_user)
):
    """
    Get AI personalized fitness recommendations
    - Based on progress and adherence
    - Current mood and challenges
    - Next level guidance
    """
    try:
        user_profile = await profiles_collection.find_one(
            {"user_id": user_id}
        )
        
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Get recent workouts completed
        recent_workouts = await workout_collection.find(
            {"user_id": user_id}
        ).to_list(length=7)
        
        # Get recent feedback
        recent_feedback = await feedback_collection.find(
            {"user_id": user_id}
        ).to_list(length=7)
        
        # Calculate adherence
        completed_count = sum(
            1 for w in recent_workouts if w.get("completed", False)
        )
        adherence_rate = (
            (completed_count / len(recent_workouts) * 100)
            if recent_workouts else 0
        )
        
        # Calculate average mood
        moods_map = {"stressed": 1, "exhausted": 2, "energetic": 3}
        avg_mood_num = (
            sum(moods_map.get(f.get("mood", "energetic"), 2)
                for f in recent_feedback) / len(recent_feedback)
            if recent_feedback else 2
        )
        mood_names = {1: "stressed", 2: "exhausted", 3: "energetic"}
        avg_mood = mood_names.get(round(avg_mood_num), "energetic")
        
        ai_profile = {
            "summary": f"{user_profile.get('goal')} program",
            "progress": f"Day {len(recent_workouts)} of program",
            "days_completed": len(recent_workouts),
            "avg_mood": avg_mood,
            "adherence_rate": adherence_rate,
            "goals": user_profile.get("goal"),
            "challenges": "Staying consistent",
            "level": user_profile.get("level")
        }
        
        ai_response = await get_ai_recommendations(ai_profile)
        
        return {
            "message": "✅ Personalized recommendations generated",
            "recommendations": ai_response,
            "progress_metrics": {
                "workouts_completed": completed_count,
                "adherence_rate": adherence_rate,
                "average_mood": avg_mood,
                "days_active": len(recent_workouts)
            }
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate recommendations"
        )


# ==================== YouTube Video Endpoints ====================
@app.get("/videos/workout/{day}")
async def get_workout_videos(day: int, user_id: str = Depends(get_current_user)):
    """
    Get YouTube videos for a specific day's workout plan
    Fetches videos based on actual exercises from database
    """
    try:
        if not youtube_service:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="YouTube service not available. Please configure YOUTUBE_API_KEY in .env"
            )
        
        # Get workout plan for the day
        workout = await workout_collection.find_one(
            {"user_id": user_id, "day": day},
            sort=[("updated_at", -1), ("created_at", -1)]
        )
        
        if not workout or not workout.get("exercises"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No workout plan found for day {day}. Generate a workout plan first."
            )
        
        # Get videos for all exercises
        exercises = workout.get("exercises", [])
        videos = youtube_service.get_videos_for_workout_plan(
            exercises=exercises,
            max_videos_per_exercise=1
        )
        
        return {
            "message": f"✅ Found {len(videos)} videos for day {day} workout",
            "day": day,
            "workout_place": workout.get("place", "gym"),
            "total_exercises": len(exercises),
            "videos": videos,
            "exercises": exercises
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch workout videos: {str(e)}"
        )


@app.get("/videos/search")
async def search_workout_videos(
    query: str,
    max_results: int = 5,
    user_id: str = Depends(get_current_user)
):
    """
    Search for workout videos by query
    Allows users to search for specific exercises
    """
    try:
        if not youtube_service:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="YouTube service not available. Please configure YOUTUBE_API_KEY in .env"
            )
        
        if not query or len(query) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query must be at least 2 characters"
            )
        
        # Search videos
        videos = youtube_service.search_workout_videos(
            exercise_name=query,
            max_results=min(max_results, 10)  # Limit to 10 max
        )
        
        return {
            "message": f"✅ Found {len(videos)} videos for '{query}'",
            "query": query,
            "videos": videos
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search videos: {str(e)}"
        )


@app.get("/videos/today")
async def get_today_workout_videos(user_id: str = Depends(get_current_user)):
    """
    Get YouTube videos for today's (latest) workout plan
    Quick access to current day videos
    """
    try:
        if not youtube_service:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="YouTube service not available. Please configure YOUTUBE_API_KEY in .env"
            )
        
        # Get latest workout
        workout = await workout_collection.find_one(
            {"user_id": user_id},
            sort=[("day", -1)]
        )
        
        if not workout or not workout.get("exercises"):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No workout plan found. Generate a workout plan first."
            )
        
        day = workout.get("day", 1)
        exercises = workout.get("exercises", [])
        
        # Get videos for all exercises
        videos = youtube_service.get_videos_for_workout_plan(
            exercises=exercises,
            max_videos_per_exercise=1
        )
        
        return {
            "message": f"✅ Found {len(videos)} videos for today's workout",
            "day": day,
            "workout_place": workout.get("place", "gym"),
            "total_exercises": len(exercises),
            "videos": videos,
            "exercises": exercises
        }
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch today's workout videos: {str(e)}"
        )


# ==================== Error Handling ====================
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

