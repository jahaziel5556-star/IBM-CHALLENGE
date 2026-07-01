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

For live verification after credentials are added locally:

```powershell
.\scripts\verify-watsonx-live.ps1
```

The repository default model is `ibm/granite-3-8b-instruct`, which is chat-capable in the verified `us-south` inventory.

## Database Modes

- Local quick start: SQLite with automatic schema initialization and seeded demo data
- Production-shaped local stack: PostgreSQL through Docker Compose plus Alembic migrations
- Docker backend startup now applies `alembic upgrade head` before starting the API

## Validation Snapshot

- Backend API tests pass with `py -m pytest`
- Frontend component tests pass with `npm run test`
- Frontend production build passes with `npm run build`
- Browser-level demo verification passes with `npm run test:e2e`
- GitHub Actions can run the same local validation path on pushes and pull requests

## Rapid Submission Path

If you need a verified deliverable without Docker, this is the primary fast path:

```powershell
.\scripts\verify-release-readiness.ps1
```

That one command runs:

- backend tests
- frontend unit tests
- frontend production build
- Playwright end-to-end demo validation
- live watsonx verification
- demo bundle packaging

This is the recommended submission route when Docker is unavailable on the workstation.

## MP4 Overlay Demo

Run the backend and frontend, open the app, and use the Video Overlay Studio to upload a `.mp4` clip. You can also upload [sample-video-events.json](/C:/Users/Jahaziel%20Davis/Documents/IBM%20CHALLENGE/assets/sample-video-events.json) as a sidecar timeline so overlays trigger at real timestamps.

Without a sidecar timeline, the backend now samples the MP4 with OpenCV, extracts visual cues such as motion, scene changes, pitch visibility, line density, and close-up patterns, and routes those observations through Granite when live watsonx credentials are enabled. A deterministic local classifier remains as the offline fallback.

Uploaded clips stay local under `backend/uploads/` and are ignored by Git.

For live Granite event selection, the IBM project must be associated with a Watson Machine Learning service instance. `.\scripts\verify-watsonx-live.ps1` now performs a strict text-chat call and will fail if IBM returns `no_associated_service_instance_error`.

## How The AI Decides To Speak

MatchMind One uses a two-step AI flow. First, the Event Engine classifies the match moment, checks priority, confidence, timing, viewer profile, and silence rules, then decides whether an overlay is useful. Only after that does IBM Granite receive the grounded event context and write the short explanation.

The overlay is intentionally compact and edge-docked so the match stays primary. Deeper evidence and rule details stay in the side panels instead of covering the video.

## GitHub CI

The repository now includes [`.github/workflows/ci.yml`](/C:/Users/Jahaziel%20Davis/Documents/IBM%20CHALLENGE/.github/workflows/ci.yml) for:

- backend tests
- frontend unit tests
- frontend production build
- Playwright demo validation
- optional live watsonx verification when repository secrets are configured

To enable the live watsonx CI job, add these GitHub repository secrets:

- `IBM_WATSONX_API_KEY`
- `IBM_WATSONX_PROJECT_ID`
- `IBM_WATSONX_URL`
- `IBM_WATSONX_MODEL_ID`
- `IBM_WATSONX_API_VERSION`

## Demo Packaging

To generate a judge-ready bundle from the current repo state:

```powershell
.\scripts\package-demo-bundle.ps1
```

This writes a zip archive under `artifacts/` with the key docs, run scripts, verification helpers, and a manifest linked to the current commit.

## Docker Prereq Check

On this Windows workstation, the remaining deployment blocker is the Docker Desktop runtime, not the application code. To diagnose the local Docker prerequisites:

```powershell
.\scripts\verify-docker-prereqs.ps1
```

This reports whether the Docker CLI is present, whether the Docker daemon is reachable, whether the Docker Desktop service is running, and whether WSL is installed.

If the report shows missing WSL or a stopped Docker Desktop service, open an elevated PowerShell window and run:

```powershell
.\scripts\enable-docker-runtime-prereqs.ps1
```

Then reboot if Windows asks you to, start Docker Desktop, and rerun `.\scripts\verify-docker-prereqs.ps1`.

If you want a one-click UAC launcher instead, run:

```cmd
scripts\launch-docker-setup-admin.cmd
```

## Compose Smoke Test

After Docker Desktop is healthy, you can verify the full containerized stack with:

```powershell
.\scripts\verify-compose-stack.ps1
```

This builds the services, starts the Compose stack, waits for readiness, and exercises the backend health, system summary, and explain endpoints.

To chain the final Docker checks once prerequisites are fixed:

```powershell
.\scripts\finalize-docker-verification.ps1
```

Or from Command Prompt:

```cmd
scripts\run-final-deployment-checks.cmd
```
