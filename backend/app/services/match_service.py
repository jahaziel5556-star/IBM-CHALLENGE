import json
from pathlib import Path

from sqlalchemy.orm import Session

from app.repositories.match_repository import MatchRepository
from app.services.video_service import VideoService


class MatchService:
    def __init__(self, session: Session) -> None:
        self.repository = MatchRepository(session)
        rules_path = Path(__file__).resolve().parents[1] / "data" / "event_rules.json"
        with rules_path.open("r", encoding="utf-8") as file:
            rule_items = json.load(file)
        self.rule_details = {item["event_type"]: item for item in rule_items}
        demo_path = Path(__file__).resolve().parents[1] / "data" / "demo_script.json"
        with demo_path.open("r", encoding="utf-8") as file:
            self.demo_script = json.load(file)

    def list_matches(self) -> list[dict]:
        return [self._serialize_match(match) for match in self.repository.list_matches()]

    def get_match(self, match_id: str) -> dict | None:
        match = self.repository.get_match(match_id)
        return self._serialize_match(match) if match else None

    def list_events_for_match(self, match_id: str) -> list[dict]:
        events = self.repository.list_events_for_match(match_id)
        return [self._serialize_event(event) for event in events]

    def get_event(self, event_id: str) -> dict | None:
        event = self.repository.get_event(event_id)
        if not event:
            return VideoService().find_event(event_id)
        return self._serialize_event(event)

    def get_demo_script(self) -> list[dict]:
        return self.demo_script

    def get_system_summary(self, *, ibm_mode: str) -> dict:
        profiles_supported = ["new_fan", "casual_viewer", "analyst", "child", "accessibility"]
        return {
            "database_backend": self.repository.session.bind.dialect.name,
            "ibm_mode": ibm_mode,
            "match_count": self.repository.count_matches(),
            "event_count": self.repository.count_events(),
            "rule_count": self.repository.count_rules(),
            "demo_step_count": len(self.demo_script),
            "profiles_supported": profiles_supported,
            "event_types_supported": sorted(self.rule_details.keys()),
        }

    def _serialize_match(self, match: object) -> dict:
        return {
            "id": match.id,
            "competition": match.competition,
            "home_team": match.home_team,
            "away_team": match.away_team,
            "venue": match.venue,
            "date": match.date,
            "status": match.status,
            "score": {"home": match.score_home, "away": match.score_away},
        }

    def _serialize_event(self, event: object) -> dict:
        rule = self.repository.get_rule(event.type)
        rule_details = self.rule_details.get(event.type, {})
        return {
            "id": event.id,
            "match_id": event.match_id,
            "minute": event.minute,
            "type": event.type,
            "title": event.title,
            "team": event.team,
            "opponent": event.opponent,
            "summary": event.summary,
            "analysis": event.analysis,
            "child_summary": event.child_summary,
            "confidence": event.confidence,
            "law_reference": event.law_reference,
            "silent_recommended": event.silent_recommended,
            "rule": {
                "event_type": rule.event_type,
                "prompt_template": rule.prompt_template,
                "overlay_seconds": rule.overlay_seconds,
                "priority": rule_details.get("priority", 50),
                "retrieval_sources": rule_details.get("retrieval_sources", []),
                "trigger_summary": rule_details.get("trigger_summary", ""),
                "silence_summary": rule_details.get("silence_summary", ""),
            }
            if rule
            else None,
        }
