# MatchMind One Testing Strategy

## Backend

- health endpoint test
- matches endpoint test
- event lookup test
- explanation generation test
- profile variation test
- demo-readiness summary endpoint test
- Alembic migration smoke test against a fresh SQLite database

## Frontend

- app shell render
- profile switch behavior
- overlay card rendering
- match timeline rendering
- Playwright demo-flow validation across real frontend and backend processes
- GitHub Actions automation for backend, frontend, and E2E verification

## Acceptance Checks

- no event type produces contradictory rules
- same event changes language by profile
- overlay duration follows event-engine defaults
- fallback mock explanations never fabricate laws when unavailable
- health and summary endpoints expose IBM mode plus database backend for demos
- profile switching immediately re-explains the active event with the newly selected profile
- browser-level demo flow confirms overlay generation, insight history, and accessibility controls
- GitHub CI can enforce the local validation path automatically on repository changes
