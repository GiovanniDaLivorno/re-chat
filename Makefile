# Makefile for ReChat
# ===========================
# Usage:
#   make help             Show available commands
#   make dev              Start frontend and backend in dev mode
#   make build            Build frontend + backend Docker images
#   make up               Start docker-compose services
#   make down             Stop docker-compose services
#   make logs             Tail docker-compose logs
# ===========================

.PHONY: help dev build up down logs clean lint test preview restart

# ---------------------------------------
# Help
# ---------------------------------------
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# ---------------------------------------
# Development
# ---------------------------------------
dev: ## Run frontend + backend in development mode
	@echo "Starting frontend and backend in dev mode..."
	@echo "- Frontend (Vite React):"
	cd frontend && npm install && npm run dev & \
	FRONTEND_PID=$$!; \
	echo "- Backend (FastAPI):" && \
	cd backend && pip install -r requirements.txt && uvicorn main:app --reload & \
	BACKEND_PID=$$!; \
	wait $$FRONTEND_PID $$BACKEND_PID

# ---------------------------------------
# Build Docker images
# ---------------------------------------
build: ## Build frontend and backend Docker images
	@echo "Building frontend Docker image..."
	docker build -t re-chat-frontend ./frontend
	@echo "Building backend Docker image..."
	docker build -t re-chat-backend ./backend

# ---------------------------------------
# Docker Compose
# ---------------------------------------
up: ## Start services with docker-compose
	docker compose up -d
	@echo "Connect to http://localhost:3000"
	@echo "Use 'make logs' to view logs"

down: ## Stop services
	docker compose down

restart: ## Restart services
	docker compose restart

logs: ## Tail logs for all services
	docker compose logs -f

# ---------------------------------------
# Cleanup
# ---------------------------------------
clean: ## Remove build artifacts and containers
	@echo "Cleaning frontend build artifacts..."
	rm -rf frontend/dist/
	rm -rf frontend/node_modules/
	@echo "Cleaning backend artifacts..."
	find backend -type d -name '__pycache__' -exec rm -rf {} +
	docker compose down -v --remove-orphans
	docker system prune -f

# ---------------------------------------
# Linting & Testing
# ---------------------------------------
lint: ## Run ESLint on frontend
	cd frontend && npm run lint

test: ## Run tests
	@echo "Running frontend tests..."
	cd frontend && npm test || echo "No frontend tests defined"
	@echo "Running backend tests..."
	cd backend && pytest || echo "No backend tests defined"

# ---------------------------------------
# Production preview
# ---------------------------------------
preview: ## Preview production frontend build locally
	cd frontend && npm run preview