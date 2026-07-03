from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseProvider(ABC):
    @staticmethod
    def normalize_response(data: Any) -> Dict[str, Any]:
        """Normalize provider responses into a standard assistant message."""
        if isinstance(data, dict):
            if data.get("message") and isinstance(data["message"], dict):
                return {"message": data["message"]}

            choices = data.get("choices", [])
            if isinstance(choices, list) and len(choices) > 0:
                first_choice = choices[0]
                message = first_choice.get("message") or first_choice.get("content")
                if isinstance(message, dict):
                    return {"message": message}
                if isinstance(message, str):
                    return {"message": {"role": "assistant", "content": message}}

            if data.get("content"):
                return {"message": {"role": "assistant", "content": data["content"]}}

        return {"message": {"role": "assistant", "content": str(data)}}

    @abstractmethod
    async def list_models(self) -> List[str]:
        """Return a list of available models"""
        pass

    @abstractmethod
    async def send_chat(self, model: str, messages: List[Dict[str, Any]], temperature: float) -> Dict[str, Any]:
        """Send a chat request to the provider and return the response"""
        pass

    @abstractmethod
    async def close(self):
        """Close any resources if necessary"""
        pass