# Backend

A ligth backend has been added to this project to
- avoid storaging API keys in the frontend
- abstracting AI provider API

remember to adapt .env to your environment values

## Development

0. **Prerequisites**
- Python3
- Docker & Docker Compose

1. **setup environment**
- create a python virtual environment ```python3 -m venv venv```
- activate it ```source venv/bin/activate```

2. **Start the backend server**
  ```bash
  uvicorn main:app --reload --port 1000
  ```

## Production
- build docker image
  ```bash
  docker build -t re-chat-be .
  ```

- run it
  ```
  docker run -p 1000:1000 --env-file .env --name rc-be re-chat-be
  ```