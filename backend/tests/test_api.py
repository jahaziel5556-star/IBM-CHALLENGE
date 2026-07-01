import json
import time
from pathlib import Path

import cv2
import numpy as np
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app

client = TestClient(app)


def _make_test_mp4(path: Path) -> bytes:
    width, height = 320, 180
    writer = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"mp4v"), 8, (width, height))
    for index in range(96):
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        frame[:, :] = (38, 118, 42)
        cv2.line(frame, (width // 2, 0), (width // 2, height), (245, 245, 245), 2)
        cv2.rectangle(frame, (12, 46), (70, 134), (245, 245, 245), 2)
        cv2.rectangle(frame, (250, 46), (308, 134), (245, 245, 245), 2)
        ball_x = 20 + ((index * 7) % (width - 40))
        ball_y = 76 + int(np.sin(index / 5) * 26)
        cv2.circle(frame, (ball_x, ball_y), 5, (245, 245, 245), -1)
        if 40 <= index < 48:
            frame[:, :] = (42, 42, 42)
            cv2.putText(frame, "REPLAY", (96, 96), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (245, 245, 245), 2)
        writer.write(frame)
    writer.release()
    return path.read_bytes()


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
    assert payload["decision"]["should_speak"] is True
    assert payload["decision"]["priority_label"] in {"medium", "high", "critical"}
    assert payload["overlay"]["duration_seconds"] <= 10


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
    video_bytes = _make_test_mp4(tmp_path / "analysis-clip.mp4")
    upload = client.post(
        "/api/videos/upload",
        files={"video": ("analysis-clip.mp4", video_bytes, "video/mp4")},
    )
    assert upload.status_code == 200

    analysis = client.post(f"/api/videos/{upload.json()['id']}/analyze", json={"duration_seconds": 60})
    assert analysis.status_code == 200
    payload = analysis.json()
    assert payload["video"]["analysis_status"] == "cv_analysis_ready"
    assert payload["video"]["timeline_source"] in {"local_cv", "granite_cv"}
    assert payload["video"]["analysis_observation_count"] >= 3
    assert len(payload["events"]) >= 3
    assert payload["events"][0]["timestamp_seconds"] > 0
    assert payload["events"][0]["analysis_source"] in {"local_cv", "granite_cv"}


def test_progressive_analysis_status_updates(tmp_path, monkeypatch) -> None:
    monkeypatch.setattr(settings, "upload_dir", str(tmp_path))
    video_bytes = _make_test_mp4(tmp_path / "realtime-clip.mp4")
    upload = client.post(
        "/api/videos/upload",
        files={"video": ("realtime-clip.mp4", video_bytes, "video/mp4")},
    )
    assert upload.status_code == 200

    started = client.post(f"/api/videos/{upload.json()['id']}/analysis/start", json={})
    assert started.status_code == 200
    started_payload = started.json()
    assert started_payload["video"]["analysis_status"] == "analyzing"

    completed_payload = started_payload
    for _ in range(30):
        status = client.get(f"/api/videos/{upload.json()['id']}/analysis")
        assert status.status_code == 200
        completed_payload = status.json()
        if completed_payload["is_complete"]:
            break
        time.sleep(0.1)

    assert completed_payload["is_complete"] is True
    assert completed_payload["video"]["analysis_progress"] == 100
    assert completed_payload["video"]["analysis_phase"] == "complete"
    assert completed_payload["video"]["event_count"] >= 1
    assert len(completed_payload["events"]) >= 1
