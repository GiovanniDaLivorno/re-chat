import logging
import os
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from aiProviders.OllamaProvider import OllamaAsyncProvider
from aiProviders.DeepSeekProvider import DeepSeekAsyncProvider

# Load environment variables from .env file
load_dotenv()
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
AI_PROVIDER = os.getenv("AI_PROVIDER", "ollama").lower()
PORT = int(os.getenv("APP_PORT", 3000))
HOST = os.getenv("HOST", "0.0.0.0")

# # Logging Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fastapi_app")

# Pydantic Models for data checking / validation
class ChatRequest(BaseModel):
    model: str
    messages: List[Dict[str, Any]]
    temperature: float = 0.7

class ModelListResponse(BaseModel):
    models: List[str]

class ErrorResponse(BaseModel):
    error: str

# Lifespan Manager for AI Providers
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the selected provider
    if AI_PROVIDER == "deepseek":
        try:
            provider = DeepSeekAsyncProvider()
            app.state.provider = provider
            logger.info("DeepSeek provider initialized.")
        except ValueError as e:
            logger.error(f"Failed to initialize DeepSeek provider: {e}")
            raise
    else:  # Default to Ollama
        provider = OllamaAsyncProvider(base_url=OLLAMA_BASE_URL)
        app.state.provider = provider
        logger.info("Ollama provider initialized.")
    
    yield
    
    await provider.close()
    logger.info(f"{AI_PROVIDER.capitalize()} provider closed.")

# -----------------------
# FastAPI App
app = FastAPI(lifespan=lifespan)
# -----------------------

# API endpoint for getting the supported models
@app.get("/api/models", response_model=ModelListResponse, responses={500: {"model": ErrorResponse}})
async def list_models():
    try:
        models = await app.state.provider.list_models()
        return {"models": models}
    except Exception as e: # all exceptions return a 500 error response
        logger.error(f"Error fetching models: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# API endpoint for sending a chat message
@app.post("/api/chat", responses={500: {"model": ErrorResponse}})
async def chat(request_data: ChatRequest):
    try:
        response = await app.state.provider.send_chat(
            model=request_data.model,
            messages=request_data.messages,
            temperature=request_data.temperature
        )
        return response
    except Exception as e:  # all exceptions return a 500 error response
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        log_level="info",
        workers=1,
    )