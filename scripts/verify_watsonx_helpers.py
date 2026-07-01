from __future__ import annotations

import httpx

from app.core.config import settings


def list_chat_models(token: str) -> list[str]:
    response = httpx.get(
        f"{settings.ibm_watsonx_url}/ml/v1/foundation_model_specs",
        params={"version": settings.ibm_watsonx_api_version, "filters": "function_text_chat"},
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        timeout=settings.ibm_watsonx_timeout_seconds,
    )
    response.raise_for_status()
    payload = response.json()
    resources = payload.get("resources", [])
    return [
        item.get("model_id") or item.get("id") or item.get("name")
        for item in resources
        if item.get("model_id") or item.get("id") or item.get("name")
    ]
