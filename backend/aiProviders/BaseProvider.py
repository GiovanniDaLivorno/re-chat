from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseProvider(ABC):
    @abstractmethod
    async def list_models(self) -> List[str]:
        """Return a list of available models"""
        pass

    @abstractmethod
    async def send_chat(self, model: str, messages: List[Dict[str, Any]], temperature: float) -> Dict[str, Any]:
        """Send a chat request to the provider and return the response"""
        pass