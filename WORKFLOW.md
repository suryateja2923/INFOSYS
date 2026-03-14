# WORKFLOW.md - Fitplan.ai Workflow & User Journey

This document visualizes the complete workflow of Fitplan.ai, showing how users interact with the system and how data flows through the application.

## 🔄 Overall Application Workflow

```
┌──────────────┐
│   User      │
│  Visits App │
└──────┬───────┘
       │
       ↓
┌──────────────────────────┐
│   Check User Auth        │
│   (JWT Token Valid?)     │
└──────────────────────────┘
       │
    ┌──┴──┐
    NO   YES
    │     │
    ↓     ↓
┌──────┐  ┌──────────────────┐
│Login │  │ Dashboard        │
│Page  │  │ (Home/Diet/Etc)  │
└──┬───┘  └────────────────┬─┘
   │                       │
   │  ┌─────────────────── │
   └──┤ Onboarding Step 1  │
      │ (Basic Info)       │
      │                    │
      ↓                    ↓
┌────────────────┐  ┌──────────────────────┐
│ Store Profile  │  │ AI Plan Generation   │
│ in MongoDB     │  │ (Workout + Diet)     │
└────────────────┘  └──────────────────────┘
                            │
                            ↓
                     ┌──────────────────┐
                     │ Cache in Zustand │
                     │ Store            │
                     └────────┬─────────┘
                              │
                              ↓
                     ┌──────────────────┐
                     │ Display Dashboard│
                     └────────┬─────────┘
                              │
                   ┌──────────┼──────────┐
                   ↓          ↓          ↓
            ┌────────┐  ┌────────┐  ┌────────┐
            │ Browse │  │Edit    │  │Logout  │
            │ Plans  │  │Profile │  │        │
            └────────┘  └─┬──────┘  └────────┘
                          │
                   ┌──────┴──────┐
                   ↓             ↓
            ┌──────────┐  ┌───────────┐
            │ Update   │  │ Regen     │
            │ Profile  │  │ Plans     │
            └──────────┘  └───────────┘
```

## 👤 User Registration & Login Workflow

```
                    START
                      │
                      ↓
        ┌─────────────────────────┐
        │  User Visits Fitplan.ai │
        └────────────┬────────────┘
                     │
                     ↓
        ┌──────────────────────┐
        │ Check Auth Token?    │
        └──────────┬───────────┘
                   │
           ┌───────┴─────────┐
           │                 │
        Valid              Invalid
           │                 │
           ↓                 ↓
    [PROCEED]         ┌──────────────┐
                      │ Go to Login  │
                      └──────┬───────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                Existing           New
                 User              User
                    │                 │
                    ↓                 ↓
            ┌──────────────┐  ┌──────────────────┐
            │ Login Page   │  │ Sign Up Form     │
            │ - Email      │  │ - Name           │
            │ - Password   │  │ - Email          │
            │ - Submit     │  │ - Password       │
            └──────┬───────┘  │ - Confirm Pwd    │
                   │          │ - Accept Terms   │
                   │          └────────┬─────────┘
                   │                   │
                   └───────┬───────────┘
                           │
                    ┌──────↓──────┐
                    │   Backend   │
                    │ Verification│
                    └──────┬──────┘
                           │
                    ┌──────↓───────────┐
                    │ Valid Creds?     │
                    └────┬─────────┬───┘
                         │         │
                       YES         NO
                         │         │
                         ↓         ↓
                    [JWT Token]  [Error]
                         │         │
                         ↓         ↓
                    [DASHBOARD]  [Retry]
```

## 📝 Onboarding Workflow (5 Steps)

```
                   START ONBOARDING
                          │
                          ↓
                   ┌─────────────────────┐
                   │ Step 1: Basic Info  │
                   │ ─────────────────── │
                   │ • Name              │
                   │ • Email             │
                   │ • Age               │
                   │ • Gender            │
                   │ [Next]              │
                   └──────────┬──────────┘
                              │
                              ↓
                   ┌─────────────────────────┐
                   │ Step 2: Fitness Profile │
                   │ ───────────────────── │
                   │ • Height (cm)           │
                   │ • Weight (kg)           │
                   │ • Fitness Level         │
                   │   - Beginner            │
                   │   - Intermediate        │
                   │   - Advanced            │
                   │ • Goal                  │
                   │   - Lose Weight         │
                   │   - Gain Muscle         │
                   │   - Maintain            │
                   │ [Next]                  │
                   └──────────┬──────────────┘
                              │
                              ↓
                   ┌─────────────────────────┐
                   │Step 3: Health & Prefs  │
                   │───────────────────────  │
                   │ • Location              │
                   │ • Health Issues         │
                   │   (Diabetes/BP/etc)     │
                   │ • Food Preference       │
                   │   ☐ Vegetarian Only     │
                   │   (Default: Mixed)      │
                   │ [Next]                  │
                   └──────────┬──────────────┘
                              │
                              ↓
                   ┌─────────────────────────┐
                   │ Step 4: Confirmation    │
                   │ ───────────────────── │
                   │ Review all details:     │
                   │ • Personal Info         │
                   │ • Fitness Profile       │
                   │ • Health & Location     │
                   │ • Food Preference       │
                   │ [Edit] [Confirm]        │
                   └──────────┬──────────────┘
                              │
                              ↓
                   ┌─────────────────────────┐
                   │ Step 5: Generation      │
                   │ ───────────────────── │
                   │ 🔄 Generating Plans...  │
                   │ (Calling Gemini API)    │
                   │                         │
                   │ Creating:               │
                   │ ✓ Workout Plan          │
                   │ ✓ Diet Plan             │
                   │ [Proceed to Dashboard]  │
                   └──────────┬──────────────┘
                              │
                              ↓
                   ┌─────────────────────────┐
                   │   ONBOARDING COMPLETE   │
                   │   Redirect to Dashboard │
                   └─────────────────────────┘
```

## 🤖 AI Plan Generation Workflow

```
                  USER SUBMITS PROFILE
                          │
                          ↓
        ┌──────────────────────────────┐
        │ Frontend Validation           │
        │ • All required fields filled  │
        │ • Valid values               │
        └────────────┬─────────────────┘
                     │
                 ┌───┴─────┐
                 │          │
             Valid       Invalid
                 │          │
                 ↓          ↓
             [API Call]  [Show Error]
                 │
                 ↓
    ┌──────────────────────────────────┐
    │ POST /ai/workout & /ai/diet       │
    │ + JWT Token                       │
    │ + User Profile Data               │
    └────────────┬─────────────────────┘
                 │
                 ↓
    ┌──────────────────────────────────┐
    │ Backend Processing                │
    │ 1. Verify JWT Token              │
    │ 2. Extract User ID               │
    │ 3. Fetch Full Profile from DB    │
    └────────────┬─────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ↓                 ↓
┌──────────────────┐ ┌──────────────────┐
│WORKOUT GENERATION│ │DIET GENERATION   │
│                  │ │                  │
│1. Get Profile    │ │1. Get Profile    │
│2. Format Prompt: │ │2. Format Prompt: │
│  - Fitness Level │ │  - Location      │
│  - Goal          │ │  - Food Pref     │
│  - Health Issues │ │  - Goal          │
│  - Available     │ │  - Health Issues │
│    equipment     │ │  - Calorie Target│
│3. Send to Gemini │ │3. Send to Gemini │
│4. Parse Response │ │4. Parse Response │
│5. Return Data    │ │5. Return Data    │
└────────┬────────┘ └─────────┬────────┘
         │                    │
         └─────────┬──────────┘
                   │
                   ↓
    ┌──────────────────────────────────┐
    │ Frontend Receives Response        │
    │ ✓ Workout Plan                   │
    │   - Exercises                    │
    │   - Reps/Duration                │
    │   - Muscle Groups                │
    │ ✓ Diet Plan                      │
    │   - Meals (Breakfast/Lunch/etc)  │
    │   - Quantities                   │
    │   - Calories/Macros              │
    │   - Regional Cuisine             │
    └────────────┬─────────────────────┘
                 │
                 ↓
    ┌──────────────────────────────────┐
    │ Store in Zustand                 │
    │ - workoutPlans                   │
    │ - dietPlans                      │
    └────────────┬─────────────────────┘
                 │
                 ↓
    ┌──────────────────────────────────┐
    │ Update Dashboard                 │
    │ Display Plans to User            │
    └──────────────────────────────────┘
```

## 🏠 Dashboard Home Workflow

```
              USER GOES TO HOME
                      │
                      ↓
        ┌────────────────────────────┐
        │ Load DashboardLayout        │
        │ • Header with user name     │
        │ • Sidebar with nav          │
        └───────────┬────────────────┘
                    │
                    ↓
        ┌────────────────────────────┐
        │ DashboardHome Component     │
        └───────────┬────────────────┘
                    │
         ┌──────────┼──────────┬──────────┐
         │          │          │          │
         ↓          ↓          ↓          ↓
    ┌────────┐ ┌────────┐ ┌─────────┐ ┌───────────┐
    │Progress│ │Mood    │ │Workout  │ │Diet Panel │
    │Cards   │ │Selector│ │Panel    │ │(Compact)  │
    │        │ │        │ │         │ │           │
    │-BMI    │ │Select: │ │Todays   │ │Today's    │
    │-Calos  │ │-Energy │ │Exercise:│ │Meals:     │
    │-Protein│ │-Mood   │ │         │ │(Names     │
    │-Water  │ │-Focus  │ │- Name   │ │only)      │
    │        │ │        │ │- Reps   │ │           │
    │        │ │[Update]│ │- Time   │ │[View Full]│
    └────────┘ └────────┘ └─────────┘ └───────────┘
```

## 🍽️ Diet Plan Page Workflow

```
              USER CLICKS DIET PLAN
                      │
                      ↓
        ┌──────────────────────────────┐
        │ DietPlanPage Component        │
        └───────────┬──────────────────┘
                    │
         ┌──────────┴────────────┐
         │                       │
         ↓                       ↓
    ┌──────────────┐      ┌──────────────┐
    │ Info Badges  │      │ Macro Cards  │
    │              │      │              │
    │• Location    │      │ • Calories   │
    │  📍 Delhi    │      │   2500 kcal  │
    │              │      │              │
    │• Food Prefs  │      │ • Protein    │
    │  🥬 Veg Only │      │   150g       │
    │              │      │              │
    │              │      │ • Carbs      │
    │              │      │   300g       │
    │              │      │              │
    │              │      │ • Fats       │
    │              │      │   70g        │
    └──────────────┘      └──────────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ↓
    ┌──────────────────────────────────┐
    │ DietPanel (Detailed Variant)      │
    │                                  │
    │ BREAKFAST (8:00 AM)              │
    │ ─────────────────────────────── │
    │ Idli with Sambar (South Indian) │
    │ Cal: 250 | Protein: 12g | Veg   │
    │                                  │
    │ QUANTITY:                        │
    │ • Idli: 3 pieces                │
    │ • Sambar: 1 cup                 │
    │ • Chutney: 2 tbsp               │
    │                                  │
    │ ─────────────────────────────── │
    │                                  │
    │ LUNCH (1:00 PM)                 │
    │ ─────────────────────────────── │
    │ Dal + Rice + Vegetable Curry    │
    │ Cal: 450 | Protein: 18g | Veg   │
    │                                  │
    │ QUANTITY:                        │
    │ • Rice: 1 cup cooked            │
    │ • Dal: 0.5 cup                  │
    │ • Curry: 1 cup                  │
    │                                  │
    │ ─────────────────────────────── │
    │                                  │
    │ DINNER (7:00 PM)                │
    │ ─────────────────────────────── │
    │ Paneer with Spinach (Palak)     │
    │ Cal: 300 | Protein: 20g | Veg   │
    │                                  │
    │ QUANTITY:                        │
    │ • Paneer: 200g                  │
    │ • Spinach: 1 cup                │
    │ • Oil: 1 tsp                    │
    │                                  │
    │ [Regenerate Plan]                │
    └──────────────────────────────────┘
```

## ⚙️ Settings & Profile Update Workflow

```
              USER CLICKS SETTINGS
                      │
                      ↓
        ┌──────────────────────────────┐
        │ SettingsPage Component        │
        │ Load current profile          │
        └───────────┬──────────────────┘
                    │
                    ↓
        ┌──────────────────────────────┐
        │ Display Profile in Read-Only  │
        │ • Name: John Doe             │
        │ • Age: 25                    │
        │ • Location: Delhi            │
        │ • Food Pref: Mixed           │
        └───────────┬──────────────────┘
                    │
                    ↓
        ┌──────────────────────────────┐
        │ [Edit Profile] Button         │
        └───────────┬──────────────────┘
                    │
            ┌───────┴──────────┐
            │                  │
        CLOSE              EDIT MODE
            │                  │
            │                  ↓
            │     ┌──────────────────────────────┐
            │     │ Editable Fields               │
            │     │ • Name                       │
            │     │ • Age                        │
            │     │ • Height                     │
            │     │ • Weight                     │
            │     │ • Fitness Level              │
            │     │ • Goal                       │
            │     │ • Location                   │
            │     │ • Health Issues              │
            │     │ • Food Preference ⭐         │
            │     │   ┌─ Dropdown ─────────────┐│
            │     │   │ Mixed (Veg + Non-Veg) ││
            │     │   │ Vegetarian Only        ││
            │     │   └──────────────────────┘ │
            │     │                             │
            │     │ [Cancel] [Save]             │
            │     └──────────┬──────────────────┘
            │                │
            │        ┌───────┴─────────┐
            │        │                 │
            │      SAVE             CANCEL
            │        │                 │
            │        ↓                 ↓
            │   ┌─────────────┐   [Discard]
            │   │ API Call:   │
            │   │PUT /user    │
            │   │/profile     │
            │   └──────┬──────┘
            │          │
            │    ┌─────┴──────┐
            │    │            │
            │ Success      Error
            │    │            │
            │    ↓            ↓
            │ [Success]   [Error Toast]
            │  Toast      Retry Option
            │    │
            └────┴──→ Back to Read-Only
                      Refresh Data
```

## 🔐 Data & Security Workflow

```
┌─────────────────────────────────────────────┐
│          Authentication Flow                │
├─────────────────────────────────────────────┤
│                                             │
│  Credentials                BC rypt         │
│  (Email + Pwd) ──Hashed──→ DB              │
│                                             │
│  Login Request                              │
│  ─────────────→ Match Hash ──No──→ Error    │
│                        │                    │
│                       Yes                   │
│                        │                    │
│                        ↓                    │
│  JWT Token ←──Generate─ User ID             │
│  (24h exp)                                  │
│                        │                    │
│                        ↓                    │
│  Store in: localStorage                    │
│  Send with: Authorization Header            │
│                        │                    │
│                        ↓                    │
│  Protected Requests    Verify Token         │
│  ─────────────→ Check Signature ─────→      │
│                Check Expiration             │
│                  Extract User_ID             │
│                        │                    │
│            ┌───────────┴───────────┐       │
│            │                       │        │
│         Valid                  Expired/      │
│            │                   Invalid       │
│            ↓                       │        │
│      [Proceed]                    ↓        │
│                            [Unauthorized]   │
│                            [Refresh Token]  │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│      Data Storage & Caching Strategy        │
├─────────────────────────────────────────────┤
│                                             │
│  Frontend (Zustand Store)                  │
│  ═══════════════════════════════════       │
│  • userProfile (loaded on app start)        │
│  • workoutPlans (cached from API)           │
│  • dietPlans (cached from API)              │
│  • lastUpdated timestamp                    │
│                                             │
│        ↓ Sync ↓ (on update)                │
│                                             │
│  Backend (MongoDB)                          │
│  ═════════════════════════════════════════ │
│  Collections:                               │
│  • users (id, email, password hash)         │
│  • user_profiles (all profile data)         │
│  • workout_plans (cached plans)             │
│  • diet_plans (cached plans)                │
│                                             │
│        ↓ Populate ↓ (on request)           │
│                                             │
│  Gemini API (Google Cloud)                  │
│  ════════════════════════════════          │
│  • Call for new plan generation             │
│  • Input: User profile + location + prefs   │
│  • Output: Structured plan (JSON)           │
│                                             │
│        ↓ Cache Back ↓                       │
│                                             │
│  Frontend + Backend Storage                 │
│  (Reduce future API calls)                  │
│                                             │
└─────────────────────────────────────────────┘
```

## 📲 Complete User Journey Timeline

```
Timeline:
─────────────────────────────────────────────────

DAY 1 - Registration & Onboarding
├─ 10:00 AM: User signs up
├─ 10:05 AM: Completes Onboarding (5 steps)
├─ 10:10 AM: Workout + Diet plans generated by Gemini
├─ 10:15 AM: Views Dashboard Home
└─ 10:20 AM: Checks full Diet Plan

DAY 2 - Using the App
├─ 8:00 AM: Opens app, views today's workout
├─ 1:00 PM: Selects mood, sees customized recommendations
├─ 6:00 PM: Checks following day's diet plan
└─ 8:00 PM: Logs mood for the day

DAY 5 - Profile Adjustment
├─ 5:00 PM: Notices need to change food preference
├─ 5:05 PM: Goes to Settings
├─ 5:10 PM: Changes food preference to "Vegetarian Only"
├─ 5:15 PM: Plans regenerated by Gemini
└─ 5:20 PM: Views updated diet plan with all vegetarian meals

WEEK 2 - Progress Checking
├─ Weekly review of progress charts
├─ Update weight in profile
├─ Regenerate plans based on new weight
└─ Check updated workout intensity

MONTH 1 - Long-term Goal Tracking
├─ Review overall progress
├─ Check BMI improvement
├─ Adjust fitness level (Beginner → Intermediate)
├─ Regenerate plans
└─ Set new goals or reorder meal preferences
```

## 🔄 Data Sync Workflow (Future State)

```
For when real-time sync is needed:

Frontend Change
      │
      ↓
Zustand Update
      │
      ↓
API Call (POST/PUT)
      │
      ├─→ Local Storage Update (Optimistic)
      │
      └─→ Backend Processing
            │
            ├─→ Database Update
            │
            └─→ Response Back
                  │
                  ├─→ Zustand Update (Confirm)
                  │
                  └─→ UI Refresh
                      (if needed)
```

---

**Workflow Documentation Version**: 1.0  
**Last Updated**: February 2026  
**Visual Format**: Mermaid Diagrams + ASCII Flow Charts
