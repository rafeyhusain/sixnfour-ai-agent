# Administrator Checklist

Use this high-level checklist for provisioning and operating the stack. Each step links to detailed docs.

## Provisioning

1. Prepare host OS
   - Linux: follow [LINUX_SERVER_SETUP](LINUX_SERVER_SETUP.md)
   - Windows: follow [WINDOWS_SERVER_SETUP](WINDOWS_SERVER_SETUP.md)
2. Create required directories: `server/setup/logs`, `data/uploads`, `data/db`
3. Ensure Docker and Compose are installed and working
4. Open firewall ports: 3000, 5001, 5002, 5003, 11434

## Launch

1. Start services: `cd server/setup/docker && docker compose up -d --build`
2. Verify health:
   - Admin App: `http://<host>:3000`
   - Dashboard: `http://<host>:5001/health`
   - Auth: `http://<host>:5002/health`
   - Marketing: `http://<host>:5003/health`
   - Ollama: `http://<host>:11434/api/tags`

## Operations

- Logs: `docker compose logs -f`
- Update images: `docker compose pull && docker compose up -d --build`
- Stop: `docker compose down`

## Data and Backups

- Data lives in `data/` (JSON DB, uploads) and `server/setup/logs`
- Back up `data/` regularly; consider versioned snapshots

## Security

- Limit public access; only expose necessary ports
- Consider reverse proxy and TLS termination in production
- Validate uploads and enforce size/type limits

## Troubleshooting

- See [DOCKER_README](DOCKER_README.md) (Troubleshooting section)
- See [KNOWN_ISSUES](KNOWN_ISSUES.md)
