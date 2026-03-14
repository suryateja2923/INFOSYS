# Fitplan.ai Backend API - Complete Documentation

## 🚀 **Setup Instructions**

### Prerequisites
- Python 3.8+
- MongoDB Atlas account (free tier available)
- pip (Python package manager)

### Installation

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Configure environment variables
# Create .env file and add:
# - MONGO_URL: Your MongoDB connection string
# - SECRET_KEY: Generate with: openssl rand -hex 32

# 6. Run server
uvicorn main:app --reload

# Server runs at: http://localhost:8000
# API documentation: http://localhost:8000/docs
# Alternative docs: http://localhost:8000/redoc
```

---

## 🔐 **Security Implementation**

### Environment Variables (.env)
```env
# Required - Never share these!
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database
SECRET_KEY=your-256-bit-random-secret-key-here
DB_NAME=fitness_app
```

**How to generate SECRET_KEY:**
```bash
# Windows PowerShell
python -c "import secrets; print(secrets.token_hex(32))"

# Mac/Linux
openssl rand -hex 32
```

### CORS Configuration
- ✅ Frontend origins whitelisted
- ✅ Prevents unauthorized domain access
- ✅ Credentials allowed for authentication

### Accepted Domains
```python
- http://localhost:3000 (React dev)
- http://localhost:5173 (Vite dev)
- https://fitplan-ai.vercel.app (Production - update with your domain)
```

---

## 📋 **Validation Conditions Added**

### 1. **Age Validation**
```python
✅ Valid range: 1-120 years
⚠️ Warning (<18): Parental/Guardian supervision recommended
⚠️ Warning (>75): Medical clearance recommended before intense exercise
❌ Invalid: Outside 1-120 range
```

### 2. **Pregnancy Validation** (18-50 years, females only)
```python
✅ Valid: Female, age 18-50, isPregnant=true
❌ Invalid: Non-female with pregnancy status
❌ Invalid: Age < 18 or > 50 for females
```

### 3. **BMI Calculation & Assessment**
```python
Formula: BMI = weight(kg) / (height(m)²)

Categories:
🟢 Underweight: 0-18.4
🟢 Normal: 18.5-24.9
🟡 Overweight: 25-29.9
🔴 Obese: 30-49.9
🚨 Critical: ≥50

Actions:
- BMI ≥ 50: Block plan generation, require medical consultation
- 30 ≤ BMI < 50: Flag as high-health-risk
```

### 4. **Body Measurements Validation**
```python
Height: 100-250 cm
Weight: 20-300 kg
BMI: < 50 (critical limit)
```

### 5. **Health Risk Assessment**
```python
Risk Levels: LOW, MODERATE, HIGH

Risk Factors:
- Age < 18: Requires supervision
- Age > 75: Requires medical clearance
- BMI > 30: Elevated health risk
- Pregnancy: Always moderate risk
- Documented health issues: High risk

Auto-responses:
- High risk: Requires health issues documented
- Pregnancy: Requires healthcare provider consultation
- Age <18: Parental supervision needed
```

### 6. **Profile Validation Rules**
```python
✅ Age: 1-120 (with warnings)
✅ Gender: male | female | other
✅ Height: 100-250 cm
✅ Weight: 20-300 kg
✅ Location: ≥2 characters
✅ Fitness Level: beginner | intermediate | advanced
✅ Goal: weight_loss | weight_gain | muscle_growth | strength
✅ Pregnancy: Valid only for females aged 18-50
✅ Health Issues: Required for high-risk profiles
```

### 7. **Input Sanitization**
```python
Functions:
- sanitize_string(): Trim whitespace, limit length, remove unsafe chars
- sanitize_profile_data(): Validate and clean all input fields

Protections:
- Max string length: 500 characters
- Prevents invalid data types
- Converts to lowercase where appropriate
- Removes HTML/Script content
```

---

## 🔗 **API Endpoints Reference**

### Health Check
```
GET /health

Response: { "status": "healthy", "timestamp": "...", "version": "1.0.0" }
```

### Authentication

#### Register
```
POST /register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

✅ 200: { "message": "✅ User registered successfully", "user_id": "..." }
❌ 400: Email already exists
❌ 400: Password too short (min 8)
```

#### Login
```
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

✅ 200: { "access_token": "eyJhbG...", "token_type": "bearer", "user_id": "..." }
❌ 401: Invalid credentials
```

### User Profile

#### Save/Update Profile (With Validation)
```
POST /user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "age": 28,
  "height": 175.5,
  "weight": 75.0,
  "gender": "male",
  "pregnant": false,
  "level": "intermediate",
  "goal": "muscle_growth",
  "health_issues": "None",
  "location": "New York, USA"
}

✅ 200: {
  "message": "✅ Profile saved successfully",
  "bmi": 24.3,
  "bmi_category": "normal",
  "health_risk": "low",
  "warnings": []
}

❌ 400: Validation errors with detailed list
❌ 401: Unauthorized (invalid token)

Auto-calculated:
- BMI and category
- Health risk level
- Health risk factors
- Personalized recommendations
```

#### Get Profile
```
GET /user/profile
Authorization: Bearer {token}

✅ 200: { "message": "...", "profile": {...} }
❌ 404: Profile not found
❌ 401: Unauthorized
```

### Workout Plans

#### Save Workout
```
POST /workout
Authorization: Bearer {token}
Content-Type: application/json

{
  "day": 1,
  "place": "gym",
  "difficulty": "intermediate",
  "exercises": [
    {
      "id": "1",
      "name": "Bench Press",
      "duration": "15 min",
      "sets": 4,
      "reps": 10,
      "calories": 120
    }
  ]
}

✅ 201: { "message": "✅ Workout saved", "workout_id": "..." }
❌ 400: Invalid day (1-365) or place (gym/home)
```

#### Get Today's Workout
```
GET /workout/today
Authorization: Bearer {token}

✅ 200: { "message": "...", "workout": {...} }
❌ 404: No workout found
```

### Diet Plans

#### Save Diet Plan
```
POST /diet
Authorization: Bearer {token}
Content-Type: application/json

{
  "day": 1,
  "calories": 2000,
  "meals": {
    "breakfast": {
      "name": "Protein Oatmeal Bowl",
      "time": "7:00 AM",
      "calories": 350,
      "protein": 20,
      "carbs": 45,
      "fats": 10
    }
  }
}

✅ 201: { "message": "✅ Diet plan saved", "diet_id": "..." }
❌ 400: Invalid calories (800-5000) or day (1-365)
```

#### Get Today's Diet
```
GET /diet/today
Authorization: Bearer {token}

✅ 200: { "message": "...", "diet": {...} }
❌ 404: No diet found
```

### Feedback

#### Submit Feedback
```
POST /feedback
Authorization: Bearer {token}
Content-Type: application/json

{
  "day": 1,
  "mood": "energetic",
  "energy": 8,
  "difficulty": 7,
  "comment": "Great workout! Feeling strong"
}

Validation:
- mood: stressed | exhausted | energetic
- energy: 1-10
- difficulty: 1-10
- day: 1-365

✅ 201: { "message": "✅ Feedback submitted", "feedback_id": "..." }
❌ 400: Invalid mood, energy, difficulty, or day range
```

---

## 🗄️ **Database Schema**

### Collections with Indexes

```javascript
// Users
db.users
- _id: ObjectId (indexed: primary)
- email: String (indexed: unique) ← Prevents duplicate registrations
- name: String
- hashed_password: String (bcrypt)
- is_active: Boolean
- created_at: DateTime

// User Profiles
db.user_profiles
- _id: ObjectId (indexed: primary)
- user_id: String (indexed: unique) ← One profile per user
- age: Int (1-120)
- height: Float (100-250 cm)
- weight: Float (20-300 kg)
- gender: String
- pregnant: Boolean
- level: String
- goal: String
- health_issues: String
- location: String
- bmi: Float (calculated)
- bmi_category: String
- health_risk: Object (calculated)
- updated_at: DateTime

// Workout Plans
db.workout_plans
- _id: ObjectId (indexed: primary)
- user_id: String (indexed with day: compound index)
- day: Int
- place: String (gym | home)
- difficulty: String
- exercises: Array
- completed: Boolean
- created_at: DateTime

// Diet Plans
db.diet_plans
- _id: ObjectId (indexed: primary)
- user_id: String (indexed with day: compound index)
- day: Int
- calories: Int
- meals: Object
- completed: Boolean
- created_at: DateTime

// Feedback
db.feedback
- _id: ObjectId (indexed: primary)
- user_id: String (indexed with day: compound index)
- day: Int
- mood: String
- energy: Int (1-10)
- difficulty: Int (1-10)
- comment: String
- created_at: DateTime
```

---

## ⚡ **Key Features Implemented**

### ✅ Comprehensive Validation System
- Age, pregnancy, BMI, height, weight validation
- Health risk assessment
- Automatic BMI calculation
- Input sanitization

### ✅ Security Hardening
- Environment variables for secrets
- CORS configuration
- Password length validation (min 8 chars)
- JWT expiration (30 minutes)
- User account status checking
- Email uniqueness enforcement

### ✅ Database Optimization
- Indexes on frequently queried fields
- Compound indexes for efficient sorting
- Async/Await for non-blocking operations

### ✅ Error Handling
- Custom exception handlers
- Detailed error messages
- Status codes (400, 401, 404, 500)
- Timestamp logging

### ✅ API Documentation
- Auto-generated Swagger UI at `/docs`
- ReDoc alternative at `/redoc`
- Comprehensive endpoint descriptions
- Request/response examples

---

## 🧪 **Testing Validations**

### Test Age Validation
```bash
curl -X POST http://localhost:8000/user/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"age": 0, "height": 175, "weight": 75, "gender": "male", "level": "beginner", "goal": "strength", "location": "USA"}'

# Expected: 400 error - "Age must be between 1 and 120 years"
```

### Test Pregnancy Validation
```bash
curl -X POST http://localhost:8000/user/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"age": 25, "height": 165, "weight": 65, "gender": "female", "pregnant": true, "level": "beginner", "goal": "strength", "location": "USA"}'

# Expected: 200 success - "✅ Profile saved successfully"

curl -X POST http://localhost:8000/user/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"age": 16, "height": 165, "weight": 65, "gender": "female", "pregnant": true, "level": "beginner", "goal": "strength", "location": "USA"}'

# Expected: 400 error - "CRITICAL: Pregnancy only valid for ages 18-50"
```

### Test Health Risk Assessment
```bash
curl -X POST http://localhost:8000/user/profile \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"age": 80, "height": 175, "weight": 100, "gender": "male", "level": "beginner", "goal": "strength", "location": "USA", "health_issues": "High Blood Pressure"}'

# Expected: 200 success with health_risk: "high"
```

---

## 🚨 **Production Checklist**

- [ ] Rotate SECRET_KEY
- [ ] Update MONGO_URL with production database
- [ ] Add your production domain to ALLOWED_ORIGINS
- [ ] Enable HTTPS/SSL
- [ ] Configure MongoDB IP whitelist
- [ ] Set up rate limiting (SlowAPI)
- [ ] Enable logging to file
- [ ] Add monitoring and alerts
- [ ] Configure automated backups
- [ ] Set up API versioning
- [ ] Add API key authentication for external services
- [ ] Enable request body size limits
- [ ] Configure database query timeouts

---

## 📞 **Support**

API Documentation: `http://localhost:8000/docs`
Status Check: `GET /health`
Issues: Check error messages and status codes in responses

