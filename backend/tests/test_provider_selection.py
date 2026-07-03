import os
import sys
import unittest
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("AI_PROVIDER", "ollama")

from fastapi.testclient import TestClient
import main


class ProviderSelectionTests(unittest.TestCase):
    def test_select_provider_endpoint_returns_selected_provider(self):
        with TestClient(main.app) as client:
            response = client.post("/api/provider", json={"provider": "ollama"})

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["provider"], "ollama")

    def test_favicon_endpoint_does_not_return_not_found(self):
        with TestClient(main.app) as client:
            response = client.get("/favicon.ico")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["content-type"], "image/x-icon")


if __name__ == "__main__":
    unittest.main()
