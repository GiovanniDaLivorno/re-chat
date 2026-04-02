# Backend

Backend has been added to this project because
- avoid storagng API keys in the frontend
- abstracting AI provider API

adapt .env to your environment values

## Development
- create a virtual environment ```python3 -m venv venv```
- activate it ```source venv/bin/activate```
- run the backend: ```uvicorn main:app --reload --port 1000``

## Production
- create docker image ```docker build -t re-chat-backend .```
- run it ```docker run -p 1000:1000 --env-file .env re-chat-be```