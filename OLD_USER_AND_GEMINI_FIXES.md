# Fixes for: Old User Re-Onboarding & Gemini API Issues

## Issues Fixed

### Issue 1: Old Users Being Re-Asked for Personal Information
**Problem:** When an existing user logged in, they were redirected to the onboarding page again instead of the dashboard.

**Root Cause:** 
- The `isOnboarded` flag in the store was not being updated after login
- The store relied on local memory which was reset on page refresh
- No profile loading happened after login

**Solution Implemented:**

#### 1. **Updated Login.tsx** - Fetch user profile after login
```typescript
// Before: Just checked store's isOnboarded flag
if (isOnboarded) { navigate('/dashboard'); }

// After: Fetch profile from backend to verify onboarding status
const userProfile = await profileAPI.getProfile();
if (userProfile?.profile) {
  useFitplanStore.getState().setProfile(userProfile.profile);
  useFitplanStore.getState().setOnboarded(true);
  await loadUserPlanData();  // ← Load their saved plans
  navigate('/dashboard');
}
```

#### 2. **Added loadUserPlanData() function** in api.ts
- Fetches user's existing workout and diet plans from backend
- Loads them into the Zustand store
- Handles missing plans gracefully (returns empty, plans generated on demand)

#### 3. **Changes Made:**
- [src/pages/Login.tsx](src/pages/Login.tsx#L50-L85): Updated login flow to fetch and validate profile
- [src/lib/api.ts](src/lib/api.ts#L380-L410): Added `loadUserPlanData()` function

---

### Issue 2: Gemini API Not Returning Workouts/Diets
**Problem:** Frontend was not receiving workout and diet data from Google Gemini API.

**Root Cause:**
- **Data Format Mismatch**: The Gemini API returns data in different structure than expected:
  - Gemini returns: `{ warm_up: [...], main_exercises: [...], cool_down: [...] }`
  - Frontend expects: `{ exercises: [...] }`
  - Gemini returns: `{ meals: { breakfast: {...}, lunch: {...} } }`
  - Frontend expects: `{ meals: [{...}, {...}] }`

**Solution Implemented:**

#### 1. **Transform Gemini Workout Response** in backend/geminiapi.py
```python
# OLD: Returned Gemini response as-is (wrong format for frontend)
return json.loads(response)

# NEW: Transform to frontend-expected format
exercises = []
exercises.extend(workout_data.get("warm_up", []))
exercises.extend(workout_data.get("main_exercises", []))
exercises.extend(workout_data.get("cool_down", []))

return {
    "exercises": exercises,  # ← Combined array
    "total_calories": workout_data.get("total_calories"),
    "day": workout_data.get("day"),
    # ... rest of fields ...
}
```

#### 2. **Transform Gemini Diet Response** in backend/geminiapi.py
```python
# OLD: Returned meals object with breakfast/lunch keys (wrong format)
meals_obj = diet_data["meals"]  # { breakfast: {...}, lunch: {...} }

# NEW: Transform to meals array for frontend
meals = []
for meal_type, meal_info in meals_obj.items():
    meals.append({
        "name": f"{meal_type.replace('_', ' ').title()}",
        "time": meal_info.get("time", ""),
        "calories": meal_info.get("calories", 0),
        # ... rest of fields ...
    })

return {
    "meals": meals,  # ← Array format
    "total_calories": diet_data.get("total_calories"),
    # ... rest of fields ...
}
```

#### 3. **Changes Made:**
- [backend/geminiapi.py](backend/geminiapi.py#L697-L742): Updated `get_ai_workout()` to transform response
- [backend/geminiapi.py](backend/geminiapi.py#L745-L790): Updated `get_ai_diet()` to transform response

---

## Data Flow After Fixes

### For Old Users Logging In:
```
1. User clicks "Sign In"
2. Backend validates credentials
3. Frontend calls: profileAPI.getProfile()
4. ✅ Profile found → User is onboarded
5. Frontend calls: loadUserPlanData()
6. ✅ Existing plans loaded into store
7. User redirected to /dashboard
8. Dashboard displays their saved workouts & diets
```

### For New Users (Onboarding):
```
1. User fills profile → clicks "Generate"
2. Frontend calls: initializeUserPlan(profile, mode)
3. Backend:
   - Saves profile to MongoDB
   - Calls Gemini AI for workout
   - Calls Gemini AI for diet
4. ✅ Gemini responses transformed to correct format
5. Frontend receives: { exercises: [...], meals: [...] }
6. Plans stored in Zustand store
7. User redirected to /dashboard
8. Dashboard displays AI-generated plans
```

### For Day 1 Feedback:
```
1. User submits Day 1 feedback
2. Frontend calls: completeDayAndGenerateNext()
3. Backend:
   - Generates Day 2 via Gemini (adaptive based on feedback)
4. ✅ Response transformed to correct format
5. Day 2 plans stored in store
6. User unlocked for Day 2
```

---

## API Endpoints Involved

### Profile Management
- `POST /user/profile` - Save profile on onboarding
- `GET /user/profile` - Fetch profile (now used in Login!)

### Workout Generation
- `POST /ai/workout` - Generate workout from Gemini (now with correct response format)
- `GET /workout/today` - Get today's saved workout

### Diet Generation
- `POST /ai/diet` - Generate diet from Gemini (now with correct response format)
- `GET /diet/today` - Get today's saved diet

---

## Testing the Fixes

### Test 1: Old User Login Flow
1. Register a user → Complete onboarding → Generate plans
2. Logout (clear localStorage)
3. Log back in with same credentials
4. ✅ Should go directly to dashboard
5. ✅ Should see their saved workout/diet

### Test 2: Gemini API Response
1. Create new account → Complete onboarding
2. Click "Generate"
3. ✅ Should get real exercises (not default ones)
4. ✅ Dashboard should show exercises from Gemini AI

### Test 3: Day Progression
1. Complete onboarding → See Day 1 plan
2. Submit Day 1 feedback
3. ✅ Day 2 unlocked
4. ✅ Day 2 plan is different (adapted based on feedback)

---

## Key Changes Summary

| Component | Issue | Fix |
|-----------|-------|-----|
| Login.tsx | Old users re-onboarded | Fetch profile from backend + load plans |
| api.ts | No way to load saved plans | Added `loadUserPlanData()` function |
| geminiapi.py (workout) | Wrong data format | Transform to `{ exercises: [...] }` |
| geminiapi.py (diet) | Wrong data format | Transform meals object to array |

---

## Environment Setup Reminders

Ensure these are running:

1. **Backend** (port 8000):
   ```bash
   cd backend
   python -m uvicorn main:app --reload
   ```

2. **Frontend** (port 8080):
   ```bash
   bun run dev
   # or
   npm run dev
   ```

3. **Environment Variables** (.env in backend):
   ```
   GEMINI_API_KEY=your_key
   MONGODB_URI=your_uri
   SECRET_KEY=your_secret
   ```

---

## Status
✅ **Complete** - Both issues resolved and tested

### What's Working Now:
- ✅ Old users no longer re-asked for data
- ✅ Old users' saved plans load automatically
- ✅ Gemini API returns workouts in correct format
- ✅ Gemini API returns diets in correct format
- ✅ Plans display properly on dashboard
- ✅ Day progression with adaptive feedback works
