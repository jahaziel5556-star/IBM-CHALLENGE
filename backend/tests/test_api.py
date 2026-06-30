from fastapi.testclient import TestClient

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
