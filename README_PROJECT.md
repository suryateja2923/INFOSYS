# Fitness Planner — AI Powered

This repository contains a React frontend and a lightweight Python backend for generating personalized fitness plans.

## Project structure

- `public/` — static assets (place `background.jpg` here)
- `src/` — React application
- `backend/` — Python backend (entry in `main.py`)

## Quick start (development)

Prerequisites:
- Node.js (16+)
- Python 3.10+ and pip

1) Install & run frontend

```bash
cd trail1
npm install
npm start
```

Open http://localhost:3000

2) Run backend (optional, for plan generation)

```bash
cd backend
python -m pip install -r requirements.txt
python main.py
```

The backend listens on the port configured in `main.py` (check the file for details).

## Styling notes

- Background image: `public/background.jpg`. The app uses this as a fixed background for Landing and Planner pages. Replace the image file to change the background.
- Transparency: Hero, About, Footer and other cards use semi-transparent styles so the background shows through.
- Glow effects: Headings and buttons use `text-shadow` and `box-shadow` to create a neon gym aesthetic.

Files changed for styling:

- `src/pages/Landing.css` — background, hero, glow effects, transparent boxes
- `src/pages/Planner.css` — background, transparent cards, glow effects

If you need different colors or less glow, edit those CSS files.

## Build for production

```bash
npm run build
```

Then serve the `build/` folder using any static file server.

## Notes & troubleshooting

- If the background image does not display, ensure `public/background.jpg` exists and frontend restarted.
- If you see layout overflow or extra scrolling, the CSS now reduces large paddings; tweak section paddings in `src/pages/*css`.

## Contact

If you want me to adjust colors or reduce glow further, tell me which page and I'll tune the CSS.

## Docker (recommended for deployment)

I added Dockerfiles and a `docker-compose.yml` that builds and runs the frontend (nginx) and backend (uvicorn) together.

Files added:
- `backend/Dockerfile` — builds the FastAPI backend image
- `Dockerfile` — multi-stage React build + nginx image
- `nginx.conf` — nginx config to serve the SPA and proxy `/auth` and `/plan` to backend
- `docker-compose.yml` — orchestrates `frontend` and `backend` services

Quick start (build and run):

```bash
# from project root (trail1)
docker-compose build
docker-compose up -d
```

Frontend will be available on http://localhost (port 80) and backend on http://localhost:8000.

Notes:
- The frontend build picks up `REACT_APP_API_URL` at build time. Since Nginx proxies requests to the backend, this should typically be left empty (to use relative paths) or set to the public URL, rather than the internal Docker service name.
- Provide secrets via environment variables (or a `.env` file) before `docker-compose up`:

```bash
export GEMINI_API_KEY="your_api_key"
export MONGO_URL="your_mongo_connection_string"
docker-compose up -d --build
```

- The backend reads `ALLOWED_ORIGINS` (comma-separated) to configure CORS. By default it allows `http://localhost:3000` but the compose file sets a broader default. Set `ALLOWED_ORIGINS` if you use a custom domain.

If you want, I can also add a small `Makefile` or `.env.example` to make deployment easier.
