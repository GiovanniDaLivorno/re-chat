import logging
import os
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from contextlib import asynccontextmanager
from dotenv import load_dotenv

from aiProviders.OllamaProvider import OllamaAsyncProvider
from aiProviders.DeepSeekProvider import DeepSeekAsyncProvider

SUPPORTED_PROVIDERS = {"ollama", "deepseek"} # supported AI providers 

load_dotenv()   # Load environment variables from .env file
AI_PROVIDER = os.getenv("AI_PROVIDER", "ollama").lower() # Default local Ollama if no provider is set 

# # Logging Configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fastapi_app")

# Pydantic Models for data checking / validation
class ChatRequest(BaseModel):
    model: str
    messages: List[Dict[str, Any]]
    temperature: float = 0.7

class ProviderSelectionRequest(BaseModel):
    provider: str

class ProviderSelectionResponse(BaseModel):
    provider: str

class ModelListResponse(BaseModel):
    models: List[str]

class ErrorResponse(BaseModel):
    error: str


def create_provider(provider_name: str):
    normalized_name = provider_name.lower().strip()
    if normalized_name == "deepseek":
        try:
            return DeepSeekAsyncProvider(os.getenv("DEEPSEEK_API_KEY", None))
        except ValueError as e:
            raise ValueError(f"Failed to initialize DeepSeek provider: {e}") from e

    if normalized_name == "ollama":
        return OllamaAsyncProvider()

    raise ValueError(f"Unsupported provider: {provider_name}")


async def initialize_provider(app: FastAPI, provider_name: str):
    provider = create_provider(provider_name)
    app.state.provider = provider
    app.state.provider_name = provider_name.lower().strip()
    logger.info(f"{app.state.provider_name.capitalize()} provider initialized.")
    return provider


# Lifespan Manager for AI Providers
@asynccontextmanager
async def lifespan(app: FastAPI):
    if AI_PROVIDER not in SUPPORTED_PROVIDERS:
        logger.error(f"Unsupported provider configured: {AI_PROVIDER}")
        raise RuntimeError(f"Unsupported provider configured: {AI_PROVIDER}")

    provider = await initialize_provider(app, AI_PROVIDER)

    yield

    await provider.close()
    logger.info(f"{app.state.provider_name.capitalize()} provider closed.")

# -----------------------
# FastAPI App
app = FastAPI(lifespan=lifespan)
# -----------------------

# API endpoint (requested only by browsers) for preventing 404 errors 
@app.get("/favicon.ico", include_in_schema=False)
async def favicon() -> Response:
    return Response(content=b"", media_type="image/x-icon")

# API endpoint for getting the current provider
@app.get("/api/provider", response_model=ProviderSelectionResponse)
async def get_provider():
    provider_name = getattr(app.state, "provider_name", AI_PROVIDER)
    return {"provider": provider_name}


# API endpoint for selecting a provider
@app.post("/api/provider", response_model=ProviderSelectionResponse, responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}})
async def select_provider(request_data: ProviderSelectionRequest):
    try:
        requested_provider = request_data.provider.lower().strip()
        if requested_provider not in SUPPORTED_PROVIDERS:
            raise HTTPException(status_code=400, detail=f"Unsupported provider: {request_data.provider}")

        current_provider = getattr(app.state, "provider", None) # Get the current provider if it exists
        if current_provider is not None:
            await current_provider.close()

        await initialize_provider(app, requested_provider)
        return {"provider": app.state.provider_name}
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Error switching provider: {e}")
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.error(f"Error switching provider: {e}")
        raise HTTPException(status_code=500, detail=str(e)) from e


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


###############################################################################
###############################################################################
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("APP_PORT", 3000))

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        log_level="info",
        workers=1,
    )
