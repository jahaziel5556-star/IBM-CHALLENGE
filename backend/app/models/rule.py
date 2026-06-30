from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Rule(Base):
    __tablename__ = "rules"

    event_type: Mapped[str] = mapped_column(String, primary_key=True)
    prompt_template: Mapped[str] = mapped_column(String)
    overlay_seconds: Mapped[int] = mapped_column(Integer)
