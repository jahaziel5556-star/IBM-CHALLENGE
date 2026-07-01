from __future__ import annotations

import json
import re

import httpx

from app.core.config import settings


class GraniteService:
    def __init__(self) -> None:
        self.is_mock = settings.ibm_watsonx_use_mock or not (
            settings.ibm_watsonx_api_key and settings.ibm_watsonx_project_id
        )
        self.last_generation_mode = "mock" if self.is_mock else "watsonx_ready"

    def generate(self, *, prompt_template: str, event: dict, profile: str, guidance: dict, prompt_payload: dict) -> dict:
        if self.is_mock:
            self.last_generation_mode = "mock"
            return self._generate_mock(prompt_template=prompt_template, event=event, profile=profile, guidance=guidance)

        try:
            result = self._generate_watsonx(
                prompt_template=prompt_template,
                event=event,
                guidance=guidance,
                prompt_payload=prompt_payload,
            )
            self.last_generation_mode = "watsonx"
            return result
        except Exception:
            self.last_generation_mode = "fallback_mock"
            return self._generate_mock(prompt_template=prompt_template, event=event, profile=profile, guidance=guidance)

    def generate_video_events(self, *, prompt_payload: dict) -> dict:
        if self.is_mock:
            self.last_generation_mode = "mock"
            return {"events": []}

        try:
            token = self._get_iam_token()
            body = {
                "model_id": settings.ibm_watsonx_model_id,
                "project_id": settings.ibm_watsonx_project_id,
                "messages": [
                    {"role": "system", "content": prompt_payload["system"]},
                    {"role": "user", "content": [{"type": "text", "text": prompt_payload["user"]}]},
                ],
                "max_tokens": 900,
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
            content = response.json()["choices"][0]["message"]["content"]
            parsed = self._parse_json_object(content)
            self.last_generation_mode = "watsonx" if parsed.get("events") else "watsonx_empty"
            return parsed
        except Exception:
            self.last_generation_mode = "fallback_mock"
            return {"events": []}

    def verify_text_chat(self) -> dict:
        if self.is_mock:
            return {"ok": False, "mode": "mock", "reason": "watsonx credentials are not configured"}

        token = self._get_iam_token()
        body = {
            "model_id": settings.ibm_watsonx_model_id,
            "project_id": settings.ibm_watsonx_project_id,
            "messages": [
                {"role": "system", "content": "Return only valid JSON."},
                {"role": "user", "content": [{"type": "text", "text": "Return {\"ok\":true}"}]},
            ],
            "max_tokens": 80,
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
        if not response.is_success:
            return {
                "ok": False,
                "mode": "watsonx_error",
                "status_code": response.status_code,
                "reason": response.text[:500],
            }
        parsed = self._parse_json_object(response.json()["choices"][0]["message"]["content"])
        return {"ok": bool(parsed.get("ok")), "mode": "watsonx"}

    def _parse_json_object(self, content: str) -> dict:
        try:
            parsed = json.loads(content)
            return parsed if isinstance(parsed, dict) else {"events": []}
        except json.JSONDecodeError:
            pass

        fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, flags=re.DOTALL)
        if fenced:
            try:
                parsed = json.loads(fenced.group(1))
                return parsed if isinstance(parsed, dict) else {"events": []}
            except json.JSONDecodeError:
                pass

        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                parsed = json.loads(content[start : end + 1])
                return parsed if isinstance(parsed, dict) else {"events": []}
            except json.JSONDecodeError:
                return {"events": []}
        return {"events": []}

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
