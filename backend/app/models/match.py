from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    competition: Mapped[str] = mapped_column(String)
    home_team: Mapped[str] = mapped_column(String)
    away_team: Mapped[str] = mapped_column(String)
    venue: Mapped[str] = mapped_column(String)
    date: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    score_home: Mapped[int] = mapped_column()
    score_away: Mapped[int] = mapped_column()
