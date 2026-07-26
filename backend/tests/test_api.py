import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c



def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_get_signals(client):
    res = client.get("/api/signals")
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "signals" in data
    assert len(data["signals"]) > 0


def test_get_signal_trace(client):
    signals_res = client.get("/api/signals")
    first_id = signals_res.json()["signals"][0]["id"]

    trace_res = client.get(f"/api/signals/{first_id}/trace")
    assert trace_res.status_code == 200
    trace_data = trace_res.json()
    assert "scout_output" in trace_data
    assert "analyst_output" in trace_data
    assert "strategist_output" in trace_data


def test_get_threads(client):
    res = client.get("/api/threads")
    assert res.status_code == 200
    threads = res.json()
    assert isinstance(threads, list)
    assert len(threads) > 0


def test_get_inflections(client):
    res = client.get("/api/inflections")
    assert res.status_code == 200
    events = res.json()
    assert isinstance(events, list)
    assert len(events) > 0


def test_get_battle_cards(client):
    res = client.get("/api/battle-cards")
    assert res.status_code == 200
    cards = res.json()
    assert isinstance(cards, list)
    assert len(cards) > 0


def test_get_validation_report(client):
    res = client.get("/api/validation-report")
    assert res.status_code == 200
    report = res.json()
    assert "lead_time_days" in report
    assert report["lead_time_days"] == 24


def test_trigger_ingestion(client):
    res = client.post("/api/ingest/trigger?source=all")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "added_signals" in data


