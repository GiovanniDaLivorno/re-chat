import httpx
from typing import List, Dict, Any
from .BaseProvider import BaseProvider

class OllamaAsyncProvider(BaseProvider):
    def __init__(self, base_url: str = "http://localhost:11434", timeout: float = 10.0):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=timeout)

    # Returns a list of available models from Ollama
    # some Ollama versions use /api/tags instead of /api/models
    async def list_models(self) -> List[str]:
        url = f"{self.base_url}/api/tags"
        try:
            res = await self.client.get(url)
            res.raise_for_status()
            data = res.json()
            return [m["name"] for m in data.get("models", [])]
        except httpx.HTTPError as e:
            raise Exception(f"Failed to fetch models: {e}")

    # Sends a chat request to Ollama and returns the response
    async def send_chat(self, model: str, messages: List[Dict[str, Any]], temperature: float = 0.7) -> Dict[str, Any]:
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature}
        }
        try:
            res = await self.client.post(url, json=payload, headers={"Content-Type": "application/json"})
            res.raise_for_status()
            return res.json()
        except httpx.HTTPError as e:
            raise Exception(f"Ollama error: {e}")

    async def close(self):
        await self.client.aclose()

