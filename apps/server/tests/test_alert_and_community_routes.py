"""Tests for alert and community/pulsenet routes."""

from fastapi.testclient import TestClient

from server.services.alert_service import alert_service


def test_alert_list_and_resolve_flow(test_app: TestClient) -> None:
    """Seed an individual alert and exercise the alert API."""
    client = test_app

    # Seed an alert directly via the service
    # High score ensures critical severity.
    alert_service._alerts.clear()
    alert_service._active_alerts.clear()

    # Create one alert for a demo device
    import asyncio

    asyncio.run(alert_service._create_individual_alert("dev-1", "zone-1", 0.9))

    list_resp = client.get("/api/alerts")
    assert list_resp.status_code == 200
    alerts = list_resp.json()["alerts"]
    assert len(alerts) >= 1
    alert_id = alerts[0]["id"]

    # Active alerts endpoint should show the same alert
    active_resp = client.get("/api/alerts/active")
    assert active_resp.status_code == 200
    active_alerts = active_resp.json()["alerts"]
    assert any(a["id"] == alert_id for a in active_alerts)

    # Resolve the alert via API
    resolve_resp = client.post(
        f"/api/alerts/{alert_id}/resolve",
        json={"acknowledged_by": "test-suite"},
    )
    assert resolve_resp.status_code == 200

    # After resolving, active-only feed should either be empty or mark it inactive
    post_active = client.get("/api/alerts/active")
    assert post_active.status_code == 200
    for a in post_active.json()["alerts"]:
        if a["id"] == alert_id:
            assert not a["is_active"]


def test_pulsenet_status_and_training_history(test_app: TestClient) -> None:
    """PulseNet status and training history endpoints should respond."""
    client = test_app

    status_resp = client.get("/api/pulsenet/status")
    assert status_resp.status_code == 200
    status = status_resp.json()
    assert "loaded" in status

    history_resp = client.get("/api/pulsenet/training-history")
    assert history_resp.status_code == 200
    history = history_resp.json()
    assert "available" in history


def test_community_summary_and_pulse(test_app: TestClient) -> None:
    """Community summary and pulse endpoints should return well-formed payloads."""
    client = test_app

    summary_resp = client.get("/api/community/summary")
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert "overall_status" in summary
    assert "zones" in summary

    pulse_resp = client.get("/api/community/pulse")
    assert pulse_resp.status_code == 200
    pulse = pulse_resp.json()
    assert "zones" in pulse
    assert "total_devices" in pulse

