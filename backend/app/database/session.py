from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings


connect_args = {"check_same_thread": False} if settings.is_sqlite else {}

engine = create_engine(
    settings.database_url,
    connect_args=connect_args,
    echo=settings.database_echo,
    pool_pre_ping=not settings.is_sqlite,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
