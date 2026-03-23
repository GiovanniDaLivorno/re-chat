# Makefile for ReChat

.PHONY: help build up down logs clean dev prod

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# Development
dev: ## Start development server with hot reload
	npm run dev

# Production build
build: ## Build the application for production
	npm run build

# Docker commands
docker-build: ## Build Docker image
	docker build -t rechat .

docker-run: ## Run Docker container locally
	docker run -p 3000:80 --name rechat-container rechat

docker-stop: ## Stop and remove Docker container
	docker stop rechat-container || true
	docker rm rechat-container || true

# Docker Compose commands
up: ## Start services with docker-compose
	docker compose up -d
	@echo "connect to http://localhost:3000 to access re-chat."
	@echo "starting... Use 'make logs' to view logs."

down: ## Stop services with docker-compose
	docker compose down

logs: ## Show logs from docker-compose services
	docker compose logs -f

restart: ## Restart services
	docker compose restart

# Cleanup
clean: ## Remove build artifacts and containers
	rm -rf dist/
	rm -rf node_modules/
	docker compose down -v --remove-orphans
	docker system prune -f

# Full production build and deploy
prod: build docker-build ## Build app and Docker image for production

# Lint and test
lint: ## Run ESLint
	npm run lint

test: ## Run tests (if any)
	npm test || echo "No tests defined"

# Install dependencies
install: ## Install npm dependencies
	npm install

# Preview production build
preview: ## Preview production build locally
	npm run preview