from __future__ import annotations

import json

import httpx

from app.core.config import settings


class GraniteService:
    def __init__(self) -> None:
        self.is_mock = settings.ibm_watsonx_use_mock or not (
            settings.ibm_watsonx_api_key and settings.ibm_watsonx_project_id
        )

    def generate(self, *, prompt_template: str, event: dict, profile: str, guidance: dict, prompt_payload: dict) -> dict:
        if self.is_mock:
            return self._generate_mock(prompt_template=prompt_template, event=event, profile=profile, guidance=guidance)

        try:
            return self._generate_watsonx(
                prompt_template=prompt_template,
                event=event,
                guidance=guidance,
                prompt_payload=prompt_payload,
            )
        except Exception:
            return self._generate_mock(prompt_template=prompt_template, event=event, profile=profile, guidance=guidance)

    def _generate_watsonx(self, *, prompt_template: str, event: dict, guidance: dict, prompt_payload: dict) -> dict:
        token = self._get_iam_token()
        body = {
            "model_id": settings.ibm_watsonx_model_id,
            "project_id": settings.ibm_watsonx_project_id,
            "messages": prompt_payload["messages"],
            "max_tokens": 300,
            "time_limit": settings.ibm_watsonx_timeout_seconds * 1000,
        }

        response = httpx.post(
            f"{settings.ibm_watsonx_url}/ml/v1/text/chat",
            params={"version": settings.ibm_watsonx_api_version},
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json=body,
            timeout=settings.ibm_watsonx_timeout_seconds,
        )
        response.raise_for_status()
        payload = response.json()
        content = payload["choices"][0]["message"]["content"]

        try:
            structured = json.loads(content)
        except json.JSONDecodeError:
            structured = {
                "headline": guidance["headline"],
                "explanation": content,
                "confidence": guidance["default_confidence"],
                "law_reference": event.get("law_reference"),
                "evidence": guidance["evidence"],
            }

        return {
            "headline": structured.get("headline", guidance["headline"]),
            "explanation": structured.get("explanation", content),
            "confidence": structured.get("confidence", guidance["default_confidence"]),
            "law_reference": structured.get("law_reference", event.get("law_reference")),
            "prompt_template": prompt_template,
            "evidence": structured.get("evidence", guidance["evidence"]),
        }

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
            "evidence": guidance["evidence"],
        }

    def _get_iam_token(self) -> str:
        response = httpx.post(
            "https://iam.cloud.ibm.com/identity/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                "apikey": settings.ibm_watsonx_api_key,
            },
            timeout=settings.ibm_watsonx_timeout_seconds,
        )
        response.raise_for_status()
        return response.json()["access_token"]
