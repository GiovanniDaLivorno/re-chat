# re-chat

Simple application for connecting to LLM providers, built for  learning. 
Built using npm, Vite, React, Nginx, Docker, Ollama.

## TODO list
- improve backend to manage multiple AI providers at same time
- frontend: add clear chat button in the main window
- test with DeepSeek

1. **configure an AI provider**

   **local Ollama**
   ```bash
   docker run -d -v ollama:/root/.ollama -p 11434:11434 --name molly ollama/ollama
   # then load a model
   docker exec -it molly ollama pull llama3:8b
   # if you have limited resources on
   # your docker host, use small LLM, e.g.
   docker exec -it molly ollama pull qwen2.5-coder:0.5b
   ```
   **or your favorite AI provider**
   ```
   lore ipsum
   ```

## Production

- create the frontend and backend containers as per instructions in their folders

- start them and stich together

 ```bash
  # create a network for the containers
  docker network create nai

  # statrt the backend
  docker run -d --name rc-be --network nai -p 1000:1000 re-chat-be

  # start the rontend (Nginx)
  docker run -d --name rc-wfe --network nai -p 3000:80 re-chat-wfe

  # connect already running LLM container (molly) to same network
  docker network connect nai molly
```


## Automation & CI/CD

This project includes a CI/CD pipelines for production artifact creation and Docker container builds.
Note that I have limited the pipeline to manual trigger only. add Push to main/master branches for full automation.

### GitHub Actions Workflow

The `.github/workflows/ci-cd.yml` provides:

- **Lint & Test**: Runs ESLint and builds the app on every push/PR
- **Docker Build & Push**: Builds multi-platform Docker images and pushes to registry
- **Deployment**: Placeholder for production deployment

### Required Secrets

If you want to publish on Docker Hub, add these to your GitHub repository secrets:
- `DOCKERHUB_USERNAME`: Your Docker Hub username
- `DOCKERHUB_TOKEN`: Your Docker Hub access token


### CI/CD Flow

1. **Push to main/master**: Triggers full pipeline
2. **Lint & Build**: Validates code and creates production build
3. **Docker Build**: Creates optimized multi-platform images
4. **Push to Registry**: Publishes images with semantic tags
5. **Deploy**: Custom deployment steps (configure as needed)

## Architecture

- **Frontend**: React + Vite (ES modules, fast HMR)
- **Production**: Nginx serving static assets
- **Container**: Multi-stage Docker build for optimized images
- **LLM**: Ollama API integration for local AI models

## Useful commands

Use `make` command from project root
