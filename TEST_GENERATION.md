# Debug: Why Plans Aren't Loading

## Observed Issue
Dashboard shows:
- "No workouts loaded yet"
- "No meals loaded yet"  
- User has completed onboarding (has goal: Muscle Growth)
- But no plans in Zustand store

## Possible Causes

### 1. Check Browser Console
Open DevTools (F12) → Console tab, look for:
- ❌ API errors (401, 500, 422, etc.)
- ❌ "Failed to generate plan" alerts
- ❌ JSON parsing errors
- ❌ Network errors

### 2. Check Network Tab
DevTools → Network tab, filter by "Fetch/XHR":
- Look for `/ai/workout` request - Did it succeed?
- Look for `/ai/diet` request - Did it succeed?
- Check response bodies - Are they valid JSON with exercises/meals?

### 3. Quick Test Commands

#### In Browser Console:
```javascript
// Check if store is accessible
console.log('Store:', window.localStorage.getItem('fitplan_token'));

// Try to manually load a plan
fetch('http://localhost:8000/workout/today', {
  headers: {
    'Authorization': 'Bearer ' + window.localStorage.getItem('fitplan_token')
  }
})
.then(r => r.json())
.then(d => console.log('Workout from DB:', d))
.catch(e => console.error('Error:', e));
```

#### In Backend Terminal (Python):
```python
# Test Gemini directly
cd backend
python -c "import asyncio; from geminiapi import get_ai_workout; profile={'age':25,'gender':'male','level':'beginner','goal':'muscle_growth','bmi':24,'bmi_category':'Normal','location':'NYC','mode':'gym','mood':'energetic','is_pregnant':False,'health_issues':'None','health_risk':'Low'}; result=asyncio.run(get_ai_workout(profile)); print('Exercises:', len(result.get('exercises', [])) if 'exercises' in result else 'ERROR: ' + str(result.get('error')))"
```

## Solution Steps

### If API Failed During Onboarding:
1. **Logout** (click Logout in sidebar)
2. **Clear browser data**: F12 → Application → Clear Storage
3. **Re-register** with new account OR **Login** with existing
4. **Complete onboarding again**
5. **Wait 15-20 seconds** for Gemini to generate plans
6. Should see plans on dashboard

### If API Succeeded But Plans Not Stored:
Check if plans exist in database by testing:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/workout/today
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/diet/today
```

### If This is a Returning User:
The `loadUserPlanData()` function should auto-load plans on login. If not:
1. Check if plans exist in database (above curl commands)
2. If yes, manually trigger load by refreshing page
3. If no, user needs to complete Day 1 feedback to generate new plans

## Expected Behavior After Fix

✅ Dashboard should show:
- "Today's Workout" with 8-12 exercises
- "Today's Nutrition" with 4-6 meals
- Total calories from workout and diet
- Full exercise details (sets, reps, duration, calories)
- Full meal details (time, calories, macros)
