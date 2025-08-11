# Docker run script for Backend Services (PowerShell)
# Usage: .\scripts\docker-run.ps1 [dev|prod|dashboard-only|admin-only|ollama-only|test-uploads]

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Function to build the application
function Build-App {
    Write-Status "Building dashboard-service..."
    npx nx build dashboard-service
    Write-Success "Build completed successfully!"
}

# Function to run development environment
function Start-Dev {
    Write-Status "Starting development environment..."
    docker-compose -f ..\..\setup\docker\docker-compose.yml -f ..\..\setup\docker\docker-compose.dev.yml up --build
}

# Function to run production environment
function Start-Prod {
    Write-Status "Starting production environment..."
    docker-compose -f ..\..\setup\docker\docker-compose.yml -f ..\..\setup\docker\docker-compose.prod.yml up -d --build
    Write-Success "Production services started in detached mode!"
    Write-Status "Use 'docker-compose logs -f' to view logs"
}

# Function to run only dashboard service
function Start-DashboardOnly {
    Write-Status "Starting dashboard-service only..."
    docker-compose -f ..\..\setup\docker\docker-compose.dashboard-service.yml up --build
}

# Function to run only admin app
function Start-AdminOnly {
    Write-Status "Starting admin-app only..."
    docker-compose -f ..\..\setup\docker\docker-compose.yml up --build admin-app
}

# Function to run only ollama
function Start-OllamaOnly {
    Write-Status "Starting Ollama only..."
    docker-compose -f ..\..\setup\docker\docker-compose.yml up --build ollama
}

# Function to stop all services
function Stop-Services {
    Write-Status "Stopping all services..."
    docker-compose -f ..\..\setup\docker\docker-compose.yml down
    Write-Success "All services stopped!"
}

# Function to show status
function Show-Status {
    Write-Status "Service status:"
    docker-compose -f ..\..\setup\docker\docker-compose.yml ps
}

# Function to show logs
function Show-Logs {
    Write-Status "Showing logs for all services:"
    docker-compose -f ..\..\setup\docker\docker-compose.yml logs -f
}

# Function to test uploads
function Test-Uploads {
    Write-Status "Testing uploads functionality..."
    
    # Check if dashboard service is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5001/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Dashboard service is running"
        } else {
            Write-Error "Dashboard service is not responding correctly"
            return
        }
    }
    catch {
        Write-Error "Dashboard service is not running. Please start the services first:"
        Write-Host "  docker-compose up -d" -ForegroundColor Yellow
        return
    }
    
    # Create test uploads directory if it doesn't exist
    $uploadsDir = "../data/uploads"
    if (-not (Test-Path $uploadsDir)) {
        Write-Warning "Uploads directory does not exist, creating it..."
        New-Item -ItemType Directory -Path $uploadsDir -Force | Out-Null
    }
    
    # Create a test file
    $testFile = "$uploadsDir/test-upload.txt"
    $testContent = "This is a test upload file created at $(Get-Date)"
    $testContent | Out-File -FilePath $testFile -Encoding UTF8
    Write-Success "Created test file: $testFile"
    
    # Test if the file is accessible via HTTP
    $testUrl = "http://localhost:5001/uploads/test-upload.txt"
    Write-Status "Testing uploads access at: $testUrl"
    
    try {
        $response = Invoke-WebRequest -Uri $testUrl -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Uploads are publicly accessible!"
            Write-Status "Test file content:"
            Write-Host $response.Content -ForegroundColor Gray
        } else {
            Write-Error "Uploads are not accessible at $testUrl"
        }
    }
    catch {
        Write-Error "Uploads are not accessible at $testUrl"
        Write-Status "Checking dashboard service logs..."
        docker-compose logs dashboard-service | Select-Object -Last 10
    }
    
    # Test media API
    Write-Status "Testing media API..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5001/media/list" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Success "Media API is working"
        } else {
            Write-Error "Media API is not working"
        }
    }
    catch {
        Write-Error "Media API is not working"
    }
    
    Write-Host ""
    Write-Success "🎉 Uploads testing completed!"
    Write-Host ""
    Write-Status "Uploads are now publicly accessible at:"
    Write-Host "  http://localhost:5001/uploads/{filename}" -ForegroundColor Cyan
    Write-Host ""
    Write-Status "This URL format can be used by:"
    Write-Host "  - Facebook Graph API" -ForegroundColor Yellow
    Write-Host "  - Instagram Graph API" -ForegroundColor Yellow
    Write-Host "  - External applications" -ForegroundColor Yellow
    Write-Host "  - Social media platforms" -ForegroundColor Yellow
}

# Function to show help
function Show-Help {
    Write-Host "Usage: .\scripts\docker-run.ps1 [COMMAND]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Cyan
    Write-Host "  dev              Start development environment with hot reload"
    Write-Host "  prod             Start production environment in detached mode"
    Write-Host "  dashboard-only   Start only dashboard-service"
    Write-Host "  admin-only       Start only admin-app (Next.js/Shadcn)"
    Write-Host "  ollama-only      Start only Ollama service"
    Write-Host "  test-uploads     Test uploads functionality"
    Write-Host "  stop             Stop all services"
    Write-Host "  status           Show service status"
    Write-Host "  logs             Show logs for all services"
    Write-Host "  build            Build the application"
    Write-Host "  help             Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Cyan
    Write-Host "  .\scripts\docker-run.ps1 dev           # Start development environment"
    Write-Host "  .\scripts\docker-run.ps1 prod          # Start production environment"
    Write-Host "  .\scripts\docker-run.ps1 stop          # Stop all services"
    Write-Host "  .\scripts\docker-run.ps1 test-uploads  # Test uploads functionality"
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Cyan
    Write-Host "  - Ollama (AI/LLM): http://localhost:11434"
    Write-Host "  - Admin App: http://localhost:3000"
    Write-Host "  - Dashboard Service: http://localhost:5001"
    Write-Host "  - Auth Service: http://localhost:5002"
    Write-Host "  - Marketing Service: http://localhost:5003"
    Write-Host "  - Uploads: http://localhost:5001/uploads/{filename}"
}

# Main script logic
function Main {
    # Check if Docker is running
    if (-not (Test-Docker)) {
        Write-Error "Docker is not running. Please start Docker and try again."
        exit 1
    }

    switch ($Command.ToLower()) {
        "dev" {
            Build-App
            Start-Dev
        }
        "prod" {
            Build-App
            Start-Prod
        }
        "dashboard-only" {
            Build-App
            Start-DashboardOnly
        }
        "admin-only" {
            Start-AdminOnly
        }
        "ollama-only" {
            Start-OllamaOnly
        }
        "test-uploads" {
            Test-Uploads
        }
        "stop" {
            Stop-Services
        }
        "status" {
            Show-Status
        }
        "logs" {
            Show-Logs
        }
        "build" {
            Build-App
        }
        "help" {
            Show-Help
        }
        default {
            Write-Error "Unknown command: $Command"
            Show-Help
        }
    }
}

# Run main function
Main 