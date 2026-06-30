from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.match import Match
from app.models.rule import Rule


class MatchRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def list_matches(self) -> list[Match]:
        return list(self.session.scalars(select(Match).order_by(Match.date)))

    def get_match(self, match_id: str) -> Match | None:
        return self.session.get(Match, match_id)

    def list_events_for_match(self, match_id: str) -> list[Event]:
        statement = select(Event).where(Event.match_id == match_id).order_by(Event.minute)
        return list(self.session.scalars(statement))

    def get_event(self, event_id: str) -> Event | None:
        return self.session.get(Event, event_id)

    def get_rule(self, event_type: str) -> Rule | None:
        return self.session.get(Rule, event_type)

    def count_matches(self) -> int:
        return int(self.session.scalar(select(func.count()).select_from(Match)) or 0)

    def count_events(self) -> int:
        return int(self.session.scalar(select(func.count()).select_from(Event)) or 0)

    def count_rules(self) -> int:
        return int(self.session.scalar(select(func.count()).select_from(Rule)) or 0)
