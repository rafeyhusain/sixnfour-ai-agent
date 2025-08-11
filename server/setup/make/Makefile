# Makefile for Services Docker Operations

.PHONY: help build dev prod dashboard-only admin-only ollama-only stop status logs clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make build          - Build the dashboard-service"
	@echo "  make dev            - Start development environment"
	@echo "  make prod           - Start production environment"
	@echo "  make dashboard-only - Start only dashboard-service"
	@echo "  make admin-only     - Start only admin-app (Next.js/Shadcn)"
	@echo "  make ollama-only    - Start only Ollama service"
	@echo "  make stop           - Stop all services"
	@echo "  make status         - Show service status"
	@echo "  make logs           - Show logs for all services"
	@echo "  make clean          - Clean up Docker resources"
	@echo ""
	@echo "Services:"
	@echo "  - Ollama (AI/LLM): http://localhost:11434"
	@echo "  - Admin App: http://localhost:3000"
	@echo "  - Dashboard Service: http://localhost:5001"
	@echo "  - Auth Service: http://localhost:5002"
	@echo "  - Marketing Service: http://localhost:5003"

# Build the application
build:
	@echo "Building dashboard-service..."
	npx nx build dashboard-service
	@echo "Build completed successfully!"

# Start development environment
dev: build
	@echo "Starting development environment..."
	docker-compose -f setup/docker/docker-compose.yml -f setup/docker/docker-compose.dev.yml up --build

# Start production environment
prod: build
	@echo "Starting production environment..."
	docker-compose -f setup/docker/docker-compose.yml -f setup/docker/docker-compose.prod.yml up -d --build
	@echo "Production services started in detached mode!"
	@echo "Use 'make logs' to view logs"

# Start only dashboard service
dashboard-only: build
	@echo "Starting dashboard-service only..."
	docker-compose -f setup/docker/docker-compose.dashboard-service.yml up --build

# Start only admin app
admin-only:
	@echo "Starting admin-app only..."
	docker-compose -f setup/docker/docker-compose.yml up --build admin-app

# Start only ollama
ollama-only:
	@echo "Starting Ollama only..."
	docker-compose -f setup/docker/docker-compose.yml up --build ollama

# Stop all services
stop:
	@echo "Stopping all services..."
	docker-compose -f setup/docker/docker-compose.yml down
	@echo "All services stopped!"

# Show service status
status:
	@echo "Service status:"
	docker-compose -f setup/docker/docker-compose.yml ps

# Show logs for all services
logs:
	@echo "Showing logs for all services:"
	docker-compose -f setup/docker/docker-compose.yml logs -f

# Clean up Docker resources
clean:
	@echo "Cleaning up Docker resources..."
	docker-compose -f setup/docker/docker-compose.yml down -v --remove-orphans
	docker system prune -f
	@echo "Cleanup completed!"

# Build Docker image only
docker-build:
	@echo "Building Docker image..."
	npx nx docker-build dashboard-service

# Run container directly
docker-run:
	@echo "Running dashboard-service container..."
	docker run -p 5001:5001 -t dashboard-service

# Show Docker images
images:
	@echo "Docker images:"
	docker images | grep -E "(dashboard-service|auth-service|marketing-service|admin-app|ollama)"

# Show running containers
containers:
	@echo "Running containers:"
	docker ps | grep -E "(dashboard-service|auth-service|marketing-service|admin-app|ollama)" 