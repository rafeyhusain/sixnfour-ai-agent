# Quick Setup

Use this when you just want the stack up and running quickly. For full details, see the Docker guide.

## Prerequisites

- Docker and Docker Compose plugin installed
- 4GB+ RAM recommended (for Ollama)
- Open ports: 3000, 5001, 5002, 5003, 11434

If this is a brand new server, complete New Server Setup first:

- Linux: see [LINUX_SERVER_SETUP](LINUX_SERVER_SETUP.md)
- Windows: see [WINDOWS_SERVER_SETUP](WINDOWS_SERVER_SETUP.md)

## TL;DR

```bash
cd server/setup/docker
docker-compose up -d --build | cat
```

Verify services:

- Admin App: <http://localhost:3000>
- Dashboard API: <http://localhost:5001/health>
- Auth API: <http://localhost:5002/health>
- Marketing API: <http://localhost:5003/health>
- Ollama: <http://localhost:11434/api/tags>

To stop:

```bash
docker-compose down | cat
```

## Run specific services (optional)

See [DOCKER_README](DOCKER_README.md) for running a single service, logs, troubleshooting, and production notes.
