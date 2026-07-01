from __future__ import annotations

import json
from pathlib import Path
import sys


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPO_ROOT / "backend"
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

import httpx

from app.core.config import settings
from app.services.ibm_service import GraniteService
from scripts.verify_watsonx_helpers import list_chat_models


RESOURCE_CONTROLLER_URL = "https://resource-controller.cloud.ibm.com/v2/resource_instances"


def main() -> int:
    service = GraniteService()
    print("MatchMind One IBM WML runtime diagnostic")
    print(
        json.dumps(
            {
                "project_id_present": bool(settings.ibm_watsonx_project_id),
                "api_key_present": bool(settings.ibm_watsonx_api_key),
                "url": settings.ibm_watsonx_url,
                "model_id": settings.ibm_watsonx_model_id,
                "use_mock_flag": settings.ibm_watsonx_use_mock,
                "service_is_mock": service.is_mock,
            },
            indent=2,
        )
    )

    token = service._get_iam_token()
    print(json.dumps({"iam_token_received": bool(token)}, indent=2))

    chat_models = list_chat_models(token)
    print(
        json.dumps(
            {
                "configured_model_chat_capable": settings.ibm_watsonx_model_id in chat_models,
                "chat_model_count": len(chat_models),
                "configured_model": settings.ibm_watsonx_model_id,
            },
            indent=2,
        )
    )

    runtime_instances = list_runtime_instances(token)
    wml_instances = [
        item
        for item in runtime_instances
        if item.get("crn_service") == "pm-20" or "machine" in str(item.get("name", "")).lower()
    ]
    print(json.dumps({"runtime_instance_count": len(runtime_instances), "runtime_instances": runtime_instances}, indent=2))

    strict_inference = service.verify_text_chat()
    print(json.dumps({"strict_text_chat": strict_inference}, indent=2))

    if strict_inference.get("ok"):
        print(json.dumps({"ready": True, "next_step": "Granite live text chat is ready."}, indent=2))
        return 0

    print(
        json.dumps(
            {
                "ready": False,
                "next_step": (
                    "Associate the watsonx project with a Watson Machine Learning or watsonx.ai Runtime service "
                    "instance in the same IBM region, then rerun this diagnostic."
                ),
                "project_manage_url": f"https://dataplatform.cloud.ibm.com/projects/{settings.ibm_watsonx_project_id}/manage?context=wx",
                "recommended_wml_instance": wml_instances[0] if wml_instances else None,
                "launcher": r".\scripts\open-ibm-wml-association.ps1",
            },
            indent=2,
        )
    )
    return 1


def list_runtime_instances(token: str) -> list[dict]:
    response = httpx.get(
        RESOURCE_CONTROLLER_URL,
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        timeout=settings.ibm_watsonx_timeout_seconds,
    )
    response.raise_for_status()
    resources = response.json().get("resources", [])
    candidates = []
    for item in resources:
        searchable = " ".join(
            str(item.get(key, ""))
            for key in ["name", "resource_id", "resource_plan_id", "crn", "resource_group_id", "region_id"]
        ).lower()
        if not any(marker in searchable for marker in ["watsonx", "machine-learning", "machine learning", "wml", "pm-20"]):
            continue
        candidates.append(
            {
                "name": item.get("name"),
                "guid": item.get("guid"),
                "region_id": item.get("region_id"),
                "state": item.get("state"),
                "type": item.get("type"),
                "resource_id": item.get("resource_id"),
                "resource_plan_id": item.get("resource_plan_id"),
                "crn_service": extract_crn_service(item.get("crn", "")),
            }
        )
    return candidates


def extract_crn_service(crn: str) -> str:
    parts = crn.split(":")
    return parts[4] if len(parts) > 4 else ""


if __name__ == "__main__":
    raise SystemExit(main())
