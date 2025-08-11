# Windows Server Setup

Prepare a Windows host to run the stack with Docker Desktop (WSL 2 backend recommended).

## Prerequisites

- Windows 10/11 Pro or Windows Server 2019/2022
- Administrator privileges
- Docker Desktop installed with WSL 2 backend enabled
- Open ports: 3000, 5001, 5002, 5003, 11434

Verify Docker:

```powershell
docker --version
docker compose version
```

## 1) Create Required Directories

Run from the repository root in PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path "server/setup/logs" | Out-Null
New-Item -ItemType Directory -Force -Path "data/uploads" | Out-Null
New-Item -ItemType Directory -Force -Path "data/db" | Out-Null
```

Notes:

- The compose file is at `server\setup\docker\docker-compose.yml` and mounts `..\..\logs` and `..\..\..\data` relative to that file. The paths above match those mounts when created from the repo root.

## 2) Start the Stack

```powershell
Set-Location server/setup/docker
docker compose up -d --build
```

## 3) Verify

- Admin App: <http://localhost:3000>
- Dashboard API: <http://localhost:5001/health>
- Auth API: <http://localhost:5002/health>
- Marketing API: <http://localhost:5003/health>
- Ollama: <http://localhost:11434/api/tags>

## 4) Firewall (optional)

If Windows Defender Firewall is enabled, allow inbound TCP for the ports above.

## Maintenance

```powershell
# Logs
docker compose logs -f

# Update images and restart
docker compose pull
docker compose up -d --build

# Stop
docker compose down
```

## More

- Quick start: see [QUICK_$$SETUP](QUICK_SETUP.md)
- Docker details, troubleshooting, production notes: see [DOCKER_README](DOCKER_README.md)
- Known issues: see [KNOWN_ISSUES](KNOWN_ISSUES.md)
