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
- seeded event engine rules and curated demo script
- backend API with profile, demo, and explain contracts
- frontend broadcast simulation, replay spotlight, and judge demo flow
- deployment and environment scaffolding
- PostgreSQL and Alembic migration support for production-shaped persistence

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### End-To-End Demo Validation

```bash
cd frontend
npm run test:e2e
```

This launches isolated local frontend and backend servers on dedicated high ports, then verifies the judge/demo flow in a real browser.

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

For the default local SQLite flow, `DATABASE_AUTO_INIT=true` keeps first-run setup simple. For PostgreSQL, run migrations explicitly with `alembic upgrade head`.

### One-Command Local Run

Windows PowerShell:

```powershell
.\scripts\run-matchmind-local.ps1
```

To stop both local processes:

```powershell
.\scripts\stop-matchmind-local.ps1
```

## Demo Flow

- Start `Demo Mode` from the frontend
- Walk through offside, penalty, VAR, goal, and red-card moments
- Switch profiles during the penalty or VAR explanation
- Use the replay window and evidence chips to explain why the AI spoke

Detailed guidance lives in `docs/12_DEMO.md`.

## IBM Integration Direction

The implementation is structured around IBM watsonx.ai and Granite through backend adapters configured by environment variables. The repository includes a mock fallback so the app remains usable before credentials are supplied.

## Database Modes

- Local quick start: SQLite with automatic schema initialization and seeded demo data
- Production-shaped local stack: PostgreSQL through Docker Compose plus Alembic migrations
- Docker backend startup now applies `alembic upgrade head` before starting the API

## Validation Snapshot

- Backend API tests pass with `py -m pytest`
- Frontend component tests pass with `npm run test`
- Frontend production build passes with `npm run build`
- Browser-level demo verification passes with `npm run test:e2e`
