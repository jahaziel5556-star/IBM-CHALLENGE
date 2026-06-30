from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_matches() -> None:
    response = client.get("/api/matches")
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_get_event() -> None:
    response = client.get("/api/events/evt-penalty-62")
    assert response.status_code == 200
    assert response.json()["rule"]["prompt_template"] == "officiating_decision"


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
