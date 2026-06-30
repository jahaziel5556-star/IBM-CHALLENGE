from app.schemas.explain import ExplainRequest, ExplainResponse, OverlayPayload
from app.services.ibm_service import GraniteService
from app.services.match_service import MatchService
from app.services.profile_service import ProfileService


class ExplanationService:
    def __init__(self, match_service: MatchService, profile_service: ProfileService) -> None:
        self.match_service = match_service
        self.profile_service = profile_service
        self.ibm_service = GraniteService()

    def explain_event(self, request: ExplainRequest) -> ExplainResponse:
        event = self.match_service.get_event(request.event_id)
        if not event:
            raise ValueError("Event not found")

        rule = event["rule"]
        guidance = self._build_guidance(event=event, profile=request.profile)
        model_output = self.ibm_service.generate(
            prompt_template=rule["prompt_template"],
            event=event,
            profile=request.profile,
            guidance=guidance,
        )

        return ExplainResponse(
            event_id=event["id"],
            headline=model_output["headline"],
            explanation=model_output["explanation"],
            confidence=model_output["confidence"],
            law_reference=model_output["law_reference"],
            overlay=OverlayPayload(
                placement="lower-right",
                duration_seconds=rule["overlay_seconds"],
            ),
            prompt_template=rule["prompt_template"],
            silent_recommended=event.get("silent_recommended", False),
            why_now=rule.get("trigger_summary", ""),
            silence_rule=rule.get("silence_summary", ""),
            retrieval_sources=rule.get("retrieval_sources", []),
            evidence=model_output["evidence"],
        )

    def _build_guidance(self, *, event: dict, profile: str) -> dict:
        team = event.get("team", "the team")
        opponent = event.get("opponent", "the opposition")
        minute = event.get("minute", "unknown minute")
        event_type = event["type"].replace("_", " ")

        guidance_by_profile = {
            "new_fan": {
                "headline": event["title"],
                "base_explanation": f'In the {minute} minute, {team} created a moment around {event_type}. {event["summary"]}',
            },
            "casual_viewer": {
                "headline": event["title"],
                "base_explanation": f'At {minute}, {team} forced this situation against {opponent}. {event["summary"]}',
            },
            "analyst": {
                "headline": event["title"],
                "base_explanation": f'At {minute}, the phase favored {team} because of the underlying structure and timing. {event["analysis"]}',
            },
            "child": {
                "headline": event["title"],
                "base_explanation": f'At {minute}, {team} did something important here. {event["child_summary"]}',
            },
            "accessibility": {
                "headline": event["title"],
                "base_explanation": f'At {minute}, this moment matters because {event["summary"]}',
            },
        }

        return {
            **guidance_by_profile.get(profile, guidance_by_profile["new_fan"]),
            "default_confidence": event.get("confidence", "medium"),
            "evidence": self._build_evidence(event),
        }

    def _build_evidence(self, event: dict) -> list[str]:
        evidence = [
            f'{event["minute"]}\' minute context',
            event["summary"],
        ]
        if event.get("law_reference"):
            evidence.append(event["law_reference"])
        if event["type"] in {"high_press_detected", "momentum_shift", "substitution"}:
            evidence.append("Tactical pattern detected")
        return evidence
