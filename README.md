# re-chat

simple frontend to LLM for learning.
built using npm, vite, react, nginx, docker, ollama

## run development version

- start web frontend
```
npm run dev
```

- start ollama
```
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name molly ollama/ollama
```
- load ollama model
```
docker exec -it molly ollama pull llama3:8b
```

## build for production

### frontend app
```
npm run build 
docker build -t rechat .
```

## run production version

if already have ollama running
```
docker run --rm -p 3000:80 rechat
```
otherwise (suggested) use 
```
docker compose up
```

