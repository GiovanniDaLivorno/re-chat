# Makefile for ReChat

.PHONY: help build up down logs clean dev prod

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# Development
dev: ## Start development server with hot reload
	npm run dev

prod-build: ## Build production application and docker image
	npm install
	npm run build
	docker build -t re-chat .

docker-start: ## start Docker container locally
	docker run -p 3000:80 --rm --name re-chat re-chat

docker-stop: ## Stop and remove Docker container
	docker stop re-chat || true
	docker rm re-chat || true

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

# Full production build
prod: install build ## Build app and Docker image for production

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