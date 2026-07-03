# Backend

A ligth backend has been added to this project to
- avoid storaging API keys in the frontend
- abstracting AI provider API

remember to set your environment vars, e.g. in ```secret.env``` file
```bash
# export AI_PROVIDER=Ollama
export AI_PROVIDER=DeepSeek

# DeepSeek access key
export DEEPSEEK_API_KEY=your_api_key
```

## Development

0. **Prerequisites**
- Python3
- Docker & Docker Compose

1. **setup environment**
- create a python virtual environment ```python3 -m venv venv```
- activate it ```source venv/bin/activate```

2. **Start the backend server**
  ```bash
  uvicorn main:app --reload --port 8000
  ```

## Production
- build docker image
  ```bash
  docker build -t re-chat-be .
  ```

- run it
  ```bash
  docker run -p 8000:7000 --env-file secret..env --name be re-chat-be
  ```