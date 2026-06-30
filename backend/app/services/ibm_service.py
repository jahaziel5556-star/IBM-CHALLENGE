from __future__ import annotations

from app.core.config import settings


class GraniteService:
    def __init__(self) -> None:
        self.is_mock = settings.ibm_watsonx_use_mock or not (
            settings.ibm_watsonx_api_key and settings.ibm_watsonx_project_id
        )

    def generate(self, *, prompt_template: str, event: dict, profile: str, guidance: dict) -> dict:
        if self.is_mock:
            return self._generate_mock(prompt_template=prompt_template, event=event, profile=profile, guidance=guidance)

        return self._generate_mock(prompt_template=prompt_template, event=event, profile=profile, guidance=guidance)

    def _generate_mock(self, *, prompt_template: str, event: dict, profile: str, guidance: dict) -> dict:
        profile_text = {
            "new_fan": "This explains the main reason in simple football language.",
            "casual_viewer": "This adds enough context to make the decision or tactical swing easy to follow.",
            "analyst": "This focuses on structure, spacing, and cause-effect in the phase of play.",
            "child": "This uses friendly wording and one clear football idea.",
            "accessibility": "This keeps the wording steady, clear, and easy to scan quickly.",
        }[profile]
        law_reference = event.get("law_reference")
        return {
            "headline": guidance["headline"],
            "explanation": f'{guidance["base_explanation"]} {profile_text}',
            "confidence": event.get("confidence", guidance["default_confidence"]),
            "law_reference": law_reference,
            "prompt_template": prompt_template,
        }
