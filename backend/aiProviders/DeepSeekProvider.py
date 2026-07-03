import httpx
from typing import List, Dict, Any
from .BaseProvider import BaseProvider

class DeepSeekAsyncProvider(BaseProvider):
    """DeepSeek API provider for chat completions"""
    
    def __init__(self, api_key: str = None, timeout: float = 30.0):
        self.api_key = api_key 
        if not self.api_key:
            raise ValueError("DEEPSEEK_API_KEY is not set")
        
        self.base_url = "https://api.deepseek.com"
        self.client = httpx.AsyncClient(timeout=timeout)
        self.default_models = [ "deepseek-chat", "deepseek-coder"]

    async def list_models(self) -> List[str]:
        """Return a list of available DeepSeek models"""
        try:
            # DeepSeek doesn't have a dedicated models list endpoint
            # So we return a hardcoded list of known models
            return self.default_models
        except Exception as e:
            raise Exception(f"Failed to fetch models: {e}")

    async def send_chat(self, model: str, messages: List[Dict[str, Any]], temperature: float = 0.7) -> Dict[str, Any]:
        """Send a chat request to DeepSeek API and return the response"""
        url = f"{self.base_url}/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "stream": False
        }
        
        try:
            res = await self.client.post(url, json=payload, headers=headers)
            res.raise_for_status()
            data = res.json()
            return self.normalize_response(data)
        except httpx.HTTPError as e:
            raise Exception(f"DeepSeek API error: {e}")

    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
