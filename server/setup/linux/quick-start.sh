#!/bin/bash

# Quick Start Script for Backend Services
# This script helps you get up and running quickly with all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. Some features may not work."
    fi
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm is not installed. Using npm instead."
    fi
    
    print_success "Prerequisites check completed!"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p ../data/db/backup
    mkdir -p ../data/uploads
    
    print_success "Directories created!"
}

# Build the application
build_application() {
    print_status "Building dashboard-service..."
    
    if command -v pnpm &> /dev/null; then
        pnpm install
        npx nx build dashboard-service
    else
        npm install
        npx nx build dashboard-service
    fi
    
    print_success "Build completed!"
}

# Start services
start_services() {
    print_status "Starting all services..."
    
    docker-compose up -d --build
    
    print_success "Services started successfully!"
    echo ""
    print_status "Services are now running:"
    echo "  - Ollama (AI/LLM): http://localhost:11434"
    echo "  - Admin App: http://localhost:3000"
    echo "  - Dashboard Service: http://localhost:5001"
    echo "  - Auth Service: http://localhost:5002"
    echo "  - Marketing Service: http://localhost:5003"
    echo ""
    print_status "Use 'docker-compose logs -f' to view logs"
    print_status "Use 'docker-compose down' to stop all services"
}

# Main function
main() {
    echo "🚀 Backend Services Quick Start"
    echo "============================"
    echo ""
    
    check_prerequisites
    create_directories
    build_application
    start_services
    
    echo ""
    print_success "🎉 Backend Services are now running!"
    echo ""
    print_status "Next steps:"
    echo "  1. Open http://localhost:3000 to access the admin interface"
    echo "  2. Check http://localhost:11434 for Ollama status"
    echo "  3. Monitor logs with: docker-compose logs -f"
    echo "  4. Stop services with: docker-compose down"
}

# Run main function
main "$@" 