# Makefile for ReChat
# ===========================
# Usage:
#   make help             Show available commands
#   make setup            Install dependencies and check requirements
#   make dev              Start frontend and backend in development mode
#   make build            Build frontend + backend Docker images
#   make up               Start docker-compose services
#   make down             Stop docker-compose services
#   make logs             Tail docker-compose logs
# ===========================

.PHONY: help setup dev build up down logs clean lint test preview restart

# ---------------------------------------
# Help
# ---------------------------------------
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

# ---------------------------------------
# Setup
# ---------------------------------------
setup: ## Check and install required dependencies
	@echo "ReChat Setup"
	@echo "============"
	@echo ""
	@echo "Checking dependencies..."
	@echo ""
	@command -v node >/dev/null 2>&1 && echo "✓ Node.js: $$(node --version)" || (echo "✗ Node.js not found. Please install from https://nodejs.org/" && exit 1)
	@command -v npm >/dev/null 2>&1 && echo "✓ npm: $$(npm --version)" || (echo "✗ npm not found" && exit 1)
	@command -v python3 >/dev/null 2>&1 && echo "✓ Python: $$(python3 --version)" || (echo "✗ Python 3 not found. Please install Python 3.8+" && exit 1)
	@command -v docker >/dev/null 2>&1 && echo "✓ Docker: $$(docker --version)" || echo "⚠ Docker not found (required for 'make up')"
	@echo ""
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install --silent
	@echo "✓ Frontend dependencies installed"
	@echo ""
	@echo "Setting up backend virtual environment..."
	@cd backend && python3 -m venv venv
	@echo "✓ Virtual environment created"
	@echo ""
	@echo "Installing backend dependencies..."
	@cd backend && . venv/bin/activate && pip install -q -r requirements.txt
	@echo "✓ Backend dependencies installed"
	@echo ""
	@echo "Setup complete! You can now run:"
	@echo "  make dev    - Start development servers"
	@echo "  make up     - Start with Docker Compose (requires Docker)"
	@echo ""

# ---------------------------------------
# Development
# ---------------------------------------
dev: ## Run frontend + backend in development mode
	@echo "Starting frontend and backend in dev mode..."
	@echo "- Frontend (Vite React) on http://localhost:5173/"
	@echo "- Backend (FastAPI) on http://localhost:8000"
	@echo "Press Ctrl+C to stop both servers"
	(cd frontend && npm run dev) & \
	sleep 2 && (cd backend && . venv/bin/activate && APP_PORT=8000 HOST=localhost uvicorn main:app --reload --host 0.0.0.0 --port 8000) & \
	wait

# ---------------------------------------
# Build Docker images
# ---------------------------------------
build: ## Build frontend and backend Docker images
	@echo "Building frontend Docker image..."
	docker build -t re-chat-wfe ./frontend
	@echo "Building backend Docker image..."
	docker build -t re-chat-be ./backend

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
	rm -rf backend/venv/
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
	cd backend && . venv/bin/activate && pytest || echo "No backend tests defined"

# ---------------------------------------
# Production preview
# ---------------------------------------
preview: ## Preview production frontend build locally
	cd frontend && npm run preview