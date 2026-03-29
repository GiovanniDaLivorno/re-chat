# Backend

Backend is here introduced to Stores API keys safely

## Development
- create a virtual environment ```python3 -m venv venv```
- activate it ```source venv/bin/activate```
- run the backend: ```uvicorn main:app --reload --port 3000``

## Production
- create docker image ```docker build -t re-chat-backend .```
- run it ```docker run -p 3000:3000 --env-file .env re-chat-backend```