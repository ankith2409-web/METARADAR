import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app, startup_db_and_seed  # noqa: E402
from app.database import init_db  # noqa: E402


class TestMetaRadarAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        startup_db_and_seed()
        cls.client = TestClient(app)

    def test_health(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "healthy")

    def test_get_signals(self):
        res = self.client.get("/api/signals")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("total", data)
        self.assertIn("signals", data)
        self.assertGreater(len(data["signals"]), 0)

    def test_get_signal_trace(self):
        signals_res = self.client.get("/api/signals")
        first_id = signals_res.json()["signals"][0]["id"]

        trace_res = self.client.get(f"/api/signals/{first_id}/trace")
        self.assertEqual(trace_res.status_code, 200)
        trace_data = trace_res.json()
        self.assertIn("scout_output", trace_data)
        self.assertIn("analyst_output", trace_data)
        self.assertIn("strategist_output", trace_data)

    def test_get_threads(self):
        res = self.client.get("/api/threads")
        self.assertEqual(res.status_code, 200)
        threads = res.json()
        self.assertIsInstance(threads, list)
        self.assertGreater(len(threads), 0)

    def test_get_inflections(self):
        res = self.client.get("/api/inflections")
        self.assertEqual(res.status_code, 200)
        events = res.json()
        self.assertIsInstance(events, list)
        self.assertGreater(len(events), 0)

    def test_get_battle_cards(self):
        res = self.client.get("/api/battle-cards")
        self.assertEqual(res.status_code, 200)
        cards = res.json()
        self.assertIsInstance(cards, list)
        self.assertGreater(len(cards), 0)

    def test_get_validation_report(self):
        res = self.client.get("/api/validation-report")
        self.assertEqual(res.status_code, 200)
        report = res.json()
        self.assertIn("lead_time_days", report)
        self.assertEqual(report["lead_time_days"], 24)

    def test_trigger_ingestion(self):
        res = self.client.post("/api/ingest/trigger?source=all")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("added_signals", data)


if __name__ == "__main__":
    unittest.main()
