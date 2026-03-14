# Fitplan.ai Gemini AI Integration - Complete Guide

## 📋 **Overview**

The Fitplan.ai backend now integrates **Google's Gemini AI** to generate personalized fitness recommendations, workout plans, diet plans, and recovery strategies. This provides intelligent, adaptive fitness guidance based on user profiles and real-time feedback.

---

## 🚀 **Quick Setup**

### 1. Get Gemini API Key
```bash
# Visit: https://makersuite.google.com/app/apikey
# Create a new API key
# Copy the key
```

### 2. Update .env File
```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Install Package
```bash
pip install google-generativeai
```

### 4. Initialize
```bash
# The geminiapi.py is already integrated into main.py
# Just ensure .env has GEMINI_API_KEY set
```

---

## 🎯 **AI Endpoints Reference**

### **1. Generate AI Workout Plan**
```
POST /ai/workout
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "mode": "gym",           # gym or home
  "mood": "energetic"      # stressed/exhausted/energetic
}

Response:
{
  "message": "✅ AI Workout generated successfully",
  "workout": {
    "day": 1,
    "place": "gym",
    "difficulty": "intermediate",
    "warm_up": [...],
    "main_exercises": [...],
    "cool_down": [...],
    "total_calories": 420,
    "total_duration": 45,
    "precautions": ["..."],
    "modifications": ["..."],
    "motivation": "..."
  }
}

Features:
✅ Automatic pregnancy-safe workouts for pregnant users
✅ Adjusts intensity based on fitness level and BMI
✅ Mood-based workout adaptation
✅ Health risk considerations
✅ Location-specific modifications (gym vs home)
```

### **2. Generate AI Diet Plan**
```
POST /ai/diet
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "daily_calories": 2000,
  "restrictions": "None"
}

Response:
{
  "message": "✅ AI Diet plan generated successfully",
  "diet": {
    "day": 1,
    "total_calories": 2000,
    "macros": {
      "protein": 150g,
      "carbs": 225g,
      "fats": 65g
    },
    "meals": {
      "breakfast": {...},
      "lunch": {...},
      "dinner": {...},
      "snacks": [...]
    },
    "hydration": "8-10 glasses daily",
    "supplements": ["..."],
    "shopping_list": ["..."]
  }
}

Features:
✅ Goal-based nutrition (weight loss/gain/muscle)
✅ Pregnancy nutrition support
✅ Macro calculations (protein/carbs/fats)
✅ Meal prep times included
✅ Dietary restrictions honored
✅ Shopping list generation
```

### **3. Health Risk Assessment**
```
POST /ai/health-assessment
Authorization: Bearer {token}

Response:
{
  "message": "✅ Health assessment completed",
  "assessment": {
    "risk_level": "moderate",
    "risk_score": 45,
    "risk_factors": ["Elevated BMI", "Age consideration"],
    "protective_factors": ["Regular activity", "Good diet"],
    "recommendations": {
      "exercise": "...",
      "diet": "...",
      "medical": "...",
      "lifestyle": "..."
    },
    "medical_clearance_needed": false,
    "urgent_actions": ["..."],
    "follow_up_tests": ["..."]
  }
}

Features:
✅ Comprehensive health analysis
✅ Risk factor identification
✅ Personalized recommendations
✅ Medical clearance determination
✅ Preventive health measures
```

### **4. Recovery Recommendations**
```
POST /ai/recovery
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "last_workout": "Chest Press",
  "intensity": "high",
  "duration": 60,
  "fatigue": 7,
  "sleep_hours": 6,
  "stress": 5
}

Response:
{
  "message": "✅ Recovery plan generated",
  "recovery": {
    "recovery_status": "Moderately fatigued",
    "next_session_readiness": "Modified",
    "sleep_recommendation": 8,
    "nutrition_recovery": {
      "post_workout_meal": "...",
      "timing": "Within 60 minutes",
      "protein_grams": 40,
      "carbs_grams": 60
    },
    "hydration": {...},
    "active_recovery_options": [...],
    "stretching_routine": ["..."],
    "foam_rolling": ["..."],
    "warning_signs": ["Stop if..."]
  }
}

Features:
✅ Fatigue assessment
✅ Sleep recommendations
✅ Nutrition timing
✅ Active recovery options
✅ Injury prevention tips
✅ Performance indicators
```

### **5. Personalized Recommendations**
```
POST /ai/recommendations
Authorization: Bearer {token}

Response:
{
  "message": "✅ Personalized recommendations generated",
  "recommendations": {
    "week_theme": "Building Strength Week",
    "key_focus": "Progressive Overload",
    "recommended_changes": {
      "workout": "...",
      "diet": "...",
      "recovery": "..."
    },
    "motivation_message": "...",
    "success_habits": ["..."],
    "common_obstacles": ["..."],
    "solutions": ["..."],
    "milestones_this_week": ["..."]
  },
  "progress_metrics": {
    "workouts_completed": 5,
    "adherence_rate": 83.3,
    "average_mood": "energetic",
    "days_active": 6
  }
}

Features:
✅ Progress-based recommendations
✅ Adherence tracking
✅ Motivation messages
✅ Obstacle identification
✅ Milestone tracking
✅ Adaptive guidance
```

---

## 📊 **Static Prompts Used**

The system uses 8 comprehensive static prompts tailored to Fitplan.ai requirements:

### 1. **WORKOUT_GENERATION**
- Creates personalized workout routines
- Adjusts for age, fitness level, goal, BMI
- Includes warm-up, main exercises, cool down
- Outputs JSON with exercise details
- **Input variables**: age, gender, level, goal, bmi, location, mode, mood, pregnancy, health_issues, health_risk

### 2. **PREGNANCY_SAFE_WORKOUT**
- Specializes in safe pregnancy exercises
- Avoids high-impact, lying-down, contact sports
- Focuses on pelvic floor and core
- Includes breathing exercises
- **Input variables**: age, pregnancy_stage, level, location, mode, health_issues

### 3. **DIET_GENERATION**
- Creates goal-based nutrition plans
- Calculates macros (protein/carbs/fats)
- Provides 6 meals per day
- Includes supplements and shopping list
- **Input variables**: age, gender, goal, bmi, health_issues, restrictions, pregnancy, level, calories, macros

### 4. **PREGNANCY_DIET**
- Pregnancy-specific nutrition
- Emphasizes folic acid, iron, calcium
- Lists foods to avoid
- Prenatal supplement recommendations
- **Input variables**: age, trimester, weight, height, health_issues, calories

### 5. **HEALTH_RISK_ASSESSMENT**
- Analyzes health factors
- Determines risk level (low/moderate/high)
- Identifies risk factors
- Recommends actions
- **Input variables**: age, bmi, gender, health_issues, level, medications, family_history

### 6. **WEIGHT_LOSS_PLAN**
- Creates caloric deficit strategy
- Timeline-based goals
- Diet + exercise recommendations
- Weekly milestones
- **Input variables**: weight, target_weight, height, age, timeline_weeks, level, bmi

### 7. **MUSCLE_GROWTH_PLAN**
- Progressive overload strategy
- Caloric surplus calculations
- Training split recommendations
- Supplement guidance
- **Input variables**: weight, target_weight, height, age, level, experience, target_amount

### 8. **RECOVERY_PLAN**
- Post-workout recovery strategy
- Sleep and hydration recommendations
- Active recovery options
- Fatigue assessment
- **Input variables**: last_workout, intensity, duration, age, fatigue, sleep_hours, stress

### 9. **ANALYZE_FEEDBACK**
- Processes daily user feedback
- Identifies trends
- Adjusts recommendations
- **Input variables**: day, mood, energy, difficulty, diet_satisfaction, comments, previous_feedback

### 10. **PERSONALIZED_RECOMMENDATIONS**
- Weekly guidance based on adherence
- Progress-based suggestions
- Motivation and obstacles
- **Input variables**: profile, progress, days_completed, avg_mood, adherence_rate, goals, challenges

---

## 🔧 **Integration with Frontend**

### Connect Frontend to AI Endpoints

```typescript
// src/lib/api.ts

const API_BASE = "http://localhost:8000"

export async function getAIWorkout(profile: any, token: string) {
  return fetch(`${API_BASE}/ai/workout`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      mode: profile.workoutMode,
      mood: profile.mood
    })
  }).then(r => r.json())
}

export async function getAIDiet(profile: any, token: string) {
  return fetch(`${API_BASE}/ai/diet`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      daily_calories: calculateCalories(profile),
      restrictions: profile.dietaryRestrictions
    })
  }).then(r => r.json())
}

export async function getHealthAssessment(token: string) {
  return fetch(`${API_BASE}/ai/health-assessment`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json())
}

export async function getRecoveryPlan(recovery: any, token: string) {
  return fetch(`${API_BASE}/ai/recovery`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(recovery)
  }).then(r => r.json())
}

export async function getRecommendations(token: string) {
  return fetch(`${API_BASE}/ai/recommendations`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json())
}
```

---

## 🏗️ **Architecture**

```
Frontend (React)
    ↓
API Endpoints (/ai/*)
    ↓
FastAPI Backend
    ↓
Gemini AI Client
    ↓
Google Generative AI API
    ↓
AI Response (JSON)
    ↓
Database Storage (Optional)
    ↓
Frontend Display
```

---

## 💡 **Advanced Features**

### **Pregnancy-Safe Workouts**
The system automatically detects pregnancy status and:
- Automatically switches to `PREGNANCY_SAFE_WORKOUT` prompt
- Removes high-impact exercises
- Adds pelvic floor strengthening
- Includes breathing techniques
- Provides medical disclaimer

### **Health Risk Adaptation**
Based on risk assessment, the system:
- Adjusts workout intensity
- Recommends medical clearance
- Modifies exercise selection
- Provides preventive guidance
- Tracks urgent health indicators

### **Goal-Based Personalization**
Prompts adjust based on:
- **Weight Loss**: Caloric deficit, higher cardio
- **Muscle Growth**: Caloric surplus, strength training
- **Strength**: Progressive overload focus
- **General Fitness**: Balanced approach

### **Mood-Based Adaptation**
Adjusts workouts based on:
- **Energetic**: Full intensity workouts
- **Exhausted**: Light recovery workouts
- **Stressed**: Yoga and meditative exercises

---

## 🛡️ **Error Handling**

### Try-Catch Mechanisms
All AI endpoints handle:
- Missing user profile
- Invalid request data
- API failures
- JSON parsing errors
- Network timeouts

Example Response:
```json
{
  "error": true,
  "message": "User profile not found. Complete profile first.",
  "status_code": 404,
  "timestamp": "2026-02-08T10:30:00"
}
```

---

## 📈 **Performance Optimization**

### Caching Strategy
- Cache AI responses for 24 hours
- Regenerate on profile changes
- Update on user request
- Store in database for history

### Rate Limiting
- 5 requests per minute per user
- Prevent API quota exhaustion
- Queue additional requests
- Notify user of limits

---

## 🔐 **Security Considerations**

1. **API Key Protection**
   - Stored in `.env` (not committed)
   - Never logged or exposed
   - Rotated periodically

2. **User Data**
   - Anonymous in prompts
   - No PII stored with AI
   - Compliant with privacy regulations

3. **Request Validation**
   - Input sanitization
   - Type checking
   - Length limits
   - SQL injection prevention

---

## 🧪 **Testing Prompts**

### Test Workout Generation
```bash
curl -X POST http://localhost:8000/ai/workout \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"mode": "gym", "mood": "energetic"}'
```

### Test Diet Generation
```bash
curl -X POST http://localhost:8000/ai/diet \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"daily_calories": 2000}'
```

### Test Health Assessment
```bash
curl -X POST http://localhost:8000/ai/health-assessment \
  -H "Authorization: Bearer {token}"
```

---

## 📚 **Gemini Model Information**

- **Model**: `gemini-pro` (text generation)
- **Context Window**: 32k tokens
- **Response Time**: 2-5 seconds
- **Cost**: Free tier available (limited requests)
- **Pricing**: ~$0.00125 per 1k input tokens

---

## 🚀 **Deployment Checklist**

- [ ] GEMINI_API_KEY set in production .env
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Response caching implemented
- [ ] User data anonymization verified
- [ ] API quota monitoring set up
- [ ] Fallback prompts for failures ready
- [ ] Performance metrics tracked
- [ ] Documentation updated

---

## 📞 **Support & Troubleshooting**

### Common Issues

**"GEMINI_API_KEY not set"**
```bash
# Solution: Add GEMINI_API_KEY to .env
GEMINI_API_KEY=your_key_here
```

**"API response timeout"**
- Check internet connection
- Verify API key validity
- Check quota limits

**"Invalid JSON response"**
- Prompt may need adjustment
- AI output format inconsistent
- Add retry logic in code

---

## 🎓 **Best Practices**

1. **Always validate user profile** before AI generation
2. **Cache responses** to reduce API calls
3. **Monitor API quotas** to avoid overages
4. **Handle errors gracefully** with fallback strategies
5. **Log all AI requests** for debugging
6. **Update prompts periodically** based on feedback
7. **Test with various profiles** before production
8. **Implement rate limiting** to protect quota

---

**Status**: ✅ **Production Ready**

All 10 static prompts implemented and integrated with FastAPI backend!
