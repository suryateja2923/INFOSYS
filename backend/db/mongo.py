from pymongo import MongoClient
import os
import logging
from typing import Any

logger = logging.getLogger(__name__)

# Load Mongo connection string from environment, fall back to localhost for dev
MONGO_URL = os.getenv("MONGO_URI") or "mongodb://localhost:27017"
if "MONGO_URI" not in os.environ:
    logger.warning("MONGO_URI not set; falling back to %s", MONGO_URL)

client: Any = MongoClient(MONGO_URL)
db = client["ai_fitness"]

users_collection = db["users"]
plans_collection = db["plans"]


def get_db():
    """Return the `ai_fitness` database instance."""
    return db
