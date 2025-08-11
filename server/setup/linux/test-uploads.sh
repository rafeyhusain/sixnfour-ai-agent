#!/bin/bash

# Test script for uploads functionality
# This script verifies that uploads are publicly accessible

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

# Function to check if service is running
check_service() {
    local service_name=$1
    local port=$2
    local url=$3
    
    print_status "Checking $service_name on port $port..."
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        print_success "$service_name is running and accessible"
        return 0
    else
        print_error "$service_name is not accessible at $url"
        return 1
    fi
}

# Function to test uploads directory
test_uploads() {
    print_status "Testing uploads directory..."
    
    # Check if uploads directory exists
    if [ ! -d "../data/uploads" ]; then
        print_warning "Uploads directory does not exist, creating it..."
        mkdir -p ../data/uploads
    fi
    
    # Create a test file
    local test_file="../data/uploads/test-upload.txt"
    echo "This is a test upload file created at $(date)" > "$test_file"
    print_success "Created test file: $test_file"
    
    # Test if the file is accessible via HTTP
    local test_url="http://localhost:5001/uploads/test-upload.txt"
    print_status "Testing uploads access at: $test_url"
    
    if curl -s -f "$test_url" > /dev/null 2>&1; then
        print_success "Uploads are publicly accessible!"
        
        # Show the content
        print_status "Test file content:"
        curl -s "$test_url"
        echo ""
    else
        print_error "Uploads are not accessible at $test_url"
        print_status "Checking dashboard service logs..."
        docker-compose logs dashboard-service | tail -10
        return 1
    fi
}

# Function to test media API
test_media_api() {
    print_status "Testing media API..."
    
    local base_url="http://localhost:5001"
    
    # Test media list endpoint
    print_status "Testing media list endpoint..."
    if curl -s -f "$base_url/media/list" > /dev/null 2>&1; then
        print_success "Media list endpoint is working"
    else
        print_error "Media list endpoint is not working"
        return 1
    fi
    
    # Test media search endpoint
    print_status "Testing media search endpoint..."
    if curl -s -f "$base_url/media/search" > /dev/null 2>&1; then
        print_success "Media search endpoint is working"
    else
        print_error "Media search endpoint is not working"
        return 1
    fi
}

# Function to show uploads directory structure
show_uploads_structure() {
    print_status "Uploads directory structure:"
    if [ -d "../data/uploads" ]; then
        tree ../data/uploads 2>/dev/null || ls -la ../data/uploads
    else
        print_warning "Uploads directory does not exist"
    fi
}

# Main function
main() {
    echo "🧪 Testing Uploads Functionality"
    echo "================================"
    echo ""
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Check if services are running
    check_service "Dashboard Service" "5001" "http://localhost:5001/health" || {
        print_error "Dashboard service is not running. Please start the services first:"
        echo "  docker-compose up -d"
        exit 1
    }
    
    # Test uploads functionality
    test_uploads
    
    # Test media API
    test_media_api
    
    # Show uploads structure
    show_uploads_structure
    
    echo ""
    print_success "🎉 Uploads testing completed!"
    echo ""
    print_status "Uploads are now publicly accessible at:"
    echo "  http://localhost:5001/uploads/{filename}"
    echo ""
    print_status "This URL format can be used by:"
    echo "  - Facebook Graph API"
    echo "  - Instagram Graph API"
    echo "  - External applications"
    echo "  - Social media platforms"
}

# Run main function
main "$@" 