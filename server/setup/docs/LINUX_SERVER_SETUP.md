# Linux Server Setup

Prepare a fresh Linux host for running the stack with Docker. This guide focuses on Ubuntu/Debian; adapt as needed for your distro.

## Prerequisites

- Ubuntu 22.04+ or Debian 12+ (recommended)
- sudo access
- Open ports: 3000, 5001, 5002, 5003, 11434

## 1) Install Docker and Compose

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Docker official repo
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$(. /etc/os-release; echo "$ID") \
  $(. /etc/os-release; echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Optional: run docker without sudo (re-login required)
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker

docker --version
docker compose version
```

## 2) Create Required Directories

From the repository root:

```bash
mkdir -p server/setup/logs
mkdir -p data/uploads
mkdir -p data/db

# Permissions
sudo chown -R $USER:$USER server/setup/logs data
chmod -R 755 server/setup/logs data
```

Notes:

- The compose file lives in `server/setup/docker/docker-compose.yml` and mounts `../../logs` and `../../../data` relative to that file. The commands above create those paths correctly from the repo root.

## 3) Start the Stack

```bash
cd server/setup/docker
docker compose up -d --build | cat
```

## 4) Verify

- Admin App: <http://localhost:3000>
- Dashboard API: <http://localhost:5001/health>
- Auth API: <http://localhost:5002/health>
- Marketing API: <http://localhost:5003/health>
- Ollama: <http://localhost:11434/api/tags>

## 5) Firewall (optional)

If you use UFW:

```bash
sudo ufw allow 3000,5001,5002,5003,11434/tcp
sudo ufw status
```

## Maintenance

```bash
# Logs
cd server/setup/docker
docker compose logs -f | cat

# Update images and restart
docker compose pull
docker compose up -d --build | cat

# Stop
docker compose down | cat
```

## More

- Quick start: see [QUICK_SETUP](QUICK_SETUP.md)
- Docker details, troubleshooting, production notes: see [DOCKER_README](DOCKER_README.md)
- Known issues: see [KNOWN_ISSUES](KNOWN_ISSUES.md)
