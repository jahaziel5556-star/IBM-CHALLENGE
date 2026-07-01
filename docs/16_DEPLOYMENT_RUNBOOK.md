# MatchMind One Deployment Runbook

## Purpose

This runbook packages the current deployment guidance into one place for local demos, CI validation, and later hosted rollout work.

## Deployment Modes

### Local development

- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload`
- Browser validation: `cd frontend && npm run test:e2e`
- Live IBM validation: `.\scripts\verify-watsonx-live.ps1`

### Docker Compose stack

Use this mode when Docker is installed and available on the machine.

```bash
docker compose up --build
```

Expected services:

- PostgreSQL on `5432`
- Backend on `8000`
- Frontend on `5173`

Notes:

- The backend container runs `alembic upgrade head` on startup.
- The Compose file currently defaults to `IBM_WATSONX_USE_MOCK=true`.
- To switch the Compose stack to live watsonx, inject the IBM env vars securely instead of editing committed files.

### GitHub Actions CI

The repository includes [ci.yml](/C:/Users/Jahaziel%20Davis/Documents/IBM%20CHALLENGE/.github/workflows/ci.yml) for:

- backend tests
- frontend unit tests
- frontend build
- Playwright end-to-end demo validation
- optional live watsonx verification when secrets are configured

## Required Secrets For Live IBM Validation

- `IBM_WATSONX_API_KEY`
- `IBM_WATSONX_PROJECT_ID`
- `IBM_WATSONX_URL`
- `IBM_WATSONX_MODEL_ID`
- `IBM_WATSONX_API_VERSION`

## Verified Runtime Facts

- On June 30, 2026, live IAM token retrieval succeeded for the configured IBM project.
- On June 30, 2026, the `us-south` model inventory exposed `ibm/granite-3-8b-instruct` for chat.
- On June 30, 2026, `granite-3-2b-instruct` returned `403 Forbidden` and was replaced as the repository default.
- On June 30, 2026, the local workstation still did not have the `docker` CLI installed, so Docker runtime validation remained pending external machine setup.

## Release Checklist

- Run `py -m pytest`
- Run `cd frontend && npm run test`
- Run `cd frontend && npm run build`
- Run `cd frontend && npm run test:e2e`
- Run `.\scripts\verify-watsonx-live.ps1` when live IBM credentials are configured
- Package a demo handoff with `.\scripts\package-demo-bundle.ps1`

## Demo Bundle Output

The demo-bundle script writes a portable handoff under `artifacts/` that includes:

- product and API documentation
- demo and testing guides
- local run scripts
- IBM verification helpers
- a manifest with timestamp and commit reference
