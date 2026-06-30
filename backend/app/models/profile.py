from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    profile: Mapped[str] = mapped_column(String)
    language: Mapped[str] = mapped_column(String, default="en")
    large_text: Mapped[bool] = mapped_column(Boolean, default=False)
    high_contrast: Mapped[bool] = mapped_column(Boolean, default=False)
    reduced_motion: Mapped[bool] = mapped_column(Boolean, default=False)
