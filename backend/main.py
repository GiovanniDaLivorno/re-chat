import os
import requests
from fastapi import FastAPI, Request
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

API_KEY = os.getenv("DEEPSEEK_API_KEY")
BASE_URL = "https://api.deepseek.com/v1"

# Returns available DeepSeek models
@app.get("/api/models")
async def list_models():
    response = requests.get(
        f"{BASE_URL}/models",
        headers={
            "Authorization": f"Bearer {API_KEY}"
        }
    )
    return response.json()

# requests from the frontend are forwarded to DeepSeek API, adding the API key.
# The response from DeepSeek is then returned to the frontend.
@app.post("/api/chat")
async def chat(request: Request):
    
    body = await request.json()

    response = requests.post(
        f"{BASE_URL}/chat/completions",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        json=body,
    )

    return response.json()