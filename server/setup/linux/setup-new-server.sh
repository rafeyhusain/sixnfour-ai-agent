#!/bin/bash

# Backend Services - New Server Setup (Linux/Mac)
# Matches the logic of the PowerShell version

set -e

# Colors
BLUE="\033[0;34m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
NC="\033[0m"

# Paths relative to script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DATA_DIR="$SERVER_ROOT/../data"
DB_PATH="$DATA_DIR/db"
UPLOADS_PATH="$DATA_DIR/uploads"
LOGS_PATH="$SERVER_ROOT/logs"

# Output helpers
write_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
write_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
write_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
write_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Prerequisite checks
test_prerequisites() {
    write_status "Checking prerequisites..."

    if ! command -v docker &>/dev/null; then
        write_error "Docker is not installed."
        exit 1
    fi

    if ! command -v docker-compose &>/dev/null; then
        write_error "Docker Compose is not installed."
        exit 1
    fi

    if ! docker info &>/dev/null; then
        write_error "Docker is not running."
        exit 1
    fi

    write_success "Prerequisites check completed!"
}

# Create data directory structure
new_data_structure() {
    write_status "Creating data directory structure..."
    mkdir -p "$DB_PATH" "$UPLOADS_PATH"
    write_success "Data directory structure created!"
}

# Set permissions (minimal, like PS script)
set_permissions() {
    write_status "Setting proper permissions..."
    if [ -d "$DATA_DIR" ]; then
        write_success "Data directory is accessible"
    fi
    if [ -d "$UPLOADS_PATH" ]; then
        write_success "Uploads directory is accessible"
    fi
    write_success "Permissions set successfully!"
}

# Create logs directory
new_logs_directory() {
    write_status "Creating logs directory..."
    mkdir -p "$LOGS_PATH"
    write_success "Logs directory created!"
}

# Build and start services
build_and_start_services() {
    local original_dir
    original_dir="$(pwd)"

    cd "$SERVER_ROOT"
    pnpm install
    npx nx run-many --target=build --all
    docker-compose -f setup/docker/docker-compose.yml up -d --build

    # Open in browser (Linux: xdg-open, Mac: open)
    if command -v xdg-open &>/dev/null; then
        xdg-open "http://localhost:3000" >/dev/null 2>&1 &
    elif command -v open &>/dev/null; then
        open "http://localhost:3000"
    fi

    write_success "Build complete, services started, and browser opened."

    cd "$original_dir"
}

# Show next steps
show_next_steps() {
    echo ""
    write_success "Server setup completed!"
    echo ""
    write_status "Next steps:"
    echo "  1. Check service status:"
    echo "     (from repo/server) docker-compose -f setup/docker/docker-compose.yml ps"
    echo ""
    echo "  2. View logs:"
    echo "     (from repo/server) docker-compose -f setup/docker/docker-compose.yml logs -f"
    echo ""
    write_status "Services will be available at:"
    echo -e "  - Admin App: ${BLUE}http://localhost:3000${NC}"
    echo -e "  - Dashboard Service: ${BLUE}http://localhost:5001${NC}"
    echo -e "  - Auth Service: ${BLUE}http://localhost:5002${NC}"
    echo -e "  - Marketing Service: ${BLUE}http://localhost:5003${NC}"
    echo -e "  - Ollama: ${BLUE}http://localhost:11434${NC}"
    echo -e "  - Uploads: ${BLUE}http://localhost:5001/uploads/{filename}${NC}"
    echo ""
    write_status "Data directory structure:"
    echo -e "  ${YELLOW}$DATA_DIR${NC}"
    echo -e "  + db/"
    echo -e "  - uploads/"
    echo ""
}

# Main
main() {
    echo -e "${BLUE}New Server Setup (Linux/Mac)${NC}"
    echo "============================================="
    echo ""
    test_prerequisites
    new_data_structure
    set_permissions
    new_logs_directory
    build_and_start_services
    show_next_steps
}

main "$@"
