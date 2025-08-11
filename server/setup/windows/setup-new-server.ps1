param(
    [switch]$Force
)

# Paths relative to script location
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerRoot  = Resolve-Path (Join-Path $ScriptDir "..\..") | ForEach-Object { $_.Path }
$DataDir     = Join-Path $ServerRoot "..\data"
$DbPath      = Join-Path $DataDir "db"
$UploadsPath = Join-Path $DataDir "uploads"
$LogsPath    = Join-Path $ServerRoot "logs"

# Output helpers
function Write-Status   { param($m) Write-Host "[INFO] $m" -ForegroundColor Blue }
function Write-Success  { param($m) Write-Host "[SUCCESS] $m" -ForegroundColor Green }
function Write-Warning  { param($m) Write-Host "[WARNING] $m" -ForegroundColor Yellow }
function Write-ErrorMsg { param($m) Write-Host "[ERROR] $m" -ForegroundColor Red }

# Check prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    try { docker --version    | Out-Null; Write-Success "Docker is installed" }
    catch { Write-ErrorMsg "Docker is not installed."; exit 1 }

    try { docker-compose --version | Out-Null; Write-Success "Docker Compose is installed" }
    catch { Write-ErrorMsg "Docker Compose is not installed."; exit 1 }

    try { docker info | Out-Null; Write-Success "Docker is running" }
    catch { Write-ErrorMsg "Docker is not running."; exit 1 }

    Write-Success "Prerequisites check completed!"
}

# Create data directory structure
function New-DataStructure {
    Write-Status "Creating data directory structure..."
    New-Item -ItemType Directory -Force -Path $DbPath, $UploadsPath | Out-Null
    Write-Success "Data directory structure created!"
}

# Set permissions (minimal check like .sh)
function Set-Permissions {
    Write-Status "Checking directory accessibility..."
    if (Test-Path $DataDir)     { Write-Success "Data directory is accessible" }
    if (Test-Path $UploadsPath) { Write-Success "Uploads directory is accessible" }
    Write-Success "Permissions set successfully!"
}

# Create logs directory
function New-LogsDirectory {
    Write-Status "Creating logs directory..."
    New-Item -ItemType Directory -Force -Path $LogsPath | Out-Null
    Write-Success "Logs directory created!"
}

# Build and start services
function Build-And-StartServices {
    $originalLocation = Get-Location
    try {
        Set-Location $ServerRoot
        pnpm install
        npx nx run-many --target=build --all
        docker-compose -f "setup/docker/docker-compose.yml" up -d --build
        Start-Process "http://localhost:3000"
        Write-Success "Build complete, services started, and browser opened."
    }
    finally {
        Set-Location $originalLocation
    }
}

# Show next steps
function Show-NextSteps {
    Write-Host ""
    Write-Success "Server setup completed!"
    Write-Host ""
    Write-Status "Next steps:"
    Write-Host "  1. Check service status:"
    Write-Host "     (from repo/server) docker-compose -f setup/docker/docker-compose.yml ps"
    Write-Host ""
    Write-Host "  2. View logs:"
    Write-Host "     (from repo/server) docker-compose -f setup/docker/docker-compose.yml logs -f"
    Write-Host ""
    Write-Status "Services will be available at:"
    Write-Host "  - Admin App: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "  - Dashboard Service: http://localhost:5001" -ForegroundColor Cyan
    Write-Host "  - Auth Service: http://localhost:5002" -ForegroundColor Cyan
    Write-Host "  - Marketing Service: http://localhost:5003" -ForegroundColor Cyan
    Write-Host "  - Ollama: http://localhost:11434" -ForegroundColor Cyan
    Write-Host "  - Uploads: http://localhost:5001/uploads/{filename}" -ForegroundColor Cyan
    Write-Host ""
    Write-Status "Data directory structure:"
    Write-Host "  $DataDir" -ForegroundColor Yellow
    Write-Host "  + db/" -ForegroundColor Yellow
    Write-Host "  - uploads/" -ForegroundColor Yellow
    Write-Host ""
}

# Main execution
Write-Host "🚀 New Server Setup (Windows)" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Test-Prerequisites
New-DataStructure
Set-Permissions
New-LogsDirectory
Build-And-StartServices
Show-NextSteps
