"""
Fitness Validation Conditions - Matching Frontend Requirements
Ensures backend enforces same safety rules as frontend
"""

from fastapi import HTTPException
from datetime import datetime
from typing import Dict, Tuple

# Constants
MIN_AGE = 1
MAX_AGE = 120
MIN_HEIGHT = 100  # cm
MAX_HEIGHT = 250  # cm
MIN_WEIGHT = 20   # kg
MAX_WEIGHT = 300  # kg
MAX_BMI = 50      # Critical safety limit

PREGNANCY_MIN_AGE = 18
PREGNANCY_MAX_AGE = 50

# BMI Categories
BMI_CATEGORIES = {
    "underweight": (0, 18.4),
    "normal": (18.5, 24.9),
    "overweight": (25, 29.9),
    "obese": (30, 50),
    "critical": (50, float('inf'))
}


def calculate_bmi(height_cm: float, weight_kg: float) -> float:
    """
    Calculate BMI from height (cm) and weight (kg)
    BMI = weight / (height in meters)^2
    """
    if height_cm <= 0 or weight_kg <= 0:
        raise HTTPException(status_code=400, detail="Height and weight must be positive")
    
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    return round(bmi, 2)


def get_bmi_category(bmi: float) -> str:
    """Categorize BMI into health categories"""
    for category, (min_val, max_val) in BMI_CATEGORIES.items():
        if min_val <= bmi < max_val:
            return category
    return "critical"


def validate_age(age: int) -> Tuple[bool, str]:
    """
    Validate age with warnings
    Returns: (is_valid, warning_message)
    """
    if age < MIN_AGE or age > MAX_AGE:
        return False, f"Age must be between {MIN_AGE} and {MAX_AGE} years"
    
    if age < 18:
        return True, "⚠️ Age below 18: Parental/Guardian supervision recommended"
    
    if age > 75:
        return True, "⚠️ Age above 75: Medical clearance recommended before intense exercise"
    
    return True, ""


def validate_pregnancy(age: int, gender: str, is_pregnant: bool) -> Tuple[bool, str]:
    """
    Validate pregnancy status with age and gender conditions
    Returns: (is_valid, error_message)
    """
    # Can only set pregnancy for females
    if is_pregnant and gender.lower() != "female":
        return False, "Pregnancy status can only be set for females"
    
    # Age validation for pregnancy
    if is_pregnant:
        if age < PREGNANCY_MIN_AGE or age > PREGNANCY_MAX_AGE:
            return False, f"🚨 CRITICAL: Pregnancy only valid for ages {PREGNANCY_MIN_AGE}-{PREGNANCY_MAX_AGE}. Your age ({age}) is outside safe pregnancy fitness range"
    
    return True, ""


def validate_body_measurements(
    height: float, 
    weight: float
) -> Tuple[bool, str, Dict]:
    """
    Validate body measurements and calculate BMI
    Returns: (is_valid, error_message, metrics)
    """
    # Height validation
    if height < MIN_HEIGHT or height > MAX_HEIGHT:
        return False, f"Height must be between {MIN_HEIGHT}-{MAX_HEIGHT} cm", {}
    
    # Weight validation
    if weight < MIN_WEIGHT or weight > MAX_WEIGHT:
        return False, f"Weight must be between {MIN_WEIGHT}-{MAX_WEIGHT} kg", {}
    
    try:
        bmi = calculate_bmi(height, weight)
        category = get_bmi_category(bmi)
        
        metrics = {
            "bmi": bmi,
            "bmi_category": category,
            "height": height,
            "weight": weight
        }
        
        # Critical BMI check
        if bmi >= MAX_BMI:
            return False, f"⚠️ BMI {bmi} is critically high. Medical consultation recommended before starting program", metrics
        
        return True, "", metrics
    
    except Exception as e:
        return False, str(e), {}


def validate_profile(profile_data: Dict) -> Tuple[bool, list]:
    """
    Comprehensive profile validation
    Returns: (is_valid, list_of_errors)
    """
    errors = []
    
    # Age validation
    age_valid, age_msg = validate_age(profile_data.get("age", 0))
    if not age_valid:
        errors.append(age_msg)
    
    # Gender validation
    valid_genders = ["male", "female", "other"]
    if profile_data.get("gender", "").lower() not in valid_genders:
        errors.append(f"Gender must be one of: {', '.join(valid_genders)}")
    
    # Location validation
    location = profile_data.get("location", "")
    if not location or len(location) < 2:
        errors.append("Location must be at least 2 characters")
    
    # Pregnancy validation
    pregnancy_valid, pregnancy_msg = validate_pregnancy(
        profile_data.get("age", 0),
        profile_data.get("gender", ""),
        profile_data.get("pregnant", False)
    )
    if not pregnancy_valid:
        errors.append(pregnancy_msg)
    
    # Body measurements validation
    if "height" in profile_data and "weight" in profile_data:
        measurements_valid, measurements_msg, metrics = validate_body_measurements(
            profile_data.get("height", 0),
            profile_data.get("weight", 0)
        )
        if not measurements_valid:
            errors.append(measurements_msg)
    
    # Fitness level validation
    valid_levels = ["beginner", "intermediate", "advanced"]
    if profile_data.get("level", "").lower() not in valid_levels:
        errors.append(f"Fitness level must be one of: {', '.join(valid_levels)}")
    
    # Goal validation
    valid_goals = ["weight_loss", "weight_gain", "muscle_growth", "strength"]
    if profile_data.get("goal", "").lower() not in valid_goals:
        errors.append(f"Goal must be one of: {', '.join(valid_goals)}")
    
    # Health issues requirement for high-risk profiles
    if profile_data.get("pregnant") or profile_data.get("age", 0) > 75:
        if not profile_data.get("health_issues"):
            errors.append("Health issues/concerns must be documented for this profile")
    
    return len(errors) == 0, errors


def assess_health_risk(profile_data: Dict) -> Dict:
    """
    Assess health risk level based on profile
    Returns: risk assessment with recommendations
    """
    risk_level = "low"
    risk_factors = []
    recommendations = []
    
    age = profile_data.get("age", 0)
    bmi = profile_data.get("bmi", 0)
    is_pregnant = profile_data.get("pregnant", False)
    health_issues = profile_data.get("health_issues", "")
    
    # Age factors
    if age < 18:
        risk_factors.append("Minor - requires supervision")
    if age > 75:
        risk_level = "high" if risk_level == "low" else risk_level
        risk_factors.append("Senior citizen - medical clearance needed")
    
    # BMI factors
    if bmi > 30:
        risk_level = "moderate" if risk_level == "low" else risk_level
        risk_factors.append(f"Elevated BMI ({bmi}) - obese category")
    
    # Pregnancy
    if is_pregnant:
        risk_level = "moderate"  # Always moderate for pregnancy
        risk_factors.append("Pregnancy requires specialized safe exercises")
        recommendations.append("Use pregnancy-safe workout modifications")
        recommendations.append("Consult healthcare provider before starting")
    
    # Health issues
    if health_issues and health_issues.lower() != "none":
        risk_level = "high"
        risk_factors.append(f"Documented health issues: {health_issues}")
        recommendations.append("Medical clearance required")
    
    return {
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "recommendations": recommendations
    }


def sanitize_string(value: str, max_length: int = 500) -> str:
    """Sanitize user input strings"""
    if not isinstance(value, str):
        return ""
    
    # Strip whitespace
    value = value.strip()
    
    # Limit length
    if len(value) > max_length:
        value = value[:max_length]
    
    return value


def sanitize_profile_data(profile_data: Dict) -> Dict:
    """Sanitize all profile input data"""
    sanitized = {
        "age": int(profile_data.get("age", 0)),
        "height": float(profile_data.get("height", 0)),
        "weight": float(profile_data.get("weight", 0)),
        "gender": sanitize_string(profile_data.get("gender", ""), 20).lower(),
        "pregnant": bool(profile_data.get("pregnant", False)),
        "level": sanitize_string(profile_data.get("level", ""), 20).lower(),
        "goal": sanitize_string(profile_data.get("goal", ""), 50).lower(),
        "health_issues": sanitize_string(profile_data.get("health_issues", ""), 500),
        "location": sanitize_string(profile_data.get("location", ""), 100)
    }
    return sanitized
