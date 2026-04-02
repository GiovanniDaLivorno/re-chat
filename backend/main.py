import logging, os
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager

from aiProviders.OllamaProvider import OllamaAsyncProvider

# Load environment variables from .env file
BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
PORT = int(os.getenv("APP_PORT", 3000))

# # Logging Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fastapi_app")

# Pydantic Models for data checking / validation
class ChatRequest(BaseModel):
    model: str
    messages: List[Dict[str, Any]]
    temperature: float = 0.7

class ChatResponse(BaseModel):
    response: Any

class ModelListResponse(BaseModel):
    models: List[str]

class ErrorResponse(BaseModel):
    error: str

# Lifespan Manager for Ollama Provider
@asynccontextmanager
async def lifespan(app: FastAPI):
    provider = OllamaAsyncProvider(base_url=BASE_URL)
    app.state.ollama = provider
    logger.info("Ollama provider initialized.")
    yield
    await provider.close()
    logger.info("Ollama provider closed.")

# -----------------------
# FastAPI App
app = FastAPI(lifespan=lifespan)
# -----------------------

# API endpoint for getting the supported models
@app.get("/api/models", response_model=ModelListResponse, responses={500: {"model": ErrorResponse}})
async def list_models():
    try:
        models = await app.state.ollama.list_models()
        return {"models": models}
    except Exception as e: # all exceptions return a 500 error response
        logger.error(f"Error fetching models: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# API endpoint for sending a chat message
@app.post("/api/chat", response_model=ChatResponse, responses={500: {"model": ErrorResponse}})
async def chat(request_data: ChatRequest):
    try:
        response = await app.state.ollama.send_chat(
            model=request_data.model,
            messages=request_data.messages,
            temperature=request_data.temperature
        )
        return {"response": response}
    except Exception as e:  # all exceptions return a 500 error response
        logger.error(f"Error in chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))