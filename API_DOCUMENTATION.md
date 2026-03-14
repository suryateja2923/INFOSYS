# API_DOCUMENTATION.md - Fitplan.ai REST API Reference

Complete documentation for all Fitplan.ai REST API endpoints with request/response examples.

## 📋 Base URL

```
Development: http://localhost:8000
Production: https://api.fitplan.ai
```

## 🔑 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

Token expires in **24 hours** and can be refreshed using the refresh endpoint.

---

## 🔐 Authentication Endpoints

### 1. Register User

**Endpoint**: `POST /auth/register`  
**Authentication**: None  
**Description**: Create a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400
  },
  "message": "User registered successfully"
}
```

**Error Response** (400 Bad Request):
```json
{
  "status": "error",
  "code": "EMAIL_ALREADY_EXISTS",
  "message": "Email already registered",
  "details": {
    "email": "user@example.com"
  }
}
```

**Validation Rules**:
- Email: valid email format, unique
- Password: minimum 8 characters
- Name: 2-50 characters

---

### 2. User Login

**Endpoint**: `POST /auth/login`  
**Authentication**: None  
**Description**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400,
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

**Error Response** (401 Unauthorized):
```json
{
  "status": "error",
  "code": "INVALID_CREDENTIALS",
  "message": "Email or password is incorrect"
}
```

---

### 3. Refresh Token

**Endpoint**: `POST /auth/refresh`  
**Authentication**: Required (old token)  
**Description**: Get a new JWT token before expiration

**Request Body**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 86400
  },
  "message": "Token refreshed successfully"
}
```

---

## 👤 User Profile Endpoints

### 4. Get User Profile

**Endpoint**: `GET /user/profile`  
**Authentication**: Required ✅  
**Description**: Retrieve current user's complete profile

**Query Parameters**: None

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 28,
    "gender": "male",
    "height": 180,
    "weight": 85,
    "fitnessLevel": "intermediate",
    "goal": "lose_weight",
    "location": "Delhi",
    "healthIssues": ["high_bp", "back_pain"],
    "foodPreference": "veg",
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-02-09T15:45:00Z"
  },
  "message": "Profile retrieved successfully"
}
```

**Error Response** (401 Unauthorized):
```json
{
  "status": "error",
  "code": "INVALID_TOKEN",
  "message": "Invalid or expired token"
}
```

---

### 5. Update User Profile

**Endpoint**: `PUT /user/profile`  
**Authentication**: Required ✅  
**Description**: Update user profile information

**Request Body** (all fields optional):
```json
{
  "name": "John Doe",
  "age": 28,
  "gender": "male",
  "height": 180,
  "weight": 85,
  "fitnessLevel": "intermediate",
  "goal": "lose_weight",
  "location": "Mumbai",
  "healthIssues": ["high_bp"],
  "foodPreference": "mixed"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "age": 28,
    "gender": "male",
    "height": 180,
    "weight": 85,
    "fitnessLevel": "intermediate",
    "goal": "lose_weight",
    "location": "Mumbai",
    "healthIssues": ["high_bp"],
    "foodPreference": "mixed",
    "updatedAt": "2026-02-09T16:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

**Validation Rules**:
- Age: 15-120
- Height: 140-250 cm
- Weight: 20-300 kg
- fitnessLevel: `beginner` | `intermediate` | `advanced`
- goal: `lose_weight` | `gain_muscle` | `maintain`
- foodPreference: `veg` | `mixed`

---

## 🎯 AI Plan Generation Endpoints

### 6. Generate Workout Plan

**Endpoint**: `POST /ai/workout`  
**Authentication**: Required ✅  
**Description**: AI-generates a personalized workout plan based on user profile

**Request Body**:
```json
{
  "days": 7,
  "focusArea": "full_body"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "planId": "60d5ec49c1234567890abc01",
    "userId": "507f1f77bcf86cd799439011",
    "days": 7,
    "createdAt": "2026-02-09T16:15:00Z",
    "exercises": [
      {
        "day": 1,
        "name": "Full Body",
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
          },
          {
            "name": "Plank",
            "sets": 3,
            "duration": 30,
            "restSeconds": 60,
            "difficulty": "moderate"
          }
        ]
      },
      {
        "day": 2,
        "name": "Upper Body",
        "duration": 40,
        "exercises": [...]
      }
    ]
  },
  "message": "Workout plan generated successfully"
}
```

**Error Response** (400 Bad Request):
```json
{
  "status": "error",
  "code": "INCOMPLETE_PROFILE",
  "message": "Complete your profile before generating plans",
  "details": {
    "missingFields": ["location", "fitness_level"]
  }
}
```

---

### 7. Generate Diet Plan

**Endpoint**: `POST /ai/diet`  
**Authentication**: Required ✅  
**Description**: AI-generates a location-aware, food-preference-aware diet plan

**Request Body**:
```json
{
  "days": 7,
  "calorieTarget": 2500
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "planId": "60d5ec49c1234567890abc02",
    "userId": "507f1f77bcf86cd799439011",
    "days": 7,
    "location": "Delhi",
    "foodPreference": "veg",
    "totalDailyCalories": 2500,
    "createdAt": "2026-02-09T16:15:00Z",
    "meals": [
      {
        "day": 1,
        "name": "Day 1",
        "meals": [
          {
            "mealType": "breakfast",
            "time": "8:00 AM",
            "name": "Idli with Sambar",
            "dish": "South Indian specialty",
            "calories": 250,
            "protein": 12,
            "carbs": 40,
            "fats": 5,
            "foodType": "veg",
            "quantity": [
              {
                "item": "Idli",
                "amount": "3",
                "unit": "pieces"
              },
              {
                "item": "Sambar",
                "amount": "1",
                "unit": "cup"
              }
            ]
          },
          {
            "mealType": "lunch",
            "time": "1:00 PM",
            "name": "Dal Rice with Vegetable Curry",
            "dish": "Traditional North Indian",
            "calories": 450,
            "protein": 18,
            "carbs": 60,
            "fats": 14,
            "foodType": "veg",
            "quantity": [
              {
                "item": "Rice",
                "amount": "1",
                "unit": "cup cooked"
              },
              {
                "item": "Dal",
                "amount": "0.5",
                "unit": "cup"
              },
              {
                "item": "Curry",
                "amount": "1",
                "unit": "cup"
              }
            ]
          },
          {
            "mealType": "dinner",
            "time": "7:00 PM",
            "name": "Paneer Palak",
            "dish": "Spinach and cottage cheese curry",
            "calories": 300,
            "protein": 20,
            "carbs": 20,
            "fats": 12,
            "foodType": "veg",
            "quantity": [
              {
                "item": "Paneer",
                "amount": "200",
                "unit": "g"
              },
              {
                "item": "Spinach",
                "amount": "1",
                "unit": "cup"
              },
              {
                "item": "Oil",
                "amount": "1",
                "unit": "tsp"
              }
            ]
          }
        ]
      }
    ]
  },
  "message": "Diet plan generated successfully"
}
```

---

## 📊 Plans Management Endpoints

### 8. Get User Plans

**Endpoint**: `GET /user/plans`  
**Authentication**: Required ✅  
**Description**: Retrieve all saved workout and diet plans for user

**Query Parameters**:
```
?type=workout    // 'workout' | 'diet' | 'all' (default: all)
?limit=10        // Number of plans to return (default: 10)
?sortBy=createdAt // 'createdAt' | 'updatedAt'
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "workoutPlans": [
      {
        "planId": "60d5ec49c1234567890abc01",
        "createdAt": "2026-02-05T10:00:00Z",
        "duration": 7,
        "focusArea": "full_body"
      }
    ],
    "dietPlans": [
      {
        "planId": "60d5ec49c1234567890abc02",
        "createdAt": "2026-02-05T10:05:00Z",
        "location": "Delhi",
        "foodPreference": "veg",
        "totalCalories": 2500
      }
    ],
    "total": 2
  },
  "message": "Plans retrieved successfully"
}
```

---

### 9. Get Specific Workout Plan

**Endpoint**: `GET /user/plans/workout/:planId`  
**Authentication**: Required ✅  
**Description**: Get detailed info for a specific workout plan

**Path Parameters**:
- `planId` (required): MongoDB ObjectId of the plan

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "planId": "60d5ec49c1234567890abc01",
    "userId": "507f1f77bcf86cd799439011",
    "days": 7,
    "createdAt": "2026-02-05T10:00:00Z",
    "exercises": [...]
  },
  "message": "Workout plan retrieved successfully"
}
```

---

### 10. Get Specific Diet Plan

**Endpoint**: `GET /user/plans/diet/:planId`  
**Authentication**: Required ✅  
**Description**: Get detailed info for a specific diet plan

**Path Parameters**:
- `planId` (required): MongoDB ObjectId of the plan

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "planId": "60d5ec49c1234567890abc02",
    "userId": "507f1f77bcf86cd799439011",
    "meals": [...]
  },
  "message": "Diet plan retrieved successfully"
}
```

---

### 11. Clear All Plans

**Endpoint**: `POST /user/plans/clear`  
**Authentication**: Required ✅  
**Description**: Delete all saved workout and diet plans (for regeneration)

**Request Body**: `{}`

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "cleared": {
      "workoutPlans": 2,
      "dietPlans": 2
    }
  },
  "message": "All plans cleared successfully"
}
```

---

## 🏥 Health Data Endpoints (Future)

### 12. Get Health Summary

**Endpoint**: `GET /health/summary`  
**Authentication**: Required ✅  
**Description**: Get user's health metrics summary

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "bmi": 26.2,
    "bmiStatus": "overweight",
    "targetWeight": 75,
    "weightProgress": -5,
    "caloriesBurned": 12500,
    "caloriesConsumed": 17500,
    "workoutsCompleted": 8,
    "workoutsPlanned": 15,
    "lastUpdated": "2026-02-09T16:00:00Z"
  },
  "message": "Health summary retrieved successfully"
}
```

---

## 📋 Error Codes Reference

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `UNAUTHORIZED` | 401 | Authentication required |
| `EMAIL_ALREADY_EXISTS` | 400 | Email already registered |
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `INCOMPLETE_PROFILE` | 400 | Missing required profile fields |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `SERVER_ERROR` | 500 | Internal server error |
| `RATE_LIMITED` | 429 | Too many requests |

---

## 🔄 API Response Format

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "status": "error",
  "code": "ERROR_CODE",
  "message": "User-friendly error message",
  "details": { ... }
}
```

---

## 📝 API Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **Plan generation**: 10 requests per hour per user
- **Other endpoints**: 100 requests per minute per user

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:8000/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Generate Workout Plan
```bash
curl -X POST http://localhost:8000/ai/workout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "days": 7,
    "focusArea": "full_body"
  }'
```

---

**API Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Production Ready
