from __future__ import annotations

import json
from pathlib import Path
import sys


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

import httpx

from app.core.config import settings
from app.database.init_db import initialize_database
from app.database.session import SessionLocal
from app.services.explanation_service import ExplanationService
from app.services.ibm_service import GraniteService
from app.services.match_service import MatchService
from app.services.profile_service import ProfileService
from app.schemas.explain import ExplainRequest


def main() -> int:
    service = GraniteService()
    initialize_database()
    print("MatchMind One watsonx live verification")
    print(json.dumps(
        {
            "use_mock_flag": settings.ibm_watsonx_use_mock,
            "service_is_mock": service.is_mock,
            "project_id_present": bool(settings.ibm_watsonx_project_id),
            "api_key_present": bool(settings.ibm_watsonx_api_key),
            "url": settings.ibm_watsonx_url,
            "model_id": settings.ibm_watsonx_model_id,
        },
        indent=2,
    ))

    token = service._get_iam_token()
    print(json.dumps({"iam_token_received": bool(token)}, indent=2))

    chat_models = list_chat_models(token)
    print(json.dumps({"chat_model_count": len(chat_models), "chat_models": chat_models}, indent=2))

    if settings.ibm_watsonx_model_id not in chat_models:
        print(
            json.dumps(
                {
                    "live_inference_ready": False,
                    "reason": "Configured model is not present in the chat-capable model inventory for this region/project.",
                },
                indent=2,
            )
        )
        return 1

    strict_inference = service.verify_text_chat()
    print(json.dumps({"strict_text_chat": strict_inference}, indent=2))
    if not strict_inference.get("ok"):
        return 1

    session = SessionLocal()
    try:
        match_service = MatchService(session)
        profile_service = ProfileService(session)
        explanation_service = ExplanationService(match_service, profile_service)
        response = explanation_service.explain_event(ExplainRequest(profile="new_fan", event_id="evt-penalty-62"))
    finally:
        session.close()

    print(
        json.dumps(
            {
                "live_inference_ready": True,
                "generation_mode": explanation_service.ibm_service.last_generation_mode,
                "headline": response.headline,
                "prompt_template": response.prompt_template,
                "law_reference": response.law_reference,
                "explanation_excerpt": response.explanation[:180],
            },
            indent=2,
        )
    )
    return 0


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


if __name__ == "__main__":
    raise SystemExit(main())
