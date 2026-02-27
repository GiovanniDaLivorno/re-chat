# quick start

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

## build production distribution

### frontend app dist
npm run build 
docker build -t rechat .


## run production version
```
docker compose up
```
or 
```
docker run --rm -p 3000:80 rechat
```

