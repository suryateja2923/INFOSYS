# VISUAL_WORKFLOW.md - Interactive Workflow Diagrams

Visual diagrams showing the complete workflow of Fitplan.ai using Mermaid syntax.

## 🔄 Complete User Journey Flowchart

```mermaid
flowchart TD
    A["👤 User Visits App"] --> B{Authenticated?}
    B -->|No| C["📝 Login/Register Page"]
    C --> D["✅ Register or Login"]
    D --> E["🎯 Onboarding Flow"]
    E --> F["Step 1: Basic Info"]
    F --> G["Step 2: Fitness Profile"]
    G --> H["Step 3: Health & Preferences"]
    H --> I["Step 4: Confirmation"]
    I --> J["Step 5: Generation"]
    J --> K["🤖 Gemini AI Plans"]
    K --> L["💾 Cache in Store"]
    L --> M["🏠 Dashboard"]
    
    B -->|Yes| M
    
    M --> N{User Action?}
    N -->|View Meals| O["🍽️ Diet Plan Page"]
    N -->|View Workouts| P["💪 Workout Plan Page"]
    N -->|Track Progress| Q["📈 Progress Page"]
    N -->|Edit Profile| R["⚙️ Settings"]
    N -->|Check Notifications| S["🔔 Notifications"]
    
    R --> T["Update Profile"]
    T --> U["Save Changes"]
    U --> V{Regenerate?}
    V -->|Yes| K
    V -->|No| M
    
    O --> W{Regenerate Plans?}
    P --> W
    W -->|Yes| K
    W -->|No| M
    
    Q --> M
    S --> M
```

## 🔐 Authentication & Data Flow

```mermaid
graph TD
    A["User Credentials"] -->|Email + Password| B["Backend Validation"]
    B --> C{Valid?}
    C -->|No| D["❌ Error Response"]
    C -->|Yes| E["🔐 Hash & Verify"]
    E --> F["📝 Generate JWT"]
    F --> G["💾 Return Token"]
    G --> H["🔒 Store in localStorage"]
    H --> I["✅ Authenticate"]
    I --> J["📱 App Access Granted"]
    
    J --> K["All API Requests"]
    K --> L["🔑 Include JWT Token"]
    L --> M["Backend Validates Token"]
    M --> N{Valid?}
    N -->|No| O["❌ Unauthorized"]
    N -->|Yes| P["✅ Process Request"]
```

## 📝 Onboarding 5-Step Process

```mermaid
flowchart LR
    A["🎬 Start"] --> B["Step 1<br/>Basic Info"]
    B -->|Name, Email, Age, Gender| C["Step 2<br/>Fitness Profile"]
    C -->|Height, Weight, Level, Goal| D["Step 3<br/>Health & Prefs"]
    D -->|Location, Health Issues<br/>Food Preference| E["Step 4<br/>Confirmation"]
    E -->|Review & Edit| F["Step 5<br/>Generation"]
    F -->|Generating...| G["🤖 AI Plans"]
    G -->|Cached| H["✅ Dashboard"]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#fce4ec
    style D fill:#f3e5f5
    style E fill:#e0f2f1
    style F fill:#ede7f6
    style H fill:#c8e6c9
```

## 🍽️ Diet Plan Generation Flow

```mermaid
flowchart TD
    A["User Profile"] -->|Age, Weight, Height| B["Location Data"]
    A -->|Food Preference| B
    A -->|Health Conditions| B
    
    B --> C["Format Prompt"]
    C --> D["Regional Cuisine Info"]
    D --> E["Food Preference Guidelines"]
    E --> F["Calorie Target"]
    
    F -->|📤 Send to| G["🤖 Gemini API"]
    G -->|genai.GenerativeModel| H["Process Prompt"]
    H --> I["Generate Meal Plan"]
    I -->|📥 Receive| J["Structured Response"]
    
    J --> K["Parse JSON"]
    K --> L["Validate Data"]
    L --> M["Create DietPlan Object"]
    
    M --> N["🔄 Return to Frontend"]
    N --> O["💾 Zustand Store"]
    O --> P["📱 Display on Dashboard"]
    
    style G fill:#ffeb3b
    style P fill:#c8e6c9
```

## 💪 Workout Plan Generation Flow

```mermaid
flowchart TD
    A["User Profile Data"] -->|Fitness Level| B["Plan Configuration"]
    A -->|Goal| B
    A -->|Health Issues| B
    A -->|Age/Weight| B
    
    B --> C["Select Workout Type"]
    C -->|Based on Goal| D["Full Body vs Split"]
    D --> E["Set Intensity"]
    
    E -->|📤 Send to| F["🤖 Gemini API"]
    F --> G["Generate Exercises"]
    G -->|With: Sets, Reps, Rest| H["Create WorkoutPlan"]
    
    H -->|📥 Receive| I["Parse Response"]
    I --> J["Validate Exercises"]
    J --> K["Create Objects"]
    
    K --> L["🔄 Return to Frontend"]
    L --> M["💾 Cache in Store"]
    M --> N["💪 Display Workouts"]
    
    style F fill:#ffeb3b
    style N fill:#c8e6c9
```

## 🏠 Dashboard Home Layout

```mermaid
graph TD
    A["🏠 Dashboard Home"] -->|Header| B["Welcome, User"]
    B --> C["Notifications Bell"]
    
    A -->|Main Content| D["Progress Cards"]
    D --> E["BMI Score"]
    D --> F["Daily Calories"]
    D --> G["Daily Protein"]
    D --> H["Water Intake"]
    
    A --> I["Mood Selector"]
    I -->|Select Mood| J["⚡ Energy Level"]
    
    A --> K["Workout Panel"]
    K --> L["Today's Exercises"]
    L --> M["Start Workout"]
    
    A --> N["Diet Panel Compact"]
    N -->|Name Only| O["Breakfast"]
    N -->|Name Only| P["Lunch"]
    N -->|Name Only| Q["Dinner"]
    N --> R["View Full Plan"]
    
    style A fill:#e3f2fd
    style R fill:#c8e6c9
```

## 🍽️ Diet Plan Page Details

```mermaid
graph TD
    A["🍽️ Diet Plan Page"] --> B["Info Badges"]
    B -->|📍| C["Location: Delhi"]
    B -->|Filter Icon| D["Food Pref: Veg Only"]
    
    A --> E["Macro Overview"]
    E --> F["2500 kcal"]
    E --> G["150g Protein"]
    E --> H["300g Carbs"]
    E --> I["70g Fats"]
    
    A --> J["Meal Cards Loop"]
    J -->|Day 1-7| K["Breakfast 8:00 AM"]
    K --> L["Idli with Sambar"]
    L -->|Cal: 250| M["Protein: 12g"]
    L -->|Type: 🥬 Veg| N["Quantity Section"]
    N -->|Green Box| O["Idli: 3 pieces"]
    N -->|Green Box| P["Sambar: 1 cup"]
    
    J -->|Day 1-7| Q["Lunch 1:00 PM"]
    J -->|Day 1-7| R["Dinner 7:00 PM"]
    
    A --> S["Actions"]
    S --> T["Regenerate Plan"]
    S --> U["Back to Home"]
    
    style N fill:#c8e6c9
    style T fill:#ffeb3b
```

## ⚙️ Settings & Profile Update Flow

```mermaid
flowchart TD
    A["⚙️ Settings Page"] --> B["Load Profile Data"]
    B -->|useFitplanStore| C["Display Read-Only"]
    C --> D["Edit Button"]
    
    D --> E["Enter Edit Mode"]
    E --> F["Make Changes"]
    F -->|Name| G["Editable Fields"]
    F -->|Age| G
    F -->|Food Preference| G
    G -->|Dropdown| H["Mixed vs Vegetarian"]
    
    I["Cancel Button"] -->|Discard| E
    J["Save Button"] -->|Submit| K["API Call"]
    
    E --> I
    E --> J
    
    K -->|PUT /user/profile| L["Backend Validates"]
    L -->|Update MongoDB| M["✅ Success"]
    M -->|Update Zustand| N["🔄 Refresh Store"]
    N --> O["Display Updated Profile"]
    
    O --> P["Prompt Regenerate?"]
    P -->|Yes| Q["Clear Plans"]
    Q --> R["Call /ai/workout & /ai/diet"]
    P -->|No| S["Stay on Settings"]
    
    style M fill:#c8e6c9
    style R fill:#ffeb3b
```

## 🔄 State Management Flow

```mermaid
graph TD
    A["Component Interaction"] -->|User Action| B["Update Zustand Store"]
    B -->|setUserProfile| C["Update userProfile"]
    B -->|setDietPlans| D["Update dietPlans"]
    B -->|setWorkoutPlans| E["Update workoutPlans"]
    
    C -->|Persist| F["localStorage"]
    D -->|Persist| F
    E -->|Persist| F
    
    C -->|Trigger Re-render| G["Components Subscribe"]
    D -->|Trigger Re-render| G
    E -->|Trigger Re-render| G
    
    G -->|Display Updates| H["Dashboard"]
    G -->|Display Updates| I["Diet Plan Page"]
    G -->|Display Updates| J["Workout Page"]
    
    H --> K["User Sees Changes"]
    I --> K
    J --> K
    
    style B fill:#ffe082
    style K fill:#c8e6c9
```

## 🗄️ Database Schema Relationships

```mermaid
erDiagram
    USER ||--o{ USER_PROFILE : has
    USER ||--o{ WORKOUT_PLANS : generates
    USER ||--o{ DIET_PLANS : generates
    
    USER {
        string user_id PK
        string email UK
        string password_hash
        string name
        datetime created_at
        datetime updated_at
    }
    
    USER_PROFILE {
        string profile_id PK
        string user_id FK
        int age
        string gender
        int height_cm
        int weight_kg
        string fitness_level
        string goal
        string location
        array health_issues
        string food_preference
        datetime updated_at
    }
    
    WORKOUT_PLANS {
        string plan_id PK
        string user_id FK
        int days
        array exercises
        datetime created_at
        string focus_area
    }
    
    DIET_PLANS {
        string plan_id PK
        string user_id FK
        int days
        array meals
        int total_calories
        int total_protein
        string location
        string food_preference
        datetime created_at
    }
```

## 🔌 API Endpoints Map

```mermaid
graph TD
    A["Fitplan.ai API Routes"] 
    
    A -->|🔐 Authentication| B["Auth Endpoints"]
    B --> B1["POST /auth/register"]
    B --> B2["POST /auth/login"]
    B --> B3["POST /auth/refresh"]
    
    A -->|👤 User Data| C["User Endpoints"]
    C --> C1["GET /user/profile"]
    C --> C2["PUT /user/profile"]
    
    A -->|🤖 AI Generation| D["AI Endpoints"]
    D --> D1["POST /ai/workout"]
    D --> D2["POST /ai/diet"]
    
    A -->|📊 Data Access| E["Plans Endpoints"]
    E --> E1["GET /user/plans"]
    E --> E2["GET /user/plans/workout/:id"]
    E --> E3["GET /user/plans/diet/:id"]
    E --> E4["POST /user/plans/clear"]
    
    B1 -->|Request| F["Email, Password, Name"]
    B2 -->|Request| G["Email, Password"]
    D1 -->|Request| H["User ID from JWT"]
    D2 -->|Request| H
    
    style A fill:#e0e0e0
    style D fill:#ffeb3b
```

## 📱 UI Component Hierarchy

```mermaid
graph TD
    A["App Root"] --> B["Router"]
    
    B --> C["Login Page"]
    B --> D["Onboarding Page"]
    B --> E["DashboardLayout"]
    
    E --> E1["Header Component"]
    E --> E2["Sidebar Component"]
    E --> E3["Main Content Area"]
    
    E3 --> F["DashboardHome"]
    E3 --> G["DietPlanPage"]
    E3 --> H["WorkoutPlanPage"]
    E3 --> I["ProgressPage"]
    E3 --> J["SettingsPage"]
    E3 --> K["NotificationsPage"]
    
    F --> F1["StatCards"]
    F --> F2["WorkoutPanel"]
    F --> F3["DietPanel Compact"]
    F --> F4["MoodSelector"]
    
    G --> G1["Info Badges"]
    G --> G2["Macro Cards"]
    G --> G3["DietPanel Detailed"]
    
    H --> H1["Exercise List"]
    
    J --> J1["Profile Form"]
    J --> J2["Edit Toggle"]
    
    style A fill:#e8f5e9
    style B fill:#fff9c4
    style E fill:#e1f5fe
```

## 🌐 Frontend-Backend Communication

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Frontend as ⚛️ React Frontend
    participant Store as 💾 Zustand Store
    participant Backend as 🐍 FastAPI Backend
    participant DB as 🗄️ MongoDB
    participant Gemini as 🤖 Gemini API
    
    User->>Frontend: Fill Onboarding Form
    Frontend->>Store: Save to Zustand
    Store-->>Frontend: State Updated
    User->>Frontend: Click Generate Plans
    Frontend->>Backend: POST /ai/workout + /ai/diet
    Backend->>DB: Fetch User Profile
    DB-->>Backend: Profile Data
    Backend->>Gemini: Send Prompt with Profile
    Gemini-->>Backend: Generated Plans
    Backend->>DB: Save Plans
    Backend-->>Frontend: Return Plans JSON
    Frontend->>Store: Cache Plans in Zustand
    Store-->>Frontend: Plans Ready
    Frontend-->>User: Display Dashboard
    
    User->>Frontend: Edit Profile
    Frontend->>Backend: PUT /user/profile
    Backend->>DB: Update Profile
    DB-->>Backend: Updated
    Backend-->>Frontend: Success Response
    Frontend->>Store: Update Profile
    Store-->>Frontend: Refresh UI
```

## 🎯 Feature Usage Flow

```mermaid
graph TD
    A["User Logged In"] --> B{What to Do?}
    
    B -->|First Time| C["Complete Onboarding"]
    C --> D["Get AI Plans"]
    D --> E["View Dashboard"]
    
    B -->|Browse Plans| E
    E --> F{Select Action}
    
    F -->|View Diet| G["DietPlanPage"]
    F -->|View Workouts| H["WorkoutPlanPage"]
    F -->|Track Progress| I["ProgressPage"]
    F -->|Update Info| J["SettingsPage"]
    
    G --> K["Study Meal Plans"]
    H --> L["Check Exercises"]
    I --> M["View Charts"]
    J --> N["Edit Profile"]
    N --> O{Change Food Pref?}
    O -->|Yes| P["Update & Regenerate"]
    O -->|No| Q["Just Update"]
    
    P --> R["New Plans Generated"]
    Q --> E
    R --> E
    
    K --> E
    L --> E
    M --> E
    
    style E fill:#e1f5fe
    style P fill:#ffeb3b
    style R fill:#c8e6c9
```

## 📊 Data Flow Summary

```mermaid
graph LR
    A["Input: User Data"] -->|Validation| B["Clean Data"]
    B -->|Storage| C["MongoDB"]
    C -->|Retrieval| D["Backend Processing"]
    D -->|Formatting| E["Gemini Prompt"]
    E -->|AI Processing| F["Generated Plans"]
    F -->|Parsing| G["Structured JSON"]
    G -->|Response| H["Frontend Cache"]
    H -->|Display| I["User Interface"]
    I -->|Interaction| A
    
    style A fill:#fff3e0
    style F fill:#ffeb3b
    style I fill:#c8e6c9
    style C fill:#e0e0e0
```

---

**Visual Workflow Version**: 1.0  
**Last Updated**: February 2026  
**Format**: Mermaid Diagrams for VS Code & GitHub
