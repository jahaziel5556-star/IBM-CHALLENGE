import json
from pathlib import Path

from sqlalchemy import inspect, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.base import Base
from app.database.session import engine
from app.models.event import Event
from app.models.match import Match
from app.models.profile import Profile
from app.models.rule import Rule


def initialize_database() -> None:
    if settings.database_auto_init:
        Base.metadata.create_all(bind=engine)

    missing_tables = _get_missing_tables()
    if missing_tables:
        missing_display = ", ".join(sorted(missing_tables))
        raise RuntimeError(
            "Database schema is missing required tables: "
            f"{missing_display}. Run `alembic upgrade head` or enable DATABASE_AUTO_INIT=true."
        )

    with Session(engine) as session:
        if settings.seed_demo_data:
            _seed_matches(session)
            _seed_rules(session)
            _seed_events(session)
        _seed_default_profile(session)
        session.commit()


def _get_missing_tables() -> set[str]:
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    required_tables = {"events", "matches", "profiles", "rules"}
    return required_tables - existing_tables


def _load_json(filename: str) -> list[dict]:
    data_dir = Path(__file__).resolve().parents[1] / "data"
    with (data_dir / filename).open("r", encoding="utf-8") as file:
        return json.load(file)


def _seed_matches(session: Session) -> None:
    if session.scalar(select(Match.id).limit(1)):
        return

    for item in _load_json("matches.json"):
        session.add(
            Match(
                id=item["id"],
                competition=item["competition"],
                home_team=item["home_team"],
                away_team=item["away_team"],
                venue=item["venue"],
                date=item["date"],
                status=item["status"],
                score_home=item["score"]["home"],
                score_away=item["score"]["away"],
            )
        )


def _seed_rules(session: Session) -> None:
    for item in _load_json("event_rules.json"):
        rule = session.get(Rule, item["event_type"])
        if rule:
            rule.prompt_template = item["prompt_template"]
            rule.overlay_seconds = item["overlay_seconds"]
            continue
        session.add(
            Rule(
                event_type=item["event_type"],
                prompt_template=item["prompt_template"],
                overlay_seconds=item["overlay_seconds"],
            )
        )


def _seed_events(session: Session) -> None:
    if session.scalar(select(Event.id).limit(1)):
        return

    for item in _load_json("events.json"):
        session.add(
            Event(
                id=item["id"],
                match_id=item["match_id"],
                minute=item["minute"],
                type=item["type"],
                title=item["title"],
                team=item["team"],
                opponent=item["opponent"],
                summary=item["summary"],
                analysis=item["analysis"],
                child_summary=item["child_summary"],
                confidence=item["confidence"],
                law_reference=item.get("law_reference"),
                silent_recommended=item.get("silent_recommended", False),
            )
        )


def _seed_default_profile(session: Session) -> None:
    if session.scalar(select(Profile.id).limit(1)):
        return

    session.add(
        Profile(
            id=1,
            profile="new_fan",
            language="en",
            large_text=False,
            high_contrast=False,
            reduced_motion=False,
        )
    )
