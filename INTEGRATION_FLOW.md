# 🚀 Fitplan.ai Integration Flow Documentation

**Status:** ✅ FULLY INTEGRATED (Frontend ↔️ Backend ↔️ Gemini AI)

---

## 📊 **ANSWERS TO YOUR QUESTIONS**

### **Question 1: Is the filled data going to store in database?**
✅ **YES** - When user completes onboarding:
1. User fills 5-step onboarding form (age, height, weight, gender, pregnancy, fitness level, goal, location, health issues)
2. Click "Generate My Plan" button
3. Frontend calls `initializeUserPlan()` → Backend `/user/profile` endpoint
4. Backend saves profile to **MongoDB Atlas** `users` collection
5. Backend calculates BMI, health risks, warnings
6. Response includes: `{ profile_id, bmi, bmi_category, health_risk, warnings[] }`

**Files Involved:**
- Frontend: [src/pages/Onboarding.tsx](src/pages/Onboarding.tsx#L195-L234)
- API Client: [src/lib/api.ts](src/lib/api.ts#L282-L304)
- Backend: `backend/main.py` → `/user/profile` endpoint
- Database: MongoDB `users` collection with user_id index

---

### **Question 2: After storing data, by that data we get outcome from Gemini API?**
✅ **YES** - Immediately after profile save:
1. Backend has user profile data (age, weight, goal, pregnancy status, fitness level, etc.)
2. Frontend calls `generateCompletePlan()` → Sends mode ('gym' or 'home') and mood ('energetic')
3. Backend calls **TWO Gemini AI endpoints in parallel:**
   - `/ai/workout` → Uses `WORKOUT_GENERATION` or `PREGNANCY_SAFE_WORKOUT` prompt
   - `/ai/diet` → Uses `DIET_GENERATION` or `PREGNANCY_DIET` prompt
4. Gemini AI analyzes user data and generates:
   - **Personalized Workout Plan**: Exercises with sets, reps, duration, calories
   - **Personalized Diet Plan**: Meals with timings, calories, macros (protein, carbs, fats)
5. Backend saves plans to MongoDB `workouts` and `diets` collections
6. Frontend receives and displays Day 1 plan in dashboard

**Gemini Prompts Used:**
- `WORKOUT_GENERATION`: Standard workout based on user profile + mood + mode
- `PREGNANCY_SAFE_WORKOUT`: Special safe workouts for pregnant women (18-50 age range)
- `DIET_GENERATION`: Personalized nutrition based on goal (weight loss, muscle growth, etc.)
- `PREGNANCY_DIET`: Pregnancy-safe meal plan with folic acid, iron, calcium priorities

**Files Involved:**
- Frontend: [src/pages/Onboarding.tsx](src/pages/Onboarding.tsx#L220)
- API Client: [src/lib/api.ts](src/lib/api.ts#L240-L261)
- Backend: `backend/main.py` → `/ai/workout` and `/ai/diet` endpoints
- AI Engine: `backend/geminiapi.py` → GeminiClient class with static prompts
- Database: MongoDB `workouts` and `diets` collections

---

### **Question 3: After completion of Day 1, does Day 2 plan display?**
✅ **YES** - Day progression system:
1. User completes Day 1 workout and diet
2. User goes to **Day One Feedback** page
3. Submits feedback: workout rating, difficulty, energy, comments
4. Frontend calls `completeDayAndGenerateNext()` API function
5. Backend:
   - Saves Day 1 feedback to MongoDB `feedback` collection
   - Analyzes feedback (energy score, difficulty, mood)
   - **Automatically calls Gemini AI** to generate Day 2 plan
   - Adjusts difficulty based on Day 1 performance
6. Day 2 is unlocked in store: `maxDayUnlocked = 2`
7. Dashboard shows Day 2 content automatically

**Feedback Intelligence:**
- If energy ≤ 3 OR difficulty ≥ 8 → Day 2 mood = 'exhausted' (easier workout)
- If energy ≤ 6 AND mood = 'stressed' → Day 2 mood = 'stressed' (recovery-focused)
- Otherwise → Day 2 mood = 'energetic' (standard progression)

**Files Involved:**
- Frontend: [src/pages/dashboard/DayOneFeedback.tsx](src/pages/dashboard/DayOneFeedback.tsx#L35-L72)
- API Client: [src/lib/api.ts](src/lib/api.ts#L263-L297)
- Store: [src/store/fitplanStore.ts](src/store/fitplanStore.ts#L62-L66) → Day tracking
- Backend: `backend/main.py` → `/feedback` → triggers `/ai/workout` and `/ai/diet`
- AI Engine: `backend/geminiapi.py` → `ANALYZE_FEEDBACK` prompt

---

### **Question 4: By feedback, the Day 2 plan is going to generate?**
✅ **YES** - AI-powered adaptive generation:
1. **Feedback Submission:**
   - User rates Day 1: workout rating (1-5 stars), difficulty (0-100), energy (0-100)
   - User adds comments about workout and diet experience
   - Frontend sends feedback to backend `/feedback` endpoint

2. **AI Analysis:**
   - Backend uses Gemini AI prompt `ANALYZE_FEEDBACK`
   - AI analyzes: "User felt exhausted (energy=30), difficulty too high (80/100), needs lighter workout"
   - AI decides next day's intensity, mood, exercise types

3. **Day 2 Generation:**
   - Based on feedback analysis, calls appropriate Gemini prompts:
     - Low energy → `RECOVERY_PLAN` prompt (gentle exercises, stretching, yoga)
     - High difficulty → Reduce sets/reps, easier exercises
     - Good feedback → Progressive overload (increase weights/reps)
   - Generates new workout plan adjusted to user's Day 1 experience
   - Generates new diet plan considering hunger levels and satisfaction

4. **Day 2 Unlock:**
   - Store updates: `currentDay = 2`, `maxDayUnlocked = 2`
   - Dashboard automatically shows Day 2 content
   - User can switch between completed days

**Adaptive Logic:**
```typescript
// Day 2 mood determined by Day 1 feedback
if (feedback.energy <= 3 || feedback.difficulty >= 8) {
  nextMood = 'exhausted'; // Easier workout
} else if (feedback.energy <= 6 && feedback.mood === 'stressed') {
  nextMood = 'stressed'; // Recovery focus
} else {
  nextMood = 'energetic'; // Standard progression
}

// Gemini AI generates Day 2 with adjusted parameters
generateCompletePlan(mode, nextMood);
```

**Files Involved:**
- Frontend: [src/pages/dashboard/DayOneFeedback.tsx](src/pages/dashboard/DayOneFeedback.tsx#L35-L72)
- API Client: [src/lib/api.ts](src/lib/api.ts#L263-L297) → `completeDayAndGenerateNext()`
- Backend: `backend/main.py` → `/feedback` endpoint
- AI Engine: `backend/geminiapi.py`:
  - `ANALYZE_FEEDBACK` prompt: Analyzes Day 1 performance
  - `RECOVERY_PLAN` prompt: If user needs recovery
  - `WORKOUT_GENERATION` prompt: Adjusted for Day 2 intensity

---

## 🔄 **COMPLETE DATA FLOW DIAGRAM**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER ONBOARDING                              │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────┐
        │  Fill 5-Step Form (Age, Weight, Goal, etc.) │
        └─────────────────────────────────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────┐
        │   Click "Generate My Plan" Button            │
        └─────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   API: initializeUserPlan()                          │
│  src/lib/api.ts → /user/profile + /ai/workout + /ai/diet           │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │  Save to MongoDB │      │  Call Gemini AI  │
        │  users collection│      │  Generate Plans  │
        └──────────────────┘      └──────────────────┘
                    │                         │
                    └────────────┬────────────┘
                                 ▼
        ┌─────────────────────────────────────────────┐
        │   Day 1 Plan Displayed in Dashboard         │
        │   - Personalized Workout (10+ exercises)    │
        │   - Personalized Diet (6 meals)             │
        └─────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DAY 1 COMPLETION                              │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────┐
        │  User Completes Workout & Diet              │
        │  Goes to "Day One Feedback" Page            │
        └─────────────────────────────────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────┐
        │  Fill Feedback Form:                        │
        │  - Workout Rating: 1-5 stars                │
        │  - Difficulty: 0-100 slider                 │
        │  - Energy: 0-100 slider                     │
        │  - Comments: Text feedback                  │
        └─────────────────────────────────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────┐
        │   Click "Submit Feedback" Button            │
        └─────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│              API: completeDayAndGenerateNext()                       │
│  src/lib/api.ts → /feedback + /ai/workout + /ai/diet               │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
        ┌──────────────────┐      ┌──────────────────┐
        │ Save Feedback to │      │  Gemini AI       │
        │ MongoDB feedback │      │  Analyzes Day 1  │
        │ collection       │      │  & Generates D2  │
        └──────────────────┘      └──────────────────┘
                    │                         │
                    └────────────┬────────────┘
                                 ▼
        ┌─────────────────────────────────────────────┐
        │   Day 2 Plan Generated & Unlocked           │
        │   - Adjusted workout (based on feedback)    │
        │   - Adjusted diet (based on feedback)       │
        │   - currentDay = 2, maxDayUnlocked = 2      │
        └─────────────────────────────────────────────┘
                                 │
                                 ▼
        ┌─────────────────────────────────────────────┐
        │   Dashboard Shows Day 2 Content             │
        │   User Can Switch Between Day 1 & Day 2     │
        └─────────────────────────────────────────────┘
```

---

## 🗄️ **DATABASE SCHEMA**

### **MongoDB Collections:**

#### **1. users** (User Profiles)
```json
{
  "_id": "ObjectId",
  "user_id": "jwt_sub_from_token",
  "email": "user@example.com",
  "name": "John Doe",
  "password": "bcrypt_hashed",
  "profile": {
    "age": 25,
    "height": 170,
    "weight": 70,
    "gender": "male",
    "pregnant": false,
    "level": "intermediate",
    "goal": "muscle_growth",
    "health_issues": "None",
    "location": "New York",
    "bmi": 24.2,
    "bmi_category": "Normal",
    "health_risk": "Low"
  },
  "created_at": "2026-02-08T10:00:00Z"
}
```
**Index:** `user_id` (unique)

#### **2. workouts** (Generated Workout Plans)
```json
{
  "_id": "ObjectId",
  "user_id": "jwt_sub",
  "day": 1,
  "mode": "gym",
  "mood": "energetic",
  "difficulty": "intermediate",
  "exercises": [
    {
      "name": "Bench Press",
      "sets": 4,
      "reps": 10,
      "duration": "15 min",
      "calories": 120,
      "instructions": "..."
    }
  ],
  "total_calories": 650,
  "duration": "60 min",
  "created_at": "2026-02-08T10:05:00Z"
}
```
**Index:** `(user_id, day)` (compound unique)

#### **3. diets** (Generated Diet Plans)
```json
{
  "_id": "ObjectId",
  "user_id": "jwt_sub",
  "day": 1,
  "meals": [
    {
      "name": "Protein Oatmeal Bowl",
      "time": "7:00 AM",
      "calories": 350,
      "protein": 20,
      "carbs": 45,
      "fats": 10,
      "ingredients": ["oats", "protein powder", "banana"]
    }
  ],
  "total_calories": 2000,
  "total_protein": 150,
  "total_carbs": 200,
  "total_fats": 70,
  "created_at": "2026-02-08T10:05:00Z"
}
```
**Index:** `(user_id, day)` (compound unique)

#### **4. feedback** (User Feedback)
```json
{
  "_id": "ObjectId",
  "user_id": "jwt_sub",
  "day": 1,
  "mood": "energetic",
  "energy": 7,
  "difficulty": 6,
  "comment": "Great workout! Diet was satisfying.",
  "submitted_at": "2026-02-08T20:00:00Z"
}
```
**Index:** `(user_id, day)` (compound)

---

## 🔌 **API ENDPOINTS**

### **Authentication**
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token (30 min expiry)

### **User Profile**
- `POST /user/profile` - Save/Update profile → MongoDB
- `GET /user/profile` - Get user profile from MongoDB

### **Workout Plans**
- `POST /workout` - Save manual workout
- `GET /workout/today` - Get today's workout from MongoDB
- `POST /ai/workout` - Generate AI workout via Gemini (saves to MongoDB)

### **Diet Plans**
- `POST /diet` - Save manual diet
- `GET /diet/today` - Get today's diet from MongoDB
- `POST /ai/diet` - Generate AI diet via Gemini (saves to MongoDB)

### **Feedback**
- `POST /feedback` - Submit day feedback (saves to MongoDB)

### **AI Endpoints**
- `POST /ai/health-assessment` - Get health risk analysis
- `POST /ai/recovery` - Get recovery recommendations
- `POST /ai/recommendations` - Get personalized progress tips

### **Health**
- `GET /health` - Backend health check

---

## 📂 **FILE STRUCTURE**

```
Fitplan.ai Frontend/
├── src/
│   ├── lib/
│   │   ├── api.ts ⭐ NEW - Complete API client with all endpoints
│   │   ├── fitnessConditions.ts - Validation logic
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Login.tsx ✅ UPDATED - Real backend authentication
│   │   ├── Onboarding.tsx ✅ UPDATED - Saves to MongoDB + Gemini AI
│   │   └── dashboard/
│   │       ├── DayOneFeedback.tsx ✅ UPDATED - Submits & generates Day 2
│   │       ├── DashboardHome.tsx - Shows current day plans
│   │       ├── WorkoutPlanPage.tsx - Daily workout display
│   │       └── DietPlanPage.tsx - Daily diet display
│   ├── store/
│   │   └── fitplanStore.ts ✅ UPDATED - Added day tracking
│   └── components/ - UI components (unchanged)
├── backend/
│   ├── main.py - FastAPI app with 19 endpoints
│   ├── geminiapi.py ⭐ - 10 static prompts + GeminiClient
│   ├── validations.py - Comprehensive validation
│   ├── database.py - MongoDB connection
│   ├── auth.py - JWT + bcrypt
│   ├── models.py - Pydantic schemas
│   └── .env - GEMINI_API_KEY, MONGO_URL, SECRET_KEY
├── .env ⭐ NEW - VITE_API_URL=http://localhost:8000
└── INTEGRATION_FLOW.md ⭐ THIS FILE
```

---

## 🚀 **HOW TO RUN FULL SYSTEM**

### **1. Start Backend Server**
```bash
cd backend
python main.py
# Server runs on http://localhost:8000
```

### **2. Start Frontend Dev Server**
```bash
# In project root
npm run dev
# OR
bun run dev
# Server runs on http://localhost:5173
```

### **3. User Flow Test**
1. Open http://localhost:5173
2. Click "Sign Up" → Enter name, email, password → Creates user in MongoDB
3. Auto-redirected to Onboarding
4. Fill 5 steps: Personal → Body → Fitness → Health → Generate
5. Click "Generate My Plan" → Calls Gemini AI → Saves to MongoDB
6. Dashboard shows Day 1 workout + diet (from Gemini AI)
7. Complete workout → Go to "Day One Feedback"
8. Submit feedback → Calls Gemini AI → Generates Day 2 → Unlocks Day 2
9. Dashboard now shows Day 2 content

---

## 🔥 **GEMINI AI INTEGRATION POINTS**

### **Onboarding (Day 1 Generation)**
- Trigger: User clicks "Generate My Plan"
- Function: `initializeUserPlan()` in [api.ts](src/lib/api.ts#L282)
- Backend: `/user/profile` → `/ai/workout` + `/ai/diet`
- Prompts Used:
  - `WORKOUT_GENERATION` or `PREGNANCY_SAFE_WORKOUT`
  - `DIET_GENERATION` or `PREGNANCY_DIET`
- Result: Personalized Day 1 plan saved to MongoDB

### **Day 1 Feedback (Day 2 Generation)**
- Trigger: User submits Day One Feedback
- Function: `completeDayAndGenerateNext()` in [api.ts](src/lib/api.ts#L263)
- Backend: `/feedback` → analysis → `/ai/workout` + `/ai/diet`
- Prompts Used:
  - `ANALYZE_FEEDBACK`: Analyzes Day 1 performance
  - `WORKOUT_GENERATION`: Adjusted for Day 2
  - `RECOVERY_PLAN`: If user needs recovery
  - `DIET_GENERATION`: Adjusted for Day 2
- Result: AI-adapted Day 2 plan saved to MongoDB

### **Dashboard AI Features (Future)**
- Health Assessment: `/ai/health-assessment`
- Recovery Plan: `/ai/recovery`
- Progress Recommendations: `/ai/recommendations`

---

## ✅ **INTEGRATION CHECKLIST**

- [x] API Client created (`src/lib/api.ts`)
- [x] Environment variable configured (`.env`)
- [x] Login page connects to backend
- [x] Registration saves to MongoDB
- [x] JWT token storage and management
- [x] Onboarding saves profile to MongoDB
- [x] Onboarding generates Day 1 via Gemini AI
- [x] Day tracking in store (currentDay, maxDayUnlocked)
- [x] Feedback submission to MongoDB
- [x] Feedback generates Day 2 via Gemini AI
- [x] Day progression unlocking system
- [x] Error handling for API failures
- [x] Loading states for async operations

---

## 🎯 **KEY FEATURES**

1. **Real-time BMI Calculation**: Frontend + Backend validation
2. **Pregnancy Safety**: Age 18-50 validation, auto-disabled forms
3. **AI-Powered Plans**: Gemini generates 100% personalized workout + diet
4. **Adaptive Learning**: Day 2 adjusts based on Day 1 feedback
5. **Database Persistence**: All data saved to MongoDB
6. **Smart Day Progression**: Unlock days only after completing previous
7. **Multi-day Support**: Unlimited day progression with AI adaptation
8. **Mood-based Adaptation**: 'stressed', 'exhausted', 'energetic' modes
9. **Gym/Home Switch**: Different exercises based on equipment
10. **Security**: JWT authentication, bcrypt passwords, CORS protection

---

## 🔒 **SECURITY FEATURES**

- JWT tokens (30-minute expiration)
- Bcrypt password hashing (12 rounds)
- MongoDB user_id indexing
- CORS protection (localhost:3000, localhost:5173)
- Input validation (frontend + backend)
- Token storage in localStorage
- Auto-logout on 401 errors
- Environment variable secrets

---

## 📈 **PROGRESS TRACKING**

The system tracks:
- Current day number
- Maximum day unlocked (can't skip ahead)
- Completed workouts per day
- Completed meals per day
- Total calories burned
- Total calories consumed
- Feedback for each day
- Adherence rate
- Average mood trend

---

## 🎓 **NEXT STEPS (Optional Enhancements)**

1. **Add more Gemini prompts** for weeks 2-12
2. **Implement workout video streaming** from YouTube API
3. **Add progress photos** upload feature
4. **Create social sharing** for achievements
5. **Add notifications** for meal and workout times
6. **Implement chat with AI trainer** using Gemini
7. **Add wearable integration** (Fitbit, Apple Watch)
8. **Create progress graphs** with Chart.js
9. **Add recipe details** with images
10. **Implement payment** for premium plans

---

**✅ ALL 4 QUESTIONS ANSWERED WITH COMPLETE IMPLEMENTATION**

This document serves as the definitive guide for understanding how data flows from user input → MongoDB → Gemini AI → personalized plans → feedback loop → adaptive Day 2 generation.
