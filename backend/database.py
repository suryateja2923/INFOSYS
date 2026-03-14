from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URL from .env
MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    raise ValueError("⚠️ CRITICAL: MONGO_URL not set in .env file")

# Get database name from .env or use default
DB_NAME = os.getenv("DB_NAME", "fitness_app")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_collection = db["users"]
profiles_collection = db["user_profiles"]
workout_collection = db["workout_plans"]
diet_collection = db["diet_plans"]
feedback_collection = db["feedback"]

# Initialize indexes for better performance
async def init_database():
    """Create database indexes for performance"""
    try:
        # Users
        await users_collection.create_index("email", unique=True)
        
        # Profiles
        await profiles_collection.create_index("user_id", unique=True)
        
        # Workouts
        await workout_collection.create_index([("user_id", 1), ("day", -1)])
        
        # Diet
        await diet_collection.create_index([("user_id", 1), ("day", -1)])
        
        # Feedback
        await feedback_collection.create_index([("user_id", 1), ("day", -1)])
        
        print("✅ Database indexes created successfully")
    except Exception as e:
        print(f"⚠️ Database initialization error: {e}")

