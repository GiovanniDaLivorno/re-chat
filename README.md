# re-chat

Simple frontend to LLM for learning. Built using npm, Vite, React, Nginx, Docker, Ollama.

## Development

0. **Prerequisites**
- Node.js 20+
- Docker & Docker Compose
- Make (only if you plan to use make commands)

1. **Install dependencies**
   ```bash
   npm install
   ```
   run `npm audit fix` if there are critical vulnerabilities

2. **Start development server**
   ```bash
   npm run dev
   ```
   connect to ```http://localhost:5173/```

3. **configure an AI provider**

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

### Manual build
```bash
# Build app
npm run build

# Build Docker image
docker build -t rechat .

### aubuild


# Run the application
docker run --rm -p 3000:80 rechat
# or
make docker-start
```

### Docker Compose build
```bash
docker-compose up --build
# or
make up
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
