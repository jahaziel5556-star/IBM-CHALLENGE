# MatchMind One System Architecture

## High-Level Flow

```text
Seeded Match Event or Live Event Adapter
                |
                v
         Event Engine Rules
                |
                v
        Knowledge / Rule Retrieval
                |
                v
     Granite Prompt Assembly Service
                |
                v
       Granite Adapter or Mock Engine
                |
                v
     Overlay Payload Formatter API
                |
                v
          Broadcast Overlay UI
```

## Frontend

- React 19
- TypeScript
- Vite
- Broadcast-oriented component architecture
- API layer isolated under `src/api`

## Backend

- FastAPI
- Pydantic settings and schemas
- SQLAlchemy-ready persistence seam
- Service layer for matches, events, rules, profiles, and explanations

## Persistence Strategy

The first implementation uses seeded JSON-backed domain data and a SQLite default for local persistence. Interfaces remain compatible with later PostgreSQL and Alembic migration work.

## IBM Integration Strategy

- `GraniteService` owns all model access
- environment variables control real vs mock execution
- `watsonx.ai` is the target provider path
- LangFlow, Docling, and Context Forge are explicit extension seams
