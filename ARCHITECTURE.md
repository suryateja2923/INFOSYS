# ARCHITECTURE.md - Fitplan.ai System Architecture

## System Overview

Fitplan.ai is a full-stack fitness application with a React frontend and Python FastAPI backend, communicating via REST APIs. The system integrates Google Gemini AI for intelligent plan generation.

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER BROWSER                               │
│  (React 18 + TypeScript + Tailwind CSS)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Pages: Login, Onboarding, Dashboard, Settings           │   │
│  │ State: Zustand (fitplanStore)                           │   │
│  │ UI: Shadcn Components + Custom Fitness Components       │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────│──────────────────────────────────────┘
                         │ REST API (JSON)
                         │ JWT Authentication
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ API Endpoints                                            │  │
│  │ - /auth/* (Register, Login, Refresh)                    │  │
│  │ - /user/* (Profile CRUD)                                │  │
│  │ - /ai/* (Workout, Diet generation)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Services                                                 │  │
│  │ - Authentication (JWT)                                  │  │
│  │ - Gemini AI Integration                                 │  │
│  │ - Plan Generation Logic                                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Data Models (Pydantic)                                   │  │
│  │ - User, UserProfile, WorkoutPlan, DietPlan             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────│──────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
        ┌──────────────┐     ┌──────────────────┐
        │  MongoDB     │     │  Gemini API      │
        │  Database    │     │  (Google Cloud)  │
        │  - Users     │     │                  │
        │  - Plans     │     │  - Plan Gen      │
        │  - History   │     │  - AI Logic      │
        └──────────────┘     └──────────────────┘
```

## Frontend Architecture (React)

### Directory Structure & Layers

```
src/
├── pages/                  # Page components (route-level)
│   ├── Index.tsx          # Home/Login redirect
│   ├── Login.tsx           # User authentication
│   ├── Onboarding.tsx      # 5-step user setup
│   ├── NotFound.tsx        # 404 page
│   └── dashboard/
│       ├── DashboardHome.tsx      # Main dashboard
│       ├── DayOneFeedback.tsx      # Feedback collection
│       ├── DietPlanPage.tsx        # Detailed diet view
│       ├── NotificationsPage.tsx   # Notifications
│       ├── ProgressPage.tsx        # Progress tracking
│       ├── ReportsPage.tsx         # Reports & analytics
│       ├── SettingsPage.tsx        # Profile settings
│       └── WorkoutPlanPage.tsx     # Detailed workout view
│
├── components/            # Reusable components
│   ├── NavLink.tsx        # Navigation links
│   ├── ui/                # Shadcn UI library (40+ components)
│   │   ├── button.tsx, card.tsx, dialog.tsx, form.tsx, etc.
│   │   ├── FitnessButton.tsx     # Custom fitness button
│   │   ├── FitnessCard.tsx       # Custom fitness card
│   │   ├── FitnessInput.tsx      # Custom input field
│   │   ├── ModeChip.tsx          # Mode selection
│   │   ├── ProgressRing.tsx      # Circular progress
│   │   └── StepIndicator.tsx     # Step progress
│   │
│   └── dashboard/         # Dashboard-specific components
│       ├── DashboardHeader.tsx    # Header with user info
│       ├── DashboardSidebar.tsx   # Navigation sidebar
│       ├── DietPanel.tsx          # Meal display (compact/detailed)
│       ├── MoodModeSelector.tsx   # Mood selection
│       ├── ProgressCharts.tsx     # Chart visualizations
│       ├── StatCard.tsx           # Stat display card
│       └── WorkoutPanel.tsx       # Workout display
│
├── hooks/                 # Custom React hooks
│   ├── use-mobile.tsx     # Mobile detection
│   └── use-toast.ts       # Toast notifications
│
├── layouts/               # Layout wrappers
│   └── DashboardLayout.tsx # Main dashboard layout
│
├── store/                 # State management
│   └── fitplanStore.ts    # Zustand store (main store)
│
├── lib/                   # Utilities
│   └── utils.ts           # Helper functions
│
├── App.tsx                # Root component
├── main.tsx               # Entry point
├── index.css              # Global styles
└── App.css                # App-specific styles
```

### Component Hierarchy

```
App
├── Router
│   ├── /login → Login
│   ├── /onboarding → Onboarding
│   ├── / → DashboardLayout
│   │   ├── Sidebar
│   │   │   ├── NavLink (multiple)
│   │   │   └── Settings/Logout
│   │   │
│   │   └── Main Content
│   │       ├── DashboardHome
│   │       │   ├── DashboardHeader
│   │       │   ├── ProgressCards (4x StatCard)
│   │       │   ├── WorkoutPanel
│   │       │   └── DietPanel (variant="compact")
│   │       │
│   │       ├── DietPlanPage
│   │       │   ├── Location Badge
│   │       │   ├── Food Preference Badge
│   │       │   ├── Macro Cards (4x)
│   │       │   └── DietPanel (variant="detailed")
│   │       │
│   │       ├── WorkoutPlanPage
│   │       │   └── Workout exercises list
│   │       │
│   │       ├── ProgressPage
│   │       │   └── ProgressCharts
│   │       │
│   │       └── SettingsPage
│   │           └── Profile form with food preference
│   │
│   └── /404 → NotFound
```

### State Management (Zustand)

```typescript
// fitplanStore.ts Structure:
class FitplanStore {
  // User State
  userProfile?: UserProfile
  {
    id: string
    name: string
    email: string
    age: number
    gender: 'male' | 'female' | 'other'
    height: number // cm
    weight: number // kg
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
    goal: 'lose_weight' | 'gain_muscle' | 'maintain'
    location: string
    healthIssues: string[]
    foodPreference?: 'veg' | 'mixed' // Default: 'mixed'
  }

  // Plan State
  workoutPlans: WorkoutPlan[]
  dietPlans: DietPlan[]
  {
    meals: Meal[]
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFats: number
    location: string
    foodPreference: string
  }

  // Methods
  setUserProfile(profile)
  setWorkoutPlans(plans)
  setDietPlans(plans)
  clearAllPlans()
}
```

### Data Flow

```
User Input (Onboarding Form)
    ↓
Form Validation (Client-side)
    ↓
API Call (POST /ai/workout + POST /ai/diet)
    ↓
Zustand Store Update
    ↓
Component Re-render (via Zustand subscription)
    ↓
Dashboard Display (DietPanel, WorkoutPanel)
```

## Backend Architecture (FastAPI)

### File Organization

```
backend/
├── main.py              # FastAPI app + routes
├── models.py            # Pydantic schemas
├── geminiapi.py         # Gemini integration
├── database.py          # MongoDB connection
├── requirements.txt     # Dependencies
└── .env                 # Configuration
```

### Key Files & Responsibilities

#### main.py (FastAPI Application)
```python
# Endpoints:
POST /auth/register       # Register user
POST /auth/login          # Login & get JWT
POST /auth/refresh        # Refresh token

GET /user/profile         # Get user profile
PUT /user/profile         # Update profile

POST /ai/workout          # Generate workout plan
POST /ai/diet             # Generate diet plan

POST /user/plans/clear    # Clear all plans
```

#### models.py (Data Models)
```python
class User(BaseModel):
  email: str
  password: str
  name: str

class UserProfile(BaseModel):
  name: str
  age: int
  gender: str
  height: int
  weight: int
  fitnessLevel: str
  goal: str
  location: str
  healthIssues: list[str]
  food_preference: Optional[str]  # 'veg' or 'mixed'

class Meal(BaseModel):
  name: str
  time: str
  calories: int
  protein: int
  quantity: str
  foodType: str
  dish: str

class DietPlan(BaseModel):
  meals: list[Meal]
  totalCalories: int
  totalProtein: int
```

#### geminiapi.py (AI Integration)
```python
class GeminiClient:
  def generate_workout_plan(profile) → WorkoutPlan
  def generate_diet_plan(profile) → DietPlan

# Prompts designed to:
# - Consider location (for regional meals)
# - Respect food preferences (veg vs mixed)
# - Generate balanced, realistic plans
# - Include specific quantities and timing
```

#### database.py (MongoDB)
```
Collections:
├── users
│   ├── email (index)
│   ├── password (hashed)
│   ├── name
│   └── created_at
│
└── user_profiles
    ├── user_id (index)
    ├── age, gender, height, weight
    ├── fitnessLevel, goal
    ├── location
    ├── healthIssues
    ├── food_preference
    └── updated_at
```

### Authentication Flow

```
1. User Registration (POST /auth/register)
   Input: { email, password, name }
   Process:
   - Validate email uniqueness
   - Hash password (bcrypt)
   - Create user document in MongoDB
   Output: { userId, token }

2. User Login (POST /auth/login)
   Input: { email, password }
   Process:
   - Find user by email
   - Verify password hash
   - Generate JWT token (exp: 24h)
   Output: { token, expiresIn }

3. Token Refresh (POST /auth/refresh)
   Input: { token }
   Process:
   - Verify JWT signature
   - Generate new token
   Output: { token, expiresIn }

4. Protected Requests
   Header: Authorization: Bearer <token>
   Process:
   - Verify JWT signature & expiration
   - Extract user_id from claims
   - Proceed if valid, reject if invalid
```

### Plan Generation Flow

```
POST /ai/workout
├── Extract user_id from JWT
├── Fetch user profile from MongoDB
├── Call Gemini.generate_workout_plan(profile)
│   ├── Format prompt with user data
│   ├── Call genai.GenerativeModel("gemini-2.5-flash")
│   ├── Parse response into WorkoutPlan
│   └── Return exercises, durations, reps
├── Cache in frontend Zustand store
└── Response to client

POST /ai/diet
├── Extract user_id from JWT
├── Fetch user profile from MongoDB
├── Call Gemini.generate_diet_plan(profile)
│   ├── Format prompt with:
│   │   - Location (for regional cuisine)
│   │   - Food preference (veg vs mixed)
│   │   - Health conditions
│   │   - Fitness goal
│   ├── Call genai.GenerativeModel("gemini-2.5-flash")
│   ├── Parse response into DietPlan
│   └── Return meals with quantities & macros
├── Cache in frontend Zustand store
└── Response to client
```

## API Contract

### Request/Response Format

```
Request Headers:
Content-Type: application/json
Authorization: Bearer <jwt_token>

Response Format (Success):
{
  "status": "success",
  "data": { ... },
  "message": "Operation successful"
}

Response Format (Error):
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "Human-readable error",
  "details": { ... } // Optional
}

HTTP Status Codes:
200 - OK
201 - Created
400 - Bad Request
401 - Unauthorized (no/invalid token)
403 - Forbidden (no permission)
404 - Not Found
500 - Server Error
```

## Security Measures

### Frontend
- **Input Validation**: All form inputs validated before sending
- **Token Storage**: JWT stored in localStorage (consider httpOnly in production)
- **Protected Routes**: Page components check userProfile before rendering
- **XSS Prevention**: React escapes all dynamic content
- **CORS**: Requests only to trusted backend URL

### Backend
- **Password Hashing**: bcrypt with salt rounds 10+
- **JWT Validation**: All protected endpoints verify token signature & expiration
- **Input Validation**: Pydantic models validate all inputs
- **SQL Injection**: MongoDB prevents injection through parameterized queries
- **Rate Limiting**: (Future) Implement rate limiting on auth endpoints

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Route-based splitting with React.lazy
- **Image Optimization**: WebP format with fallbacks
- **CSS Optimization**: Tailwind purges unused CSS in production
- **Caching**: Zustand store caches plans locally
- **Lazy Loading**: Dialog components loaded on demand

### Backend Optimization
- **Database Indexes**: email, user_id indexed for fast lookups
- **API Response Caching**: Plans cached in frontend (reduce API calls)
- **Gemini Caching**: Results cached to reduce API calls
- **Async Processing**: (Future) Use background tasks for long operations

## Scalability Architecture

### Current (Single Instance)
```
Frontend (Vite) → Backend (Single FastAPI) → MongoDB (Single)
```

### Future (Scaled)
```
Frontend (CDN)
    ├─→ Load Balancer
    │       ├─→ Backend Instance 1
    │       ├─→ Backend Instance 2
    │       └─→ Backend Instance N
    │           └─→ MongoDB Replica Set
    │
    ├─→ Cache Layer (Redis)
    └─→ Message Queue (for async tasks)
```

## Monitoring & Logging

### Frontend Logging
- Console logs for API calls
- Error boundaries for crash handling
- User action tracking (future)

### Backend Logging
- Request/response logs
- Error stack traces
- Gemini API call logs
- Database operation logs

## Deployment Architecture

### Docker Structure
```
Docker Images:
├── fitplan-frontend (Node.js + Vite)
├── fitplan-backend (Python 3.10+ + FastAPI)
└── fitplan-mongodb (Official MongoDB image)

docker-compose.yml:
├── frontend service
├── backend service
└── mongodb service
```

---

**Architecture Version**: 1.0  
**Last Updated**: February 2026
