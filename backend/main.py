import os
from dotenv import load_dotenv

# Load environment variables from backend/.env (if present) before
# importing route modules that may read them at import time.
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth_routes import router as auth_router
from routes.plan_routes import router as plan_router

app = FastAPI()

# Read allowed origins from environment variable so deployments
# (Netlify, Docker) can configure frontend origin(s). Use a
# comma-separated list or "*".
raw_allowed = os.getenv("ALLOWED_ORIGINS", "")
if raw_allowed:
    if raw_allowed.strip() == "*":
        origins = ["*"]
    else:
        origins = [o.strip() for o in raw_allowed.split(",") if o.strip()]

else:
    # sensible defaults for local development
    origins = [
        "http://localhost:3000",
        "http://localhost",
        "http://localhost:80",
    ]

# If wildcard origin is used, credentials must be disabled.
allow_credentials = False if origins == ["*"] else True

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(plan_router)
