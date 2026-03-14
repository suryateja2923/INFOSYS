# SETUP_GUIDE.md - Complete Setup Instructions for Fitplan.ai

Step-by-step guide to set up and run the Fitplan.ai project locally.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **Python** 3.10 or higher ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))
- **MongoDB** (Local or Atlas cloud) ([Download](https://www.mongodb.com/try/download/community))
- **Visual Studio Code** (Optional, for development)

### Required API Keys
- **Google Gemini API Key** ([Get Here](https://ai.google.dev/))
- **MongoDB Atlas Connection String** (if using cloud)

## 🎯 Step 1: Clone & Navigate to Project

```bash
# Clone the repository
git clone <repository_url>

# Navigate to project directory
cd Fitplan.ai\ Frontend

# Check structure
ls -la
```

## 🖥️ Step 2: Frontend Setup (React + TypeScript)

### 2.1 Install Node Package Manager

We use **Bun** (faster than npm) but npm also works:

```bash
# Option 1: Using Bun (Recommended)
curl -fsSL https://bun.sh/install | bash
# Add to PATH if needed

# Option 2: Using npm (comes with Node.js)
npm install -g npm@latest
```

### 2.2 Install Frontend Dependencies

```bash
# Navigate to frontend directory if not already there
cd "Fitplan.ai Frontend"

# Install dependencies using Bun
bun install

# OR using npm
npm install
```

### 2.3 Create Environment File

Create `.env.local` file in the frontend root:

```bash
# Create .env.local file
cat > .env.local << EOF
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Fitplan.ai
VITE_APP_VERSION=1.0.0
EOF
```

**File location**: `Fitplan.ai Frontend/.env.local`

### 2.4 Verify Installation

```bash
# Check if dev server can start (without running)
bun run build --dry-run

# Or check with npm
npm run build --dry-run
```

## 🐍 Step 3: Backend Setup (Python + FastAPI)

### 3.1 Create Backend Directory

```bash
# From project root, create backend folder if it doesn't exist
mkdir -p backend

# Navigate to backend
cd backend
```

### 3.2 Create Python Virtual Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

**Expected output**: Your terminal prompt should show `(venv)` prefix

### 3.3 Install Python Dependencies

Create `requirements.txt` in backend directory:

```bash
cat > requirements.txt << EOF
fastapi==0.104.0
uvicorn==0.24.0
pymongo==4.6.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
pydantic==2.5.0
google-generativeai==0.3.0
cors-middleware==0.1.0
EOF
```

Now install:

```bash
# Activate venv first (if not already active)
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

### 3.4 Setup MongoDB

**Option A: Local MongoDB (Recommended for Development)**

```bash
# On Windows (with MongoDB installed)
# Skip this if MongoDB is already running as a service

# On macOS (using Homebrew)
brew install mongodb-community
brew services start mongodb-community

# On Linux (Ubuntu/Debian)
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster
4. Get connection string: `mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority`

### 3.5 Create Backend Environment File

Create `.env` file in backend directory:

```bash
# For local MongoDB:
cat > .env << EOF
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=fitplan_db
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_super_secret_jwt_key_change_this
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
EOF
```

**For MongoDB Atlas**, use:
```
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

### 3.6 Get Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/studio)
2. Click "Get API Key"
3. Create API key
4. Copy key to `.env` file's `GEMINI_API_KEY` field

### 3.7 Create Backend Python Files

Create `main.py`:

```bash
cat > main.py << 'EOF'
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from tokenize import generate_tokens
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Fitplan.ai API",
    version="1.0.0",
    description="AI-powered fitness and diet planning"
)

# CORS Configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Fitplan.ai API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
EOF
```

Create `models.py`:

```bash
cat > models.py << 'EOF'
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class User(BaseModel):
    email: EmailStr
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
    healthIssues: List[str] = []
    food_preference: Optional[str] = "mixed"

class Meal(BaseModel):
    name: str
    time: str
    calories: int
    protein: int
    quantity: str
    foodType: str
    dish: str

class DietPlan(BaseModel):
    meals: List[Meal]
    totalCalories: int
    totalProtein: int

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
EOF
```

### 3.8 Test Backend Setup

```bash
# Make sure venv is activated
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Run the server
python main.py

# Expected output:
# INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

Visit `http://localhost:8000/health` in browser - should show `{"status": "healthy"}`

## 🗄️ Step 4: Database Setup

### 4.1 Create MongoDB Database & Collections

Open MongoDB connection in a new terminal:

```bash
# Open MongoDB shell
mongosh

# Or if using older version
mongo
```

Inside MongoDB shell:

```javascript
// Create database
use fitplan_db

// Create collections
db.createCollection("users")
db.createCollection("user_profiles")
db.createCollection("workout_plans")
db.createCollection("diet_plans")

// Create indexes for faster queries
db.users.createIndex({ "email": 1 })
db.user_profiles.createIndex({ "user_id": 1 })
db.workout_plans.createIndex({ "user_id": 1 })
db.diet_plans.createIndex({ "user_id": 1 })

// Verify collections
show collections

// Exit
exit
```

### 4.2 Verify Database Connection

```bash
# Test connection in Python
python << EOF
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv("MONGODB_URL"))
print("Connected to MongoDB!")
print("Databases:", client.list_database_names())
EOF
```

## ▶️ Step 5: Run the Application

### Terminal 1: Start Backend

```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Start FastAPI server
python main.py

# Expected: 
# INFO: Uvicorn running on http://0.0.0.0:8000
```

### Terminal 2: Start Frontend

```bash
# Navigate to frontend directory
cd "Fitplan.ai Frontend"

# Install dependencies (if not done)
bun install

# Start dev server
bun run dev

# Expected:
# VITE v5.0.0  ready in XXX ms
# ➜  Local:   http://localhost:5173/
```

### Terminal 3: Start MongoDB (if local)

```bash
# If using local MongoDB
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows (if MongoDB Service installed)
net start MongoDB
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **MongoDB**: mongodb://localhost:27017

## ✅ Verification Checklist

```
Frontend Setup:
□ Node.js installed (node -v)
□ Bun/npm installed (bun -v or npm -v)
□ Dependencies installed (bun install)
□ .env.local created with VITE_API_URL
□ Dev server runs (bun run dev)

Backend Setup:
□ Python 3.10+ installed (python --version)
□ Virtual environment created (venv folder exists)
□ Virtual environment activated (shows (venv) in prompt)
□ Dependencies installed (pip list shows fastapi, uvicorn, etc.)
□ .env file created with API keys
□ Backend server runs (python main.py)

Database Setup:
□ MongoDB running (local or Atlas)
□ Database created (use fitplan_db)
□ Collections created (users, user_profiles, etc.)
□ Indexes created

Integration:
□ Frontend connects to backend (check browser console)
□ API endpoints respond (visit http://localhost:8000/health)
□ Swagger UI works (http://localhost:8000/docs)
□ Token-based auth works (register & login)
□ Plans can be generated (with Gemini API key)
```

## 🐛 Troubleshooting

### Frontend Issues

**Problem**: `Port 5173 already in use`
```bash
# Find process using port
lsof -i :5173  # macOS/Linux
netstat -ano | findstr :5173  # Windows

# Kill process or use different port
bun run dev --port 3000
```

**Problem**: `Module not found` errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules bun.lockb  # or package-lock.json
bun install  # or npm install
```

**Problem**: API calls failing
- Check if backend is running on port 8000
- Verify `.env.local` has correct `VITE_API_URL`
- Check browser console for CORS errors

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`
```bash
# Ensure venv is activated
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

**Problem**: `MONGODB_URL connection failed`
- Verify MongoDB is running: `mongosh` should connect
- Check `.env` file has correct connection string
- Ensure MongoDB is installed: `mongod --version`

**Problem**: `GEMINI_API_KEY error`
- Go to [Google AI Studio](https://ai.google.dev/)
- Create new API key
- Copy to `.env` file
- Restart backend server

### Database Issues

**Problem**: `Cannot connect to MongoDB`
```bash
# Verify mongod is running
# macOS
brew services list | grep mongodb-community

# Linux
sudo systemctl status mongod

# Windows
Services → MongoDB server (should be running)
```

**Problem**: Collections don't exist
```bash
# Recreate collections
mongosh
use fitplan_db
db.createCollection("users")
# ... (create other collections)
```

## 📦 Project Structure After Setup

```
Fitplan.ai Frontend/
├── src/                    # Frontend source code
├── .env.local             # Frontend env variables
├── package.json
├── node_modules/          # Dependencies (auto-created)
├── dist/                  # Build output (auto-created)
└── README.md

backend/
├── main.py                # FastAPI application
├── models.py              # Data models
├── geminiapi.py           # Gemini integration (create if needed)
├── database.py            # MongoDB connection (create if needed)
├── requirements.txt       # Python dependencies
├── .env                   # Backend env variables
└── venv/                  # Virtual environment (auto-created)

MongoDB:
└── fitplan_db/
    ├── users
    ├── user_profiles
    ├── workout_plans
    └── diet_plans
```

## 🚀 Running for Development

### Quick Start Script (macOS/Linux)

Create `run.sh`:

```bash
#!/bin/bash

# Open 3 terminal windows and run services
# Terminal 1: Frontend
open -a Terminal
cd "Fitplan.ai Frontend" && bun run dev

# Terminal 2: Backend
open -a Terminal
cd backend && source venv/bin/activate && python main.py

# Terminal 3: MongoDB (if local)
open -a Terminal
brew services start mongodb-community
```

### Windows Batch Script

Create `run.bat`:

```batch
@echo off
REM Terminal 1: Frontend
start cmd /k "cd Fitplan.ai Frontend && bun run dev"

REM Terminal 2: Backend
start cmd /k "cd backend && venv\Scripts\activate && python main.py"

REM Terminal 3: MongoDB (if installed as service)
REM net start MongoDB
```

## 📚 Next Steps

After setup is complete:

1. **Test Registration**: Create an account at http://localhost:5173/login
2. **Onboarding**: Go through 5-step onboarding
3. **Generate Plans**: AI will generate workout + diet plans
4. **View Dashboard**: See plans in action
5. **Edit Profile**: Test settings page

## 📖 Documentation

- **README.md** - Project overview
- **ARCHITECTURE.md** - System design
- **WORKFLOW.md** - User journeys
- **API_DOCUMENTATION.md** - API reference

## 🆘 Getting Help

1. Check logs in terminal windows
2. Review error messages carefully
3. Check `.env` files are correct
4. Clear cache: `ctrl+shift+delete` (Chrome)
5. Restart services and try again

---

**Setup Guide Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Complete
