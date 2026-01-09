from db.mongo import get_db

db = get_db()
print("Connected to DB:", db.name)
