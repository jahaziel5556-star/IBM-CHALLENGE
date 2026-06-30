# MatchMind One

MatchMind One is an AI Broadcast Intelligence Layer for football broadcasts. It generates short, explainable, profile-aware insights that help viewers understand why important match events happened without interrupting the live experience.

## Workspace

- `docs/` canonical project specifications
- `frontend/` React + TypeScript + Vite application
- `backend/` FastAPI application
- `assets/` static design and demo assets
- `scripts/` helper scripts
- `tests/` cross-project validation

## Current Status

This repository was initialized on June 30, 2026 and now contains the first implementation foundation for:

- canonical documentation
- seeded event engine rules
- backend API skeleton
- frontend broadcast shell
- deployment and environment scaffolding

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## IBM Integration Direction

The implementation is structured around IBM watsonx.ai and Granite through backend adapters configured by environment variables. The repository includes a mock fallback so the app remains usable before credentials are supplied.
