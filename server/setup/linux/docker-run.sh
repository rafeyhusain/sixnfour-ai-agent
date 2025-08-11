#!/bin/bash

# Docker run script for Backend Services
# Usage: ./scripts/docker-run.sh [dev|prod|dashboard-only|admin-only|ollama-only]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to build the application
build_app() {
    print_status "Building dashboard-service..."
    npx nx build dashboard-service
    print_success "Build completed successfully!"
}

# Function to run development environment
run_dev() {
    print_status "Starting development environment..."
    docker-compose -f ../../setup/docker/docker-compose.yml -f ../../setup/docker/docker-compose.dev.yml up --build
}

# Function to run production environment
run_prod() {
    print_status "Starting production environment..."
    docker-compose -f ../../setup/docker/docker-compose.yml -f ../../setup/docker/docker-compose.prod.yml up -d --build
    print_success "Production services started in detached mode!"
    print_status "Use 'docker-compose logs -f' to view logs"
}

# Function to run only dashboard service
run_dashboard_only() {
    print_status "Starting dashboard-service only..."
    docker-compose -f ../../setup/docker/docker-compose.dashboard-service.yml up --build
}

# Function to run only admin app
run_admin_only() {
    print_status "Starting admin-app only..."
    docker-compose -f ../../setup/docker/docker-compose.yml up --build admin-app
}

# Function to run only ollama
run_ollama_only() {
    print_status "Starting Ollama only..."
    docker-compose -f ../../setup/docker/docker-compose.yml up --build ollama
}

# Function to stop all services
stop_services() {
    print_status "Stopping all services..."
    docker-compose -f ../../setup/docker/docker-compose.yml down
    print_success "All services stopped!"
}

# Function to show status
show_status() {
    print_status "Service status:"
    docker-compose -f ../../setup/docker/docker-compose.yml ps
}

# Function to show logs
show_logs() {
    print_status "Showing logs for all services:"
    docker-compose -f ../../setup/docker/docker-compose.yml logs -f
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev              Start development environment with hot reload"
    echo "  prod             Start production environment in detached mode"
    echo "  dashboard-only   Start only dashboard-service"
    echo "  admin-only       Start only admin-app (Next.js/Shadcn)"
    echo "  ollama-only      Start only Ollama service"
    echo "  stop             Stop all services"
    echo "  status           Show service status"
    echo "  logs             Show logs for all services"
    echo "  build            Build the application"
    echo "  help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev           # Start development environment"
    echo "  $0 prod          # Start production environment"
    echo "  $0 stop          # Stop all services"
    echo ""
    echo "Services:"
    echo "  - Ollama (AI/LLM): http://localhost:11434"
    echo "  - Admin App: http://localhost:3000"
    echo "  - Dashboard Service: http://localhost:5001"
    echo "  - Auth Service: http://localhost:5002"
    echo "  - Marketing Service: http://localhost:5003"
}

# Main script logic
main() {
    # Check if Docker is running
    check_docker

    case "${1:-help}" in
        "dev")
            build_app
            run_dev
            ;;
        "prod")
            build_app
            run_prod
            ;;
        "dashboard-only")
            build_app
            run_dashboard_only
            ;;
        "admin-only")
            run_admin_only
            ;;
        "ollama-only")
            run_ollama_only
            ;;
        "stop")
            stop_services
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs
            ;;
        "build")
            build_app
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function with all arguments
main "$@" 