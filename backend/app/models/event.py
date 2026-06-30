from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    match_id: Mapped[str] = mapped_column(String, ForeignKey("matches.id"))
    minute: Mapped[int] = mapped_column(Integer)
    type: Mapped[str] = mapped_column(String, ForeignKey("rules.event_type"))
    title: Mapped[str] = mapped_column(String)
    team: Mapped[str] = mapped_column(String)
    opponent: Mapped[str] = mapped_column(String)
    summary: Mapped[str] = mapped_column(String)
    analysis: Mapped[str] = mapped_column(String)
    child_summary: Mapped[str] = mapped_column(String)
    confidence: Mapped[str] = mapped_column(String)
    law_reference: Mapped[str | None] = mapped_column(String, nullable=True)
    silent_recommended: Mapped[bool] = mapped_column(Boolean, default=False)
