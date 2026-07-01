import json

from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["database_backend"] == "sqlite"


def test_list_matches() -> None:
    response = client.get("/api/matches")
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_get_event() -> None:
    response = client.get("/api/events/evt-penalty-62")
    assert response.status_code == 200
    assert response.json()["rule"]["prompt_template"] == "officiating_decision"


def test_get_demo_script() -> None:
    response = client.get("/api/demo-script")
    assert response.status_code == 200
    assert len(response.json()) >= 3
    assert response.json()[0]["event_id"] == "evt-offside-24"


def test_get_system_summary() -> None:
    response = client.get("/api/system/summary")
    assert response.status_code == 200
    payload = response.json()
    assert payload["database_backend"] == "sqlite"
    assert payload["event_count"] >= 1
    assert payload["rule_count"] >= 1
    assert "goal" in payload["event_types_supported"]
    assert payload["demo_step_count"] >= 3


def test_list_match_events() -> None:
    response = client.get("/api/matches/match-world-final-001/events")
    assert response.status_code == 200
    assert len(response.json()) >= 4


def test_explain_event_changes_by_profile() -> None:
    analyst = client.post("/api/explain", json={"profile": "analyst", "event_id": "evt-penalty-62"})
    child = client.post("/api/explain", json={"profile": "child", "event_id": "evt-penalty-62"})

    assert analyst.status_code == 200
    assert child.status_code == 200
    assert analyst.json()["explanation"] != child.json()["explanation"]


def test_profile_persists_in_settings() -> None:
    update = client.post(
        "/api/profile",
        json={"profile": "accessibility", "language": "en", "large_text": True, "high_contrast": True, "reduced_motion": True},
    )
    settings = client.get("/api/settings")

    assert update.status_code == 200
    assert settings.status_code == 200
    assert settings.json()["accessibility"]["large_text"] is True


def test_get_profile() -> None:
    response = client.get("/api/profile")
    assert response.status_code == 200
    assert "profile" in response.json()


def test_explain_includes_rule_context() -> None:
    response = client.post("/api/explain", json={"profile": "new_fan", "event_id": "evt-highpress-12"})
    assert response.status_code == 200
    payload = response.json()
    assert payload["why_now"]
    assert payload["retrieval_sources"]
    assert payload["evidence"]


def test_upload_video_with_sidecar_events(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(settings, "upload_dir", str(tmp_path))
    event_payload = {
        "events": [
            {
                "timestamp_seconds": 4,
                "minute": 24,
                "type": "goal_disallowed",
                "title": "Goal Disallowed For Offside",
                "team": "Crimson United",
                "opponent": "Blue City",
                "summary": "The attacker moved beyond the second-last defender before the pass.",
                "analysis": "The finish is ruled out after the timing of the attacking run is checked.",
                "child_summary": "The scorer ran too early before the pass.",
                "confidence": "high",
                "law_reference": "Law 11",
            }
        ]
    }

    response = client.post(
        "/api/videos/upload",
        files={
            "video": ("clip.mp4", b"not-a-real-video-but-valid-upload-by-extension", "video/mp4"),
            "events": ("events.json", json.dumps(event_payload), "application/json"),
        },
    )

    assert response.status_code == 200
    video = response.json()
    assert video["event_count"] == 1
    assert video["timeline_source"] == "sidecar_json"

    events = client.get(f"/api/videos/{video['id']}/events")
    assert events.status_code == 200
    uploaded_event = events.json()[0]
    assert uploaded_event["timestamp_seconds"] == 4
    assert uploaded_event["rule"]["prompt_template"] == "law_interpretation"

    explanation = client.post("/api/explain", json={"profile": "new_fan", "event_id": uploaded_event["id"]})
    assert explanation.status_code == 200
    assert explanation.json()["law_reference"] == "Law 11"


def test_analyze_video_generates_demo_timeline(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(settings, "upload_dir", str(tmp_path))
    upload = client.post(
        "/api/videos/upload",
        files={"video": ("analysis-clip.mp4", b"demo-video", "video/mp4")},
    )
    assert upload.status_code == 200

    analysis = client.post(f"/api/videos/{upload.json()['id']}/analyze", json={"duration_seconds": 60})
    assert analysis.status_code == 200
    payload = analysis.json()
    assert payload["video"]["analysis_status"] == "demo_timeline_ready"
    assert len(payload["events"]) >= 3
    assert payload["events"][0]["timestamp_seconds"] > 0
