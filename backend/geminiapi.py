"""
Fitplan.ai Gemini API Integration
Generates personalized fitness recommendations using Google's Gemini API
Includes static prompts for all fitness scenarios
"""

import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import Dict, List, Optional
import json
import time
import random

# Load environment variables
load_dotenv()

# Initialize Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("⚠️ CRITICAL: GEMINI_API_KEY not set in .env file")

genai.configure(api_key=GEMINI_API_KEY)

# ==================== STATIC PROMPTS ====================

class FitplanPrompts:
    """Static prompts for Fitplan.ai AI generation"""
    
    # ==================== WORKOUT GENERATION PROMPTS ====================
    
    WORKOUT_GENERATION = """
You are an expert certified fitness trainer and program designer for the Fitplan.ai fitness platform.

Generate a PERSONALIZED WORKOUT PLAN based on the following user profile:
- Age: {age}
- Gender: {gender}
- Fitness Level: {level}
- Primary Goal: {goal}
- BMI: {bmi} ({bmi_category})
- Current Location: {location}
- Workout Mode: {mode} (gym/home)
- Mood Today: {mood}
- Pregnancy Status: {is_pregnant}
- Health Issues: {health_issues}
- Health Risk Level: {health_risk}

CRITICAL: ADJUST WORKOUT INTENSITY BASED ON MOOD:
- If mood = "stressed": Focus on STRESS-RELIEF exercises (yoga, stretching, moderate cardio, breathing exercises)
- If mood = "exhausted": Focus on LOW-INTENSITY recovery (light walking, gentle stretching, restorative yoga, minimal resistance)
- If mood = "energetic": Full intensity workout matching their fitness level (HIIT, strength training, challenging exercises)

IMPORTANT SAFETY GUIDELINES:
1. If pregnant: ONLY suggest pregnancy-safe exercises with modifications
2. If BMI >= 50: Focus on LOW-IMPACT exercises (walking, swimming, yoga)
3. If age < 18: Include parental supervision recommendations
4. If age > 75: Suggest medical clearance and low-intensity focus
5. If high-risk health: Suggest medical consultation first

WORKOUT STRUCTURE:
- Warm-up: 5-10 minutes
- Main Workout: 20-30 minutes (based on fitness level AND MOOD)
- Cool Down: 5-10 minutes

FORMAT YOUR RESPONSE AS JSON:
{{
  "day": 1,
  "place": "{mode}",
  "difficulty": "beginner/intermediate/advanced",
  "warm_up": [
    {{"name": "...", "duration": "... min", "sets": X, "reps": X, "calories": X}}
  ],
  "main_exercises": [
    {{"name": "...", "duration": "... min", "sets": X, "reps": X, "calories": X, "notes": "..."}}
  ],
  "cool_down": [
    {{"name": "...", "duration": "... min", "calories": X}}
  ],
  "total_calories": X,
  "total_duration": X,
  "precautions": ["..."],
  "modifications": ["..."],
  "motivation": "...",
  "mood_note": "Brief explanation of how this workout was adapted for {mood} mood"
}}

Generate a UNIQUE workout plan now (do NOT repeat previous exercises):
"""

    PREGNANCY_SAFE_WORKOUT = """
You are a specialized prenatal fitness expert for the Fitplan.ai platform.

CRITICAL: This user is PREGNANT and needs SAFE EXERCISES ONLY.

User Profile:
- Age: {age} (Pregnancy safe: 18-50 years only)
- Trimester/Month: {pregnancy_stage}
- Fitness Level: {level}
- Goal: Safe fitness maintenance and preparation for delivery
- Location: {location}
- Mode: {mode}
- Health Issues: {health_issues}

PREGNANCY EXERCISE GUIDELINES:
1. NO high-impact exercises
2. NO activities that involve lying on back (after first trimester)
3. NO contact sports
4. NO exercises with risk of falling
5. FOCUS: Pelvic floor, core stability, flexibility, breathing
6. AVOID: Heavy weights, intense cardio

FORMAT AS JSON:
{{
  "trimester": "First/Second/Third",
  "note": "Consult healthcare provider before starting",
  "safe_exercises": [
    {{"name": "...", "duration": "... min", "reps": X, "intensity": "low", "benefit": "..."}}
  ],
  "pelvic_floor_exercises": [
    {{"name": "...", "duration": "... min", "reps": X}}
  ],
  "breathing_exercises": [
    {{"name": "...", "duration": "... min", "instructions": "..."}}
  ],
  "warning_signs": ["Stop if experiencing: ..."],
  "precautions": ["..."],
  "total_duration": X,
  "recommendations": ["..."]
}}

Generate pregnancy-safe workout now:
"""

    # ==================== DIET PLAN PROMPTS ====================
    
    DIET_GENERATION = """
You are a certified nutritionist and dietitian for the Fitplan.ai platform.

Create a PERSONALIZED, LOCATION-BASED DAILY DIET PLAN for:
- Location: {location}
- Age: {age}
- Gender: {gender}
- Goal: {goal}
- BMI: {bmi}
- Health Issues: {health_issues}
- Dietary Restrictions: {dietary_restrictions}
- Food Preference: {food_preference}
- Pregnancy Status: {is_pregnant}
- Activity Level: {fitness_level}

NUTRITIONAL TARGETS:
- Daily Calories: {daily_calories}
- Protein Target: {protein_grams}g
- Carbs Target: {carbs_grams}g
- Fats Target: {fats_grams}g

LOCATION-BASED CUISINE GUIDELINES - MUST FOLLOW:
- INDIA/Indian cities: Use Indian staples like dal, rice, roti, vegetables (spinach, carrots, beans), yogurt, paneer, local spices
- USA: Use Western staples like chicken breast, broccoli, brown rice, oats, Greek yogurt, peanut butter
- UK/Europe: Use European ingredients like whole grains, lean meats, seasonal vegetables, dairy
- SOUTHEAST ASIA (Thailand, Vietnam, Singapore): Use rice, noodles, coconut milk, local vegetables, fish, tofu
- MIDDLE EAST: Use hummus, olive oil, chickpeas, whole grains, local vegetables, yogurt
- Other locations: Suggest locally available and popular foods for that region

CRITICAL: ALL meals MUST use ingredients and dishes typical/available in the user's location!

FOOD PREFERENCE GUIDELINES:
- Mixed (Default): Include both vegetarian and non-vegetarian meals. Provide good balance with vegetables and protein-rich meat/fish meals. Mix dal, paneer, tofu with chicken, fish, eggs across different meals
- Vegetarian (Veg): Include vegetables, fruits, dairy, legumes, eggs - NO meat/fish. Use dal, paneer, tofu, chickpeas, beans for protein
- Non-Veg: Include meat, chicken, fish, eggs, full dairy products
- Pure Vegetarian (Pure-Veg): Include vegetables, fruits, legumes - NO meat/fish/eggs/dairy

IMPORTANT: Respect the user's food preference! All meals must align with their chosen dietary type.

GOAL-SPECIFIC GUIDELINES:
- Weight Loss: Caloric deficit, higher protein, lower fat
- Weight Gain: Caloric surplus, whole foods, nutrient-dense
- Muscle Growth: High protein, moderate carbs, healthy fats
- Strength: Balanced macros with emphasis on protein

PREGNANCY NUTRITION (if applicable):
- Extra 300 calories during 2nd & 3rd trimesters
- High-calcium foods (dairy, leafy greens)
- Folic acid sources (beans, fortified cereals)
- Iron-rich foods (lean meat, beans, lentils)
- Safe seafood (low mercury)
- AVOID: Raw fish, unpasteurized dairy, delicatessen meats

CRITICAL INSTRUCTIONS:
1. For each meal, include SPECIFIC QUANTITY with units (e.g., "1 cup", "150g", "2 pieces", "1 tbsp")
2. Provide exact serving sizes so users can follow the plan accurately
3. Ensure ALL meals match the user's food preference type
4. USE ONLY INGREDIENTS AVAILABLE IN {location}
5. Suggest LOCAL and REGIONAL dishes popular in {location}
6. Include food type for each meal: 
   - "non-veg" for meals with meat/fish/eggs
   - "veg" for vegetarian meals (can have dairy/eggs)
   - "pure-veg" for vegan meals (no animal products)

FORMAT AS JSON:
{{
  "day": 1,
  "location": "{location}",
  "cuisine_type": "Regional cuisine of {location}",
  "total_calories": {daily_calories},
  "macros": {{
    "protein": "{protein_grams}g",
    "carbs": "{carbs_grams}g",
    "fats": "{fats_grams}g"
  }},
  "meals": [
    {{
      "name": "Breakfast",
      "time": "7:00 AM",
      "meal": "Local breakfast dish appropriate for {location}",
      "quantity": "Specific amount with units",
      "foodType": "veg or non-veg or pure-veg",
      "calories": 450,
      "protein": 15,
      "carbs": 60,
      "fats": 12,
      "prep_time": "10 min"
    }},
    {{
      "name": "Mid Morning Snack",
      "time": "10:00 AM",
      "meal": "Local snack popular in {location}",
      "quantity": "Amount with units",
      "foodType": "veg or non-veg or pure-veg",
      "calories": 200,
      "protein": 15,
      "carbs": 25,
      "fats": 3,
      "prep_time": "2 min"
    }},
    {{
      "name": "Lunch",
      "time": "1:00 PM",
      "meal": "Traditional lunch dish from {location}",
      "quantity": "Specific serving size",
      "foodType": "non-veg or veg or pure-veg",
      "calories": 600,
      "protein": 45,
      "carbs": 70,
      "fats": 10,
      "prep_time": "30 min"
    }},
    {{
      "name": "Afternoon Snack",
      "time": "4:00 PM",
      "meal": "Local snack from {location}",
      "quantity": "Amount with units",
      "foodType": "veg or non-veg or pure-veg",
      "calories": 250,
      "protein": 9,
      "carbs": 30,
      "fats": 12,
      "prep_time": "2 min"
    }},
    {{
      "name": "Dinner",
      "time": "7:00 PM",
      "meal": "Fish with quinoa and steamed broccoli",
      "quantity": "150g salmon + 1 cup cooked quinoa + 2 cups broccoli",
      "foodType": "non-veg",
      "calories": 500,
      "protein": 40,
      "carbs": 55,
      "fats": 15,
      "prep_time": "25 min"
    }}
  ],
  "hydration": "8-10 glasses of water daily",
  "supplements": ["Multivitamin", "Omega-3 Fish Oil"],
  "tips": ["Drink water with every meal", "Eat slowly and chew well", "Prepare meals in advance"],
  "shopping_list": ["Chicken breast", "Salmon", "Brown rice", "Oats", "Vegetables"]
}}

CRITICAL: Ensure each meal has QUANTITY information with specific units. This is essential for user adherence!

Generate diet plan now:
"""

    PREGNANCY_DIET = """
You are a prenatal nutrition specialist for Fitplan.ai.

CRITICAL: This is a PREGNANT USER - nutrition is critical for baby development.

User Profile:
- Age: {age}
- Trimester: {trimester}
- Current Weight: {weight}kg
- Height: {height}cm
- Health Conditions: {health_issues}

PREGNANCY NUTRITION PRIORITIES:
1. Folic Acid (400-800 mcg): Prevents neural tube defects
2. Iron (27 mg): Prevent anemia
3. Calcium (1000 mg): Baby bone development
4. Protein (70-100g): Tissue growth
5. DHA Omega-3: Brain development

FOODS TO AVOID IN PREGNANCY:
- Raw/undercooked meat and fish
- Unpasteurized dairy
- High-mercury fish (shark, swordfish, king mackerel)
- Soft cheeses (unless pasteurized)
- Deli meats (listeria risk)
- Raw eggs
- Excess caffeine (>200mg/day)

FORMAT AS JSON:
{{
  "trimester": "First/Second/Third",
  "message": "Consult your OB-GYN about this meal plan",
  "daily_calories_target": {calories},
  "key_nutrients": {{
    "folic_acid_mcg": 600,
    "iron_mg": 27,
    "calcium_mg": 1000,
    "protein_g": 70,
    "dha_omega3_mg": 200
  }},
  "meals": {{
    "breakfast": {{"meal": "...", "nutrients": "rich in ..."}},
    "lunch": {{"meal": "...", "nutrients": "..."}},
    "dinner": {{"meal": "...", "nutrients": "..."}},
    "snacks": [{{"meal": "...", "benefit": "..."}}]
  }},
  "essential_foods": ["...", "...", "..."],
  "foods_to_avoid": ["...", "...", "..."],
  "warning_signs": ["Contact doctor if ..."],
  "supplements": ["Prenatal vitamin", "Iron (if deficient)", "..."]
}}

Generate pregnancy diet now:
"""

    # ==================== HEALTH RISK ASSESSMENT PROMPTS ====================
    
    HEALTH_RISK_ASSESSMENT = """
You are a medical health assessment expert for Fitplan.ai.

ASSESS HEALTH RISK for user with profile:
- Age: {age}
- BMI: {bmi} ({bmi_category})
- Gender: {gender}
- Health Issues: {health_issues}
- Fitness Level: {level}
- Medications: {medications}
- Family History: {family_history}

ASSESSMENT CRITERIA:
1. BMI: Underweight (<18.5), Normal (18.5-24.9), Overweight (25-29.9), Obese (≥30)
2. Age Risk: <18 (growing), 18-65 (normal), >65 (senior)
3. Health Conditions: Diabetes, Heart disease, Asthma, Arthritis, etc.
4. Lifestyle: Smoking, Alcohol, Sleep quality, Stress level

RISK CATEGORIES:
- LOW: Generally healthy, can exercise normally
- MODERATE: Some concerns, needs adjustments
- HIGH: Serious concerns, medical clearance needed

FORMAT AS JSON:
{{
  "risk_level": "low/moderate/high",
  "risk_score": 0-100,
  "risk_factors": ["...", "..."],
  "protective_factors": ["...", "..."],
  "recommendations": {{
    "exercise": "...",
    "diet": "...",
    "medical": "...",
    "lifestyle": "..."
  }},
  "medical_clearance_needed": true/false,
  "urgent_actions": ["..."],
  "follow_up_tests": ["...", "..."],
  "monitoring": "Check ... monthly"
}}

Assess health risk now:
"""

    # ==================== GOAL-BASED RECOMMENDATIONS ====================
    
    WEIGHT_LOSS_PLAN = """
You are a weight loss specialist for Fitplan.ai.

Create a WEIGHT LOSS STRATEGY for:
- Current Weight: {weight}kg
- Target Weight: {target_weight}kg
- Height: {height}cm
- Age: {age}
- Timeline: {timeline_weeks} weeks
- Fitness Level: {level}
- BMI: {bmi}

WEIGHT LOSS PRINCIPLES:
1. Create 500-calorie daily deficit = 0.5kg/week loss
2. Combination of diet + exercise
3. Sustainable, not crash dieting
4. Build healthy habits

FORMAT AS JSON:
{{
  "timeframe_weeks": {timeline_weeks},
  "weekly_loss_kg": 0.5,
  "calorie_deficit": 500,
  "diet_strategy": {{
    "daily_calories": X,
    "macros": "High protein, moderate carbs, low fat",
    "foods_to_increase": ["...", "..."],
    "foods_to_reduce": ["...", "..."]
  }},
  "exercise_plan": {{
    "weekly_sessions": X,
    "primary": "Cardio + strength training",
    "weekly_calories_to_burn": X,
    "priority_exercises": ["...", "..."]
  }},
  "weekly_milestones": {{
    "week_1": "...",
    "week_4": "...",
    "week_8": "...",
    "week_12": "..."
  }},
  "nutrition_tips": ["...", "..."],
  "lifestyle_changes": ["...", "..."],
  "monitoring": "Weigh weekly, track measurements"
}}

Generate weight loss plan now:
"""

    MUSCLE_GROWTH_PLAN = """
You are a muscle building specialist for Fitplan.ai.

Create a MUSCLE GROWTH PROGRAM for:
- Current Weight: {weight}kg
- Target Weight: {target_weight}kg
- Height: {height}cm
- Age: {age}
- Fitness Level: {level}
- Experience: {training_experience}

MUSCLE BUILDING PRINCIPLES:
1. Progressive overload (increase weight/reps)
2. Caloric surplus of 300-500 calories
3. High protein intake (1.6-2.2g per kg)
4. Adequate rest and recovery
5. Compound movements focus

FORMAT AS JSON:
{{
  "goal": "Build {target_amount}kg lean muscle",
  "timeline_weeks": 12-16,
  "calorie_surplus": 400,
  "daily_calories": X,
  "daily_protein": X,
  "macro_split": "40% protein, 40% carbs, 20% fats",
  "training_split": "Push/Pull/Legs or Upper/Lower",
  "weekly_sessions": 4-5,
  "progressive_overload": {{
    "strategy": "Increase weight by 2.5kg every 2 weeks",
    "rep_ranges": "6-8 heavy, 8-12 moderate, 12-15 light"
  }},
  "compound_exercises": ["Bench Press", "Squat", "Deadlift", "..."],
  "isolation_exercises": ["...", "..."],
  "nutrition": {{
    "protein_sources": ["...", "..."],
    "carb_timing": "Post-workout",
    "supplements": ["Whey protein", "Creatine", "..."]
  }},
  "recovery": {{
    "sleep_hours": 7-9,
    "rest_days": 1-2,
    "stretching": "Daily"
  }},
  "milestones": ["...", "..."]
}}

Generate muscle growth plan now:
"""

    # ==================== FEEDBACK ANALYSIS PROMPTS ====================
    
    ANALYZE_FEEDBACK = """
You are a fitness progress analyst for Fitplan.ai.

Analyze user's workout and diet feedback:
- Day: {day}
- Mood: {mood}
- Energy Level: {energy} (1-10)
- Workout Difficulty: {difficulty} (1-10)
- Diet Satisfaction: {diet_satisfaction} (1-10)
- Comments: {comments}
- Previous Day Feedback: {previous_feedback}

ANALYSIS FOCUS:
1. Energy patterns
2. Mood-exercise correlation
3. Fatigue indicators
4. Progress signs
5. Adjustment needs

FORMAT AS JSON:
{{
  "day": {day},
  "mood_analysis": "...Interpretation of mood...",
  "energy_analysis": "...Energy level interpretation...",
  "difficulty_feedback": "...Is workout too hard/easy?...",
  "diet_impact": "...How diet affected performance...",
  "trends": ["...", "..."],
  "recommendations": {{
    "next_workout": "...",
    "rest_day_needed": true/false,
    "intensity_adjustment": "increase/decrease/maintain",
    "diet_adjustment": "...",
    "recovery": "..."
  }},
  "motivation": "...",
  "progress_indicator": "On track / Needs adjustment / Excellent"
}}

Analyze feedback now:
"""

    # ==================== RECOVERY RECOMMENDATIONS ====================
    
    RECOVERY_PLAN = """
You are a sports recovery and wellness specialist for Fitplan.ai.

Create RECOVERY RECOMMENDATIONS for:
- Recent Workout: {last_workout}
- Intensity: {intensity}
- Duration: {duration}
- Age: {age}
- Current Fatigue: {fatigue_level} (1-10)
- Sleep Last Night: {sleep_hours} hours
- Stress Level: {stress_level} (1-10)

RECOVERY PRIORITIES:
1. Sleep: 7-9 hours for adults
2. Nutrition: Protein + carbs within 30-60 min post-workout
3. Hydration: 50% body weight in ounces daily
4. Rest Days: 1-2 per week
5. Active Recovery: Light movement on rest days

FORMAT AS JSON:
{{
  "recovery_status": "Well-recovered / Moderately fatigued / Heavily fatigued",
  "next_session_readiness": "Full / Modified / Rest day needed",
  "sleep_recommendation": X,
  "nutrition_recovery": {{
    "post_workout_meal": "...",
    "timing": "Within 60 minutes",
    "protein_grams": X,
    "carbs_grams": X
  }},
  "hydration": {{
    "daily_target_liters": X,
    "post_workout": "500ml water",
    "electrolytes": "if >60 min exercise"
  }},
  "active_recovery_options": [
    {{"activity": "...", "duration": "... min", "benefit": "..."}}
  ],
  "stretching_routine": ["...", "..."],
  "foam_rolling": ["Target: ...", "..."],
  "ice_vs_heat": "Use ... for ...",
  "warning_signs": ["Stop if experiencing ..."],
  "motivation": "..."
}}

Generate recovery plan now:
"""

    # ==================== PERSONALIZED RECOMMENDATIONS ====================
    
    PERSONALIZED_RECOMMENDATIONS = """
You are an AI fitness coach for Fitplan.ai.

Provide PERSONALIZED RECOMMENDATIONS for:
- Profile: {profile}
- Current Progress: {progress}
- Days Completed: {days_completed}
- Average Mood: {avg_mood}
- Adherence Rate: {adherence_rate}%
- Goals: {goals}
- Challenges: {challenges}

FORMAT AS JSON:
{{
  "week_theme": "...",
  "key_focus": "...",
  "recommended_changes": {{
    "workout": "...",
    "diet": "...",
    "recovery": "..."
  }},
  "motivation_message": "...",
  "success_habits": ["...", "..."],
  "common_obstacles": ["You might face ...", "..."],
  "solutions": ["Try ...", "..."],
  "milestones_this_week": ["...", "..."],
  "next_level": "When you're ready..."
}}

Generate recommendations now:
"""


class GeminiClient:
    """Client for interacting with Google Gemini API"""
    
    def __init__(self):
        self.model = genai.GenerativeModel("models/gemini-2.5-flash")
    
    def generate_workout_plan(self, profile: Dict) -> str:
        """Generate personalized workout plan"""
        # Add timestamp and random seed for variety
        generation_id = f"{int(time.time())}_{random.randint(1000, 9999)}"
        
        prompt = FitplanPrompts.WORKOUT_GENERATION.format(
            age=profile.get("age"),
            gender=profile.get("gender"),
            level=profile.get("level"),
            goal=profile.get("goal"),
            bmi=profile.get("bmi", "N/A"),
            bmi_category=profile.get("bmi_category", "N/A"),
            location=profile.get("location"),
            mode=profile.get("mode", "gym"),
            mood=profile.get("mood", "energetic"),
            is_pregnant=profile.get("is_pregnant", False),
            health_issues=profile.get("health_issues", "None"),
            health_risk=profile.get("health_risk", "low")
        )
        
        # Add variation instruction
        prompt += f"\n\nGeneration ID: {generation_id}\nIMPORTANT: Create a COMPLETELY NEW and DIFFERENT workout plan. Vary exercises, rep ranges, and structure. Be creative!"
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def generate_pregnancy_safe_workout(self, profile: Dict) -> str:
        """Generate pregnancy-safe workout"""
        prompt = FitplanPrompts.PREGNANCY_SAFE_WORKOUT.format(
            age=profile.get("age"),
            pregnancy_stage=profile.get("pregnancy_stage", "Unknown"),
            level=profile.get("level"),
            location=profile.get("location"),
            mode=profile.get("mode", "home"),
            health_issues=profile.get("health_issues", "None")
        )
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def generate_diet_plan(self, profile: Dict) -> str:
        """Generate personalized diet plan based on user location"""
        # Add timestamp and random seed for variety
        generation_id = f"{int(time.time())}_{random.randint(1000, 9999)}"
        
        prompt = FitplanPrompts.DIET_GENERATION.format(
            location=profile.get("location", "Unknown"),
            age=profile.get("age"),
            gender=profile.get("gender"),
            goal=profile.get("goal"),
            bmi=profile.get("bmi"),
            health_issues=profile.get("health_issues", "None"),
            dietary_restrictions=profile.get("dietary_restrictions", "None"),
            food_preference=profile.get("food_preference", "non-veg"),
            is_pregnant=profile.get("is_pregnant", False),
            fitness_level=profile.get("level"),
            daily_calories=profile.get("daily_calories", 2000),
            protein_grams=profile.get("protein_grams", 50),
            carbs_grams=profile.get("carbs_grams", 250),
            fats_grams=profile.get("fats_grams", 65)
        )
        
        # Add variation instruction
        prompt += f"\n\nGeneration ID: {generation_id}\nIMPORTANT: Create a COMPLETELY NEW and DIFFERENT meal plan using LOCAL foods from {profile.get('location')}. Vary meal choices, ingredients, and recipes. Be creative and diverse!"
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def generate_pregnancy_diet(self, profile: Dict) -> str:
        """Generate pregnancy-specific nutrition plan"""
        prompt = FitplanPrompts.PREGNANCY_DIET.format(
            age=profile.get("age"),
            trimester=profile.get("trimester", "Unknown"),
            weight=profile.get("weight"),
            height=profile.get("height"),
            health_issues=profile.get("health_issues", "None"),
            calories=profile.get("daily_calories", 2300)
        )
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def assess_health_risk(self, profile: Dict) -> str:
        """Assess user health risk level"""
        prompt = FitplanPrompts.HEALTH_RISK_ASSESSMENT.format(
            age=profile.get("age"),
            bmi=profile.get("bmi"),
            bmi_category=profile.get("bmi_category"),
            gender=profile.get("gender"),
            health_issues=profile.get("health_issues", "None"),
            level=profile.get("level"),
            medications=profile.get("medications", "None"),
            family_history=profile.get("family_history", "None")
        )
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def generate_weight_loss_plan(self, profile: Dict) -> str:
        """Generate weight loss strategy"""
        prompt = FitplanPrompts.WEIGHT_LOSS_PLAN.format(
            weight=profile.get("weight"),
            target_weight=profile.get("target_weight"),
            height=profile.get("height"),
            age=profile.get("age"),
            timeline_weeks=profile.get("timeline_weeks", 12),
            level=profile.get("level"),
            bmi=profile.get("bmi")
        )
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def generate_muscle_growth_plan(self, profile: Dict) -> str:
        """Generate muscle building program"""
        prompt = FitplanPrompts.MUSCLE_GROWTH_PLAN.format(
            weight=profile.get("weight"),
            target_weight=profile.get("target_weight"),
            height=profile.get("height"),
            age=profile.get("age"),
            level=profile.get("level"),
            training_experience=profile.get("training_experience", "beginner"),
            target_amount=profile.get("target_muscle_kg", 5)
        )
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def analyze_feedback(self, feedback: Dict) -> str:
        """Analyze user's daily feedback"""
        prompt = FitplanPrompts.ANALYZE_FEEDBACK.format(
            day=feedback.get("day"),
            mood=feedback.get("mood"),
            energy=feedback.get("energy"),
            difficulty=feedback.get("difficulty"),
            diet_satisfaction=feedback.get("diet_satisfaction"),
            comments=feedback.get("comments"),
            previous_feedback=feedback.get("previous_feedback", "None yet")
        )
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def generate_recovery_plan(self, profile: Dict) -> str:
        """Generate recovery recommendations"""
        prompt = FitplanPrompts.RECOVERY_PLAN.format(
            last_workout=profile.get("last_workout"),
            intensity=profile.get("intensity"),
            duration=profile.get("duration"),
            age=profile.get("age"),
            fatigue_level=profile.get("fatigue_level"),
            sleep_hours=profile.get("sleep_hours"),
            stress_level=profile.get("stress_level")
        )
        
        response = self.model.generate_content(prompt)
        return response.text
    
    def get_personalized_recommendations(self, profile: Dict) -> str:
        """Get AI personalized fit tips"""
        prompt = FitplanPrompts.PERSONALIZED_RECOMMENDATIONS.format(
            profile=profile.get("summary", ""),
            progress=profile.get("progress", ""),
            days_completed=profile.get("days_completed", 0),
            avg_mood=profile.get("avg_mood", "energetic"),
            adherence_rate=profile.get("adherence_rate", 80),
            goals=profile.get("goals", ""),
            challenges=profile.get("challenges", "")
        )
        
        response = self.model.generate_content(prompt)
        return response.text


# Initialize global client
gemini_client = GeminiClient()


# ==================== HELPER FUNCTIONS ====================

def clean_json_response(response_text: str) -> str:
    """
    Clean Gemini response to extract pure JSON
    Removes markdown code blocks and other formatting
    """
    # Remove markdown code blocks
    if "```json" in response_text:
        response_text = response_text.split("```json")[1].split("```")[0]
    elif "```" in response_text:
        response_text = response_text.split("```")[1].split("```")[0]
    
    # Strip whitespace
    return response_text.strip()


def parse_numeric(value) -> float:
    """
    Parse numeric values that might be strings like "35g" or "19.75"
    Returns float for proper calculations
    """
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        # Remove non-numeric characters except dot and minus
        import re
        cleaned = re.sub(r'[^\d.-]', '', value)
        try:
            return float(cleaned) if cleaned else 0.0
        except ValueError:
            return 0.0
    return 0.0


# ==================== API ROUTES (for FastAPI integration) ====================

async def get_ai_workout(profile: Dict) -> Dict:
    """API endpoint for AI workout generation"""
    try:
        if profile.get("is_pregnant"):
            response = gemini_client.generate_pregnancy_safe_workout(profile)
        else:
            response = gemini_client.generate_workout_plan(profile)
        
        # Clean response and try to parse as JSON
        try:
            cleaned_response = clean_json_response(response)
            workout_data = json.loads(cleaned_response)
            
            # Transform Gemini response format to frontend format
            # Combine warm_up, main_exercises, cool_down into single exercises array
            exercises = []
            
            if "warm_up" in workout_data:
                exercises.extend(workout_data["warm_up"])
            if "main_exercises" in workout_data:
                exercises.extend(workout_data["main_exercises"])
            if "cool_down" in workout_data:
                exercises.extend(workout_data["cool_down"])
            
            # Return in frontend-expected format
            return {
                "exercises": exercises,
                "total_calories": workout_data.get("total_calories", 0),
                "total_duration": workout_data.get("total_duration", ""),
                "day": workout_data.get("day", 1),
                "difficulty": workout_data.get("difficulty", "beginner"),
                "place": workout_data.get("place", "gym"),
                "precautions": workout_data.get("precautions", []),
                "modifications": workout_data.get("modifications", []),
                "motivation": workout_data.get("motivation", ""),
            }
        except json.JSONDecodeError:
            return {"error": "Invalid JSON format from Gemini", "raw_response": response}
    
    except Exception as e:
        return {"error": f"Failed to generate workout: {str(e)}"}


async def get_ai_diet(profile: Dict) -> Dict:
    """API endpoint for AI diet generation"""
    try:
        if profile.get("is_pregnant"):
            response = gemini_client.generate_pregnancy_diet(profile)
        else:
            response = gemini_client.generate_diet_plan(profile)
        
        try:
            cleaned_response = clean_json_response(response)
            diet_data = json.loads(cleaned_response)
            
            # Transform Gemini response format to frontend format
            # Convert meals object (breakfast, lunch, etc.) to meals array
            meals = []
            
            if "meals" in diet_data:
                meals_obj = diet_data["meals"]
                if isinstance(meals_obj, dict):
                    # Convert dict of meals to array
                    for meal_type, meal_info in meals_obj.items():
                        if isinstance(meal_info, dict):
                            meals.append({
                                "name": f"{meal_type.replace('_', ' ').title()}",
                                "time": meal_info.get("time", ""),
                                "calories": parse_numeric(meal_info.get("calories", 0)),
                                "protein": parse_numeric(meal_info.get("protein", 0)),
                                "carbs": parse_numeric(meal_info.get("carbs", 0)),
                                "fats": parse_numeric(meal_info.get("fats", 0)),
                                "quantity": meal_info.get("quantity", ""),
                                "foodType": meal_info.get("foodType", "non-veg"),
                                "ingredients": [meal_info.get("meal", "")],
                            })
                elif isinstance(meals_obj, list):
                    # Ensure numeric values in list items too
                    for meal in meals_obj:
                        if isinstance(meal, dict):
                            meal["calories"] = parse_numeric(meal.get("calories", 0))
                            meal["protein"] = parse_numeric(meal.get("protein", 0))
                            meal["carbs"] = parse_numeric(meal.get("carbs", 0))
                            meal["fats"] = parse_numeric(meal.get("fats", 0))
                            # Ensure quantity and foodType are present
                            if "quantity" not in meal:
                                meal["quantity"] = ""
                            if "foodType" not in meal:
                                meal["foodType"] = "non-veg"
                    meals = meals_obj
            
            # Return in frontend-expected format
            return {
                "meals": meals,
                "total_calories": diet_data.get("total_calories", 0),
                "total_protein": diet_data.get("macros", {}).get("protein", 0) if isinstance(diet_data.get("macros"), dict) else 0,
                "total_carbs": diet_data.get("macros", {}).get("carbs", 0) if isinstance(diet_data.get("macros"), dict) else 0,
                "total_fats": diet_data.get("macros", {}).get("fats", 0) if isinstance(diet_data.get("macros"), dict) else 0,
                "day": diet_data.get("day", 1),
                "hydration": diet_data.get("hydration", "8-10 glasses of water"),
                "tips": diet_data.get("tips", []),
                "supplements": diet_data.get("supplements", []),
            }
        except json.JSONDecodeError:
            return {"error": "Invalid JSON format from Gemini", "raw_response": response}
    
    except Exception as e:
        return {"error": f"Failed to generate diet: {str(e)}"}

async def get_health_assessment(profile: Dict) -> Dict:
    """API endpoint for health risk assessment"""
    try:
        response = gemini_client.assess_health_risk(profile)
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"raw_response": response, "type": "text"}
    
    except Exception as e:
        return {"error": f"Failed to assess health: {str(e)}"}


async def get_recovery_recommendations(profile: Dict) -> Dict:
    """API endpoint for recovery plan"""
    try:
        response = gemini_client.generate_recovery_plan(profile)
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"raw_response": response, "type": "text"}
    
    except Exception as e:
        return {"error": f"Failed to generate recovery plan: {str(e)}"}


async def get_ai_recommendations(profile: Dict) -> Dict:
    """API endpoint for personalized recommendations"""
    try:
        response = gemini_client.get_personalized_recommendations(profile)
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"raw_response": response, "type": "text"}
    
    except Exception as e:
        return {"error": f"Failed to generate recommendations: {str(e)}"}
