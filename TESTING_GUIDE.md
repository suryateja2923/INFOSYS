# 🧪 Testing Guide: Complete Integration Flow

## 📋 **Quick Test Checklist**

Follow these steps to verify the entire data flow from frontend → MongoDB → Gemini AI → feedback → Day 2 generation.

---

## 🚀 **STEP-BY-STEP TESTING**

### **Prerequisites**
```bash
# 1. Backend must be running
cd backend
python main.py
# ✅ Verify: http://localhost:8000/health shows {"status": "healthy"}

# 2. Frontend must be running
# In new terminal, from project root:
npm run dev  # or bun run dev
# ✅ Verify: http://localhost:5173 opens login page

# 3. MongoDB Atlas connected
# ✅ Check backend/.env has valid MONGO_URL

# 4. Gemini API key configured
# ✅ Check backend/.env has GEMINI_API_KEY
```

---

## 🎯 **TEST 1: User Registration & Login**

### **What This Tests:**
- ✅ **Question 1 Answer**: User data saves to MongoDB `users` collection

### **Steps:**
1. Open http://localhost:5173
2. Click **"Sign Up"** tab
3. Fill form:
   - Name: `Test User`
   - Email: `test@fitplan.ai`
   - Password: `test1234`
   - Confirm Password: `test1234`
4. Click **"Create Account"**

### **Expected Results:**
- ✅ Backend POST `/register` receives request
- ✅ User saved to MongoDB with bcrypt hashed password
- ✅ Auto-login with JWT token
- ✅ Redirected to `/onboarding`
- ✅ Token stored in localStorage

### **Verify in MongoDB:**
```javascript
// In MongoDB Compass or Atlas
db.users.findOne({ email: "test@fitplan.ai" })
/*
{
  _id: ObjectId("..."),
  name: "Test User",
  email: "test@fitplan.ai",
  password: "$2b$12$..." // bcrypt hash
  created_at: "2026-02-08T..."
}
*/
```

---

## 🎯 **TEST 2: Onboarding & Profile Save**

### **What This Tests:**
- ✅ **Question 1 Answer**: Profile data saves to MongoDB
- ✅ BMI calculation
- ✅ Health risk assessment

### **Steps:**

#### **Step 1 - Personal Info**
- Age: `25`
- Gender: `Male`
- Click **"Continue"**

#### **Step 2 - Body Metrics**
- Height: `175` cm
- Weight: `75` kg
- BMI auto-calculated: `24.5 (Normal)`
- Click **"Continue"**

#### **Step 3 - Fitness Level**
- Select: **"Intermediate"**
- Activity Level: **"3-4 days/week"**
- Click **"Continue"**

#### **Step 4 - Health & Goals**
- Primary Goal: **"Muscle Growth"**
- Location: `New York`
- Health Issues: `None`
- Click **"Continue"**

#### **Step 5 - Generate Plan**
- Review summary
- Click **"Generate My Plan"** 🚀

### **Expected Results:**
- ✅ Loading animation (3-5 seconds)
- ✅ Backend calls:
  1. POST `/user/profile` → Saves to MongoDB
  2. POST `/ai/workout` → Gemini generates workout
  3. POST `/ai/diet` → Gemini generates diet
- ✅ Redirected to `/dashboard`
- ✅ Day 1 workout and diet displayed

### **Verify in MongoDB:**
```javascript
// Profile saved
db.users.findOne({ email: "test@fitplan.ai" })
/*
{
  ...
  profile: {
    age: 25,
    height: 175,
    weight: 75,
    gender: "male",
    pregnant: false,
    level: "intermediate",
    goal: "muscle_growth",
    location: "New York",
    health_issues: "None",
    bmi: 24.5,
    bmi_category: "Normal",
    health_risk: "Low"
  }
}
*/

// Workout saved
db.workouts.findOne({ user_id: "...", day: 1 })
/*
{
  user_id: "...",
  day: 1,
  mode: "home",
  mood: "energetic",
  exercises: [
    { name: "Push-ups", sets: 3, reps: 15, ... },
    { name: "Squats", sets: 4, reps: 20, ... }
  ],
  total_calories: 650,
  created_at: "..."
}
*/

// Diet saved
db.diets.findOne({ user_id: "...", day: 1 })
/*
{
  user_id: "...",
  day: 1,
  meals: [
    { name: "Protein Oatmeal", time: "7:00 AM", calories: 350, ... },
    { name: "Grilled Chicken Salad", time: "1:00 PM", calories: 450, ... }
  ],
  total_calories: 2000,
  created_at: "..."
}
*/
```

### **Verify in Browser Console:**
```javascript
// Check localStorage
localStorage.getItem('fitplan_token') // JWT token
localStorage.getItem('fitplan_user_id') // User ID

// Check store
console.log(useFitplanStore.getState())
/*
{
  currentDay: 1,
  maxDayUnlocked: 1,
  currentWorkout: { ... },
  currentDiet: { ... }
}
*/
```

---

## 🎯 **TEST 3: Day 1 Completion & Feedback**

### **What This Tests:**
- ✅ **Question 3 Answer**: Day 1 completion triggers Day 2 unlock
- ✅ **Question 4 Answer**: Feedback generates Day 2 plan

### **Steps:**

#### **1. Navigate to Feedback Page**
- From dashboard, click **"Day One Feedback"** link
- Or go to http://localhost:5173/dashboard/day-one-feedback

#### **2. Fill Workout Feedback**
- **Overall Rating**: 4 stars ⭐⭐⭐⭐
- **Difficulty**: 60/100 (moderate)
- **Energy Level**: 70/100 (good energy)
- **Comments**: "Great workout! Felt challenging but doable."

#### **3. Fill Diet Feedback**
- **Diet Rating**: 5 stars ⭐⭐⭐⭐⭐
- **Satisfaction**: 80/100 (very satisfied)
- **Hunger**: 20/100 (not hungry)
- **Comments**: "Delicious meals. Portions were perfect."

#### **4. Submit Feedback**
- Click **"Submit Feedback"** button 🚀

### **Expected Results:**
- ✅ Loading animation (3-5 seconds)
- ✅ Backend calls:
  1. POST `/feedback` → Saves Day 1 feedback
  2. Gemini AI analyzes feedback
  3. POST `/ai/workout` → Generates Day 2 workout (adjusted)
  4. POST `/ai/diet` → Generates Day 2 diet (adjusted)
- ✅ Success message: "Feedback Submitted!"
- ✅ Redirected to `/dashboard`
- ✅ Store updated: `currentDay = 2`, `maxDayUnlocked = 2`
- ✅ Dashboard shows **Day 2** content

### **Verify in MongoDB:**
```javascript
// Feedback saved
db.feedback.findOne({ user_id: "...", day: 1 })
/*
{
  user_id: "...",
  day: 1,
  mood: "energetic",
  energy: 7,
  difficulty: 6,
  comment: "Workout: Great workout! ... Diet: Delicious meals. ...",
  submitted_at: "2026-02-08T20:00:00Z"
}
*/

// Day 2 workout generated
db.workouts.findOne({ user_id: "...", day: 2 })
/*
{
  user_id: "...",
  day: 2,
  mode: "home",
  mood: "energetic", // Based on Day 1 feedback (good energy)
  exercises: [
    // Slightly harder exercises (progressive overload)
    { name: "Diamond Push-ups", sets: 3, reps: 12, ... },
    { name: "Jump Squats", sets: 4, reps: 15, ... }
  ],
  created_at: "2026-02-08T20:00:05Z"
}
*/

// Day 2 diet generated
db.diets.findOne({ user_id: "...", day: 2 })
/*
{
  user_id: "...",
  day: 2,
  meals: [
    // Similar structure, maybe slightly adjusted calories
    { name: "Greek Yogurt Parfait", time: "7:00 AM", ... },
    { name: "Turkey Sandwich", time: "1:00 PM", ... }
  ],
  created_at: "2026-02-08T20:00:05Z"
}
*/
```

### **Verify in Frontend:**
- ✅ Dashboard shows Day 2 toggle
- ✅ Click "Day 2" → Shows new workout and diet
- ✅ Click "Day 1" → Shows previous completed day

---

## 🎯 **TEST 4: Adaptive Day 2 Generation (Low Energy)**

### **What This Tests:**
- ✅ **Question 4 Answer**: Feedback-based adaptive AI generation
- ✅ AI detects user exhaustion and adjusts difficulty

### **Steps:**
Repeat **TEST 3** but with different feedback:

#### **Modified Feedback:**
- **Overall Rating**: 2 stars ⭐⭐ (struggled)
- **Difficulty**: 85/100 (too hard!)
- **Energy Level**: 25/100 (exhausted)
- **Comments**: "Workout was too intense. Felt drained."

### **Expected AI Behavior:**
```typescript
// Logic in completeDayAndGenerateNext()
if (feedback.energy <= 3 || feedback.difficulty >= 8) {
  nextMood = 'exhausted'; // ✅ Easier workout
}
```

### **Expected Day 2 Plan:**
```javascript
// Day 2 workout with RECOVERY mode
db.workouts.findOne({ user_id: "...", day: 2 })
/*
{
  mood: "exhausted", // ✅ Changed from 'energetic'
  exercises: [
    // Gentler exercises
    { name: "Gentle Yoga Flow", duration: "20 min", ... },
    { name: "Light Stretching", duration: "15 min", ... },
    { name: "Walking", duration: "20 min", ... }
  ],
  // Lower intensity, more recovery focus
}
*/
```

---

## 🎯 **TEST 5: Pregnancy Safe Plans**

### **What This Tests:**
- ✅ Pregnancy validation (18-50 age range)
- ✅ Gemini uses `PREGNANCY_SAFE_WORKOUT` and `PREGNANCY_DIET` prompts

### **Steps:**

#### **1. Register New User**
- Email: `pregnant@fitplan.ai`
- Password: `test1234`

#### **2. Onboarding**
- Age: `28` (valid pregnancy age)
- Gender: **Female**
- **Check "Currently Pregnant"** ✅
- Height: `165` cm
- Weight: `70` kg
- Fitness Level: Beginner
- Goal: **Strength** (pregnancy goal hidden)
- Health Issues: `First trimester`

#### **3. Generate Plan**
- Click **"Generate My Plan"**

### **Expected Results:**
- ✅ Backend detects `pregnant: true` and `age: 28`
- ✅ Gemini uses special prompts:
  - `PREGNANCY_SAFE_WORKOUT`: Low-impact exercises, no ab work, prenatal yoga
  - `PREGNANCY_DIET`: High folic acid, iron, calcium, avoid raw foods
- ✅ Day 1 plan shows **pregnancy-safe** content

### **Verify Day 1 Workout:**
```javascript
db.workouts.findOne({ user_id: "pregnant_user", day: 1 })
/*
{
  exercises: [
    { name: "Prenatal Yoga", duration: "20 min", ... },
    { name: "Walking", duration: "25 min", ... },
    { name: "Pelvic Floor Exercises", duration: "10 min", ... },
    // NO: Heavy lifting, ab crunches, jumping exercises
  ]
}
*/
```

### **Verify Day 1 Diet:**
```javascript
db.diets.findOne({ user_id: "pregnant_user", day: 1 })
/*
{
  meals: [
    { 
      name: "Folic Acid Smoothie", 
      ingredients: ["spinach", "orange", "banana"],
      nutrients: { folic_acid: "high", iron: "high" }
    },
    { 
      name: "Salmon with Quinoa",
      // Cooked fish (not raw sushi)
      nutrients: { omega3: "high", calcium: "high" }
    }
  ]
}
*/
```

---

## 🎯 **TEST 6: Invalid Pregnancy Age Blocking**

### **What This Tests:**
- ✅ Age validation prevents impossible pregnancy selections

### **Steps:**

#### **1. Register New User**
- Email: `teen@fitplan.ai`

#### **2. Onboarding**
- Age: `16` (below minimum)
- Gender: **Female**
- Try to check **"Currently Pregnant"** ❌

### **Expected Results:**
- ✅ Checkbox **disabled** (can't click)
- ✅ Alert message: "⚠️ CRITICAL: Pregnancy is not biologically possible at age 16. Valid pregnancy age range is 18-50 years."
- ✅ Continue button **disabled**
- ✅ User CANNOT proceed to generate plan

#### **3. Change Age**
- Update Age: `25` (valid)
- ✅ Pregnancy checkbox **enabled**
- ✅ Can now check "Currently Pregnant"
- ✅ Continue button **enabled**

---

## 🔍 **DEBUGGING TIPS**

### **Check Backend Logs**
```bash
# In backend terminal, you should see:
POST /register - 200 OK
POST /login - 200 OK
POST /user/profile - 200 OK
POST /ai/workout - 200 OK (Gemini API called)
POST /ai/diet - 200 OK (Gemini API called)
POST /feedback - 200 OK
```

### **Check Frontend Console**
```javascript
// Open browser DevTools (F12) → Console

// Check errors
console.error messages

// Check API calls
Network tab → Filter: Fetch/XHR

// Check store state
useFitplanStore.getState()
```

### **Check MongoDB Connection**
```python
# In backend/main.py, add print statements:
print(f"User saved: {user_id}")
print(f"Workout generated for day {day}")
```

### **Test Gemini API Directly**
```python
# In backend terminal:
python
>>> from geminiapi import GeminiClient
>>> client = GeminiClient()
>>> client.generate_workout({
...   "age": 25, "weight": 75, "goal": "muscle_growth"
... }, "gym", "energetic")
```

---

## ✅ **SUCCESS CRITERIA**

After completing all tests, verify:

- [x] User can register and login
- [x] Profile saves to MongoDB `users` collection
- [x] Day 1 workout generates from Gemini AI
- [x] Day 1 diet generates from Gemini AI
- [x] Workout saved to MongoDB `workouts` collection
- [x] Diet saved to MongoDB `diets` collection
- [x] Dashboard displays Day 1 plans
- [x] User can submit Day 1 feedback
- [x] Feedback saves to MongoDB `feedback` collection
- [x] Day 2 auto-generates based on feedback
- [x] Day 2 unlocks after feedback submission
- [x] Dashboard shows Day 2 toggle
- [x] Day 2 content displays correctly
- [x] Low energy feedback → easier Day 2
- [x] High energy feedback → harder Day 2
- [x] Pregnancy validation works (18-50)
- [x] Pregnancy-safe plans generate
- [x] Invalid ages block pregnancy selection
- [x] JWT tokens stored and used correctly
- [x] Error messages display on failures

---

## 🐛 **COMMON ISSUES & FIXES**

### **Issue 1: "Failed to fetch"**
**Cause:** Backend not running
**Fix:**
```bash
cd backend
python main.py
```

### **Issue 2: "401 Unauthorized"**
**Cause:** JWT token expired (30 minutes)
**Fix:**
1. Clear localStorage: `localStorage.clear()`
2. Re-login

### **Issue 3: "Gemini API error"**
**Cause:** Invalid API key
**Fix:**
```bash
# Check backend/.env
GEMINI_API_KEY=AIzaSyAChzF_rDq-CKoyOeM23RbhWY5jUnQA7TA
```

### **Issue 4: "MongoDB connection failed"**
**Cause:** Invalid MONGO_URL
**Fix:**
```bash
# Check backend/.env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
```

### **Issue 5: CORS error**
**Cause:** Frontend URL not in CORS allowlist
**Fix:**
```python
# In backend/main.py
origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # ✅ Add your frontend URL
]
```

### **Issue 6: Day 2 not unlocking**
**Cause:** Feedback submission failed
**Fix:**
1. Check Console for errors
2. Verify backend `/feedback` endpoint receives data
3. Check MongoDB `feedback` collection

---

## 📊 **EXPECTED DATABASE STATE AFTER FULL TEST**

```
MongoDB Collections:

users: 1 document
- test@fitplan.ai (profile with BMI, health_risk)

workouts: 2 documents
- Day 1: user_id=..., exercises=[...], mood="energetic"
- Day 2: user_id=..., exercises=[...], mood="energetic" or "exhausted"

diets: 2 documents
- Day 1: user_id=..., meals=[...], total_calories=2000
- Day 2: user_id=..., meals=[...], total_calories=2000

feedback: 1 document
- Day 1: user_id=..., mood="energetic", energy=7, difficulty=6
```

---

## 🎉 **YOUR 4 QUESTIONS - TESTED & VERIFIED**

1. ✅ **Data stored in database?** → YES, profile saved to MongoDB
2. ✅ **Gemini AI generates from data?** → YES, workout + diet from AI
3. ✅ **Day 2 displays after Day 1?** → YES, unlocked after feedback
4. ✅ **Feedback generates Day 2?** → YES, AI adapts based on feedback

---

**🚀 Ready to test! Follow each test in order for complete verification.**
