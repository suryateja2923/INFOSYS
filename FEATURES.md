# FEATURES.md - Fitplan.ai Features Documentation

Complete feature documentation with implementation details.

## ✨ Core Features

### 1. User Authentication

**Features**:
- Email/Password registration
- Secure login with JWT tokens
- Automatic logout on token expiration
- Token refresh mechanism
- Password hashing with bcrypt

**Implementation**:
```
Frontend: Login.tsx, Onboarding.tsx
Backend: /auth/register, /auth/login, /auth/refresh
Storage: MongoDB users collection
```

**User Journey**:
1. User clicks "Sign Up"
2. Enters email, password, name
3. Backend validates and stores hashed password
4. JWT token issued (24h expiration)
5. Token stored in localStorage
6. Redirected to onboarding

**Security**:
- Passwords hashed with bcrypt (salt rounds: 10)
- JWT signed with secret key
- Token includes user_id and exp claims
- Protected routes check token validity

---

### 2. User Onboarding (5 Steps)

**Step 1: Basic Information**
- Name
- Email (pre-filled from registration)
- Age
- Gender (Male/Female/Other)
- Navigation: Next → Step 2

**Step 2: Fitness Profile**
- Height (cm)
- Weight (kg)
- Fitness Level (Beginner/Intermediate/Advanced)
- Goal (Lose Weight/Gain Muscle/Maintain)
- Real-time BMI calculation
- Target weight suggestions
- Navigation: Back/Next

**Step 3: Health & Preferences**
- Location (for diet plan localization)
- Health Issues (Multi-select):
  - Diabetes
  - High Blood Pressure
  - Low Blood Pressure
  - Heart Disease
  - Joint Issues
  - Back Pain
  - Others
- Food Preference (Optional):
  - Single button: "Vegetarian Only"
  - Default: Mixed (veg + non-veg)
- Navigation: Back/Next

**Step 4: Confirmation**
- Review all entered information
- Display with organized cards
- Edit option (loop back to relevant step)
- Confirm button to proceed
- Navigation: Edit/Confirm

**Step 5: Generation**
- Shows "Generating Plans..." indicator
- Calls Gemini API for:
  - Workout plan generation
  - Diet plan generation
- Location and food preferences sent to Gemini
- Creates realistic, personalized plans
- Caches plans in Zustand store
- Navigates to dashboard on completion

**Implementation**:
```
Component: src/pages/Onboarding.tsx
State: Zustand fitplanStore
API: /ai/workout, /ai/diet
Database: MongoDB user_profiles, workout_plans, diet_plans
```

---

### 3. AI-Powered Workout Plan Generation

**Features**:
- Personalized based on:
  - Fitness level
  - Goal (weight loss/muscle gain/maintenance)
  - Health conditions
  - Age and body metrics
- Returns:
  - Day-by-day routine
  - Exercise names
  - Sets and reps
  - Rest periods
  - Estimated duration
  - Difficulty levels
  - Muscle groups targeted

**Example Workout Output**:
```json
{
  "day": 1,
  "name": "Full Body Strength",
  "duration": 45,
  "exercises": [
    {
      "name": "Push-ups",
      "sets": 3,
      "reps": 15,
      "restSeconds": 60,
      "difficulty": "moderate"
    },
    {
      "name": "Squats",
      "sets": 3,
      "reps": 20,
      "restSeconds": 60,
      "difficulty": "moderate"
    }
  ]
}
```

**Implementation**:
```
Component: src/pages/dashboard/WorkoutPlanPage.tsx
Backend: /ai/workout endpoint
AI: Google Gemini 2.5 Flash API
```

---

### 4. Location-Aware Diet Planning

**Features**:
- Generates meals based on user's location
- Regional cuisine preferences
- Local ingredient availability
- Respects food preferences (veg vs mixed)
- Includes:
  - Meal name
  - Time of day
  - Calories
  - Macros (protein, carbs, fats)
  - Food type (veg/non-veg)
  - Ingredients with quantities
  - Cooking method
  - Nutritional details

**Location Examples**:
- **India**: Dal, Paneer, Rice, Roti, Sambar, Idli, Salad
- **USA**: Chicken, Broccoli, Brown Rice, Fruits
- **Mediterranean**: Olive Oil, Feta, Vegetables, Whole Wheat
- **East Asia**: Rice, Tofu, Vegetables, Seafood

**Diet Plan Structure**:
```json
{
  "meals": [
    {
      "mealType": "breakfast",
      "time": "8:00 AM",
      "name": "Idli with Sambar",
      "calories": 250,
      "protein": 12,
      "carbs": 40,
      "fats": 5,
      "foodType": "veg",
      "dish": "South Indian specialty",
      "quantity": [
        { "item": "Idli", "amount": "3", "unit": "pieces" },
        { "item": "Sambar", "amount": "1", "unit": "cup" }
      ]
    }
  ],
  "totalDailyCalories": 2500,
  "location": "Delhi",
  "foodPreference": "veg"
}
```

**Implementation**:
```
Component: src/pages/dashboard/DietPlanPage.tsx
Backend: /ai/diet endpoint
AI: Google Gemini with location-aware prompts
```

---

### 5. Food Preference Management

**Feature Overview**:
- Optional vegetarian-only preference
- Default: Mixed (vegetarian + non-veg meals)
- Set during onboarding
- Changeable in settings
- Affects all diet plan generation

**Implementation**:
```
Onboarding: Step 3 (Health & Preferences)
Settings: Profile edit section
Database Field: food_preference: 'veg' | 'mixed'
API Integration: Passed to Gemini for plan generation
```

**Selection Flow**:
1. Onboarding Step 3 presents single button: "Vegetarian Only"
2. If not selected: defaults to 'mixed'
3. If selected: sets to 'veg'
4. Stored in user profile
5. Settings page allows changing anytime

**Gemini Integration**:
```python
# Prompt includes:
- "User food preference: Vegetarian Only" (if veg)
- "User food preference: Mixed (can include meat/fish)" (if mixed)
- Gemini responds with appropriate meal suggestions
```

---

### 6. Real-Time BMI Calculator

**Features**:
- Calculates BMI from height and weight
- Formula: weight(kg) / (height(m)²)
- Real-time updates as user types
- Target weight suggestions
- Health status indicators

**BMI Categories**:
- **< 18.5**: Underweight (Yellow warning)
- **18.5 - 24.9**: Normal (Green success)
- **25 - 29.9**: Overweight (Orange warning)
- **>= 30**: Obese (Red danger)

**Target Weight Calculation**:
- Aims for BMI 22-24 (healthy middle range)
- Formula: 22 × height(m)²
- Displayed with suggestion: "Target ~75 kg for healthy BMI"

**Implementation**:
```
Function: calculateBMI() in Onboarding.tsx
Display: Real-time in Step 2
Update Trigger: On height or weight input change
```

**Example**:
```
Height: 180 cm
Weight: 85 kg
BMI: 26.2 (Overweight)
Status: ⚠️ Overweight
Target Weight: ~71 kg
Progress: -14 kg needed
```

---

### 7. Dashboard Home View

**Components**:
- **Header**: User greeting, notifications
- **Progress Cards** (4):
  - BMI Score
  - Daily Calories
  - Daily Protein
  - Water Intake
- **Workout Panel**:
  - Today's exercises
  - Quick workout overview
  - Action: Start Workout
- **Mood Selector**:
  - Energy level
  - Workout mode
  - Affects recommendations
- **Diet Panel (Compact)**:
  - Today's meals
  - Shows only meal names
  - Horizontal metadata: time, calories, protein, type
  - Action: View Full Plan

**Compact Diet Display**:
```
BREAKFAST (8:00 AM)
Idli with Sambar | 250 kcal | 12g protein | Veg
South Indian specialty

LUNCH (1:00 PM)
Dal Rice with Curry | 450 kcal | 18g protein | Veg
Traditional North Indian
```

**Implementation**:
```
Component: src/pages/dashboard/DashboardHome.tsx
Sub-components: DietPanel (variant="compact"), WorkoutPanel
State: useFitplanStore()
Refresh: On page load or plan regeneration
```

---

### 8. Detailed Diet Plan Page

**Features**:
- Complete 7-day meal plan
- Information badges:
  - Location (📍 Delhi)
  - Food preference (if vegetarian: 🥬 Vegetarian Only)
- Macro overview (4 cards):
  - Total Calories
  - Total Protein
  - Total Carbs
  - Total Fats
- Detailed meal cards with:
  - Meal type and time
  - Name and description
  - Calories and macros
  - Food type indicator (veg/non-veg)
  - **GREEN QUANTITY SECTION**:
    - Header: "QUANTITY"
    - Ingredient list with amounts and units
  - Example: "Idli: 3 pieces, Sambar: 1 cup"

**Color Coding**:
- Quantity section: Green background (bg-success/10)
- Border: Green (border-success/30)
- Text: Green (text-success)
- Icons: Leaf (veg), Drumstick (non-veg)

**Implementation**:
```
Component: src/pages/dashboard/DietPlanPage.tsx
Sub-component: DietPanel (variant="detailed")
Display: Last generated diet plan from Zustand
Action: Regenerate (after profile update)
```

---

### 9. Workout Plan Page

**Features**:
- Display 7-day workout schedule
- For each day:
  - Day and workout name
  - List of exercises with:
    - Exercise name
    - Sets and reps
    - Rest duration
    - Difficulty level
    - Muscle groups
- Action: Start workout (future feature)

**Implementation**:
```
Component: src/pages/dashboard/WorkoutPlanPage.tsx
Display: Last generated workout plan
Data: workoutPlans from Zustand store
Refresh: Manual regeneration in settings
```

---

### 10. Progress Tracking

**Features**:
- Visual charts showing:
  - Weight change over time
  - Calories burned vs consumed
  - BMI trend
  - Workout consistency
- Historical data storage (future)
- Progress milestones (future)
- Comparisons (week/month)

**Implementation**:
```
Component: src/pages/dashboard/ProgressPage.tsx
Sub-component: ProgressCharts.tsx
Data: From health metrics tracking
Chart Library: (Recharts or Chart.js - to be added)
```

---

### 11. Settings & Profile Edit

**Features**:
- Edit all profile information:
  - Name
  - Age
  - Height
  - Weight
  - Gender
  - Fitness Level
  - Goal
  - Location
  - Health Issues
  - **Food Preference** (NEW)
- Read-only display (default)
- Edit mode with save/cancel
- Real-time BMI calculation during edit

**Food Preference in Settings**:
- Dropdown with two options:
  - "Mixed (Veg + Non-Veg)" (default)
  - "Vegetarian Only"
- Can change anytime
- Changes affect next generated plans

**Implementation**:
```
Component: src/pages/dashboard/SettingsPage.tsx
State Management: editedProfile state
API: PUT /user/profile
Auto-save: No (manual save button)
```

**Update Flow**:
1. User clicks "Edit Profile"
2. Fields become editable
3. User changes food preference dropdown
4. User clicks "Save"
5. API call to backend with new preference
6. Zustand store updates
7. Next regenerated plans will use new preference

---

### 12. Notifications

**Currently**:
- Toast notifications for:
  - Plan generation success
  - Profile update success/error
  - API errors

**Future**:
```
Component: src/pages/dashboard/NotificationsPage.tsx
Types:
- Plan generation milestones
- Daily reminders
- Fitness updates
- Achievement badges
```

**Implementation**:
```
Hook: useToast() from shadcn/ui
Display: Toast notifications at top-right
Auto-dismiss: 3-5 seconds
```

---

### 13. Mood/Mode Tracking

**Feature**:
- Select mood before workouts
- Options:
  - ⚡ High Energy
  - 😌 Calm Focus
  - 💪 Motivation
  - 😴 Light Movement

**Purpose**:
- Customizes workout recommendations
- Affects exercise selection
- Tracks mood patterns
- Improves personalization

**Implementation**:
```
Component: src/pages/dashboard/MoodModeSelector.tsx
Display: Dashboard home
Storage: (Future - mood history)
Affects: Workout recommendations
```

---

### 14. Reports & Analytics

**Currently**: Planned  
**Future Features**:
```
Component: src/pages/dashboard/ReportsPage.tsx
Reports:
- Weekly summary
- Monthly progress
- Goal achievement
- Calorie balance
- Macro distribution
- Workout consistency
- Dietary patterns
```

---

## 🔐 Security Features

1. **Authentication**:
   - JWT tokens with 24h expiration
   - Secure password hashing (bcrypt)
   - Protected API endpoints

2. **Data Privacy**:
   - User data isolated by user_id
   - No cross-user data leakage
   - Secure MongoDB with authentication

3. **Input Validation**:
   - Frontend validation (before API call)
   - Backend validation (Pydantic models)
   - Email validation
   - Type checking

4. **CORS**:
   - Configured for frontend origin only
   - Credentials allowed
   - Methods restricted

---

## 🎯 Future Feature Roadmap

### Phase 2:
- [ ] Meal prep guides
- [ ] Shopping list generation
- [ ] Recipe links
- [ ] Water intake tracking
- [ ] Activity logging
- [ ] Progress photos
- [ ] Social sharing

### Phase 3:
- [ ] Mobile app (React Native)
- [ ] Wearable integration
- [ ] Nutrition database integration
- [ ] Barcode scanner for food
- [ ] AI meal suggestions from images
- [ ] Community features
- [ ] Coach messaging

### Phase 4:
- [ ] Subscription plans
- [ ] Advanced analytics
- [ ] Genetic/health data integration
- [ ] Predictive recommendations
- [ ] Video coaching
- [ ] Live challenges

---

## 📊 Analytics & Metrics

**Tracked**:
- User registration
- Plan generations
- Plan regenerations
- Feature usage
- Error rates

**Not Yet Tracked** (Future):
- Time spent on app
- Workout completion
- Meal adherence
- Progress achieved
- User retention

---

## 🚀 Performance Optimizations

1. **Frontend**:
   - Local state caching (Zustand)
   - Component code splitting
   - Lazy loading routes
   - CSS minification

2. **Backend**:
   - Database indexing
   - API response caching
   - Gemini API result caching
   - Connection pooling

3. **Network**:
   - Minimal API calls
   - Optimized JSON payloads
   - Gzip compression

---

## ✅ Testing Coverage

**Tested Features**:
- User registration and login
- Onboarding flow (all 5 steps)
- Profile updates
- Plan generation
- Diet plan display
- Settings modifications

**Test Files**:
```
src/test/
├── example.test.ts
├── setup.ts
├── ... (additional tests)
```

---

**Features Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Core features complete, Analytics & Reporting in progress
