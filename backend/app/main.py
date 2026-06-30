from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import settings
from app.database.init_db import initialize_database


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="MatchMind One API",
        version="1.0.0",
        description="Broadcast intelligence API for explainable football insights.",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router)

    return app


app = create_app()
