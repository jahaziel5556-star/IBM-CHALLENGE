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

## Acceptance Checks

- no event type produces contradictory rules
- same event changes language by profile
- overlay duration follows event-engine defaults
- fallback mock explanations never fabricate laws when unavailable
- health and summary endpoints expose IBM mode plus database backend for demos
