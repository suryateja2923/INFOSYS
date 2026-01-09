from pymongo import MongoClient

MONGO_URL = "mongodb+srv://chsuryateja523_db_user:surya@ai-fitness-cluster.xbvofq3.mongodb.net/?retryWrites=true&w=majority"

client = MongoClient(MONGO_URL)
db = client["ai_fitness"]

users_collection = db["users"]
plans_collection = db["plans"]
