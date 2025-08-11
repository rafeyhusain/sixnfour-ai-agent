# Welcome to AI Social Marketing

This directory contains all setup-related files organized by type and platform.

## Directory Structure

```bash
setup/
├── docs/                    # Documentation files (.md)
│   ├── QUICK_SETUP.md          # Quick setup guide
│   ├── DOCKER_README.md        # Docker documentation
│   ├── LINUX_SERVER_SETUP.md   # Linux server preparation
│   ├── WINDOWS_SERVER_SETUP.md # Windows server preparation
│   ├── ADMIN_CHECKLIST.md      # Administrator checklist
│   └── KNOWN_ISSUES.md         # Known issues
├── docker/                  # Docker configuration files (.yml)
│   ├── docker-compose.yml           # Main compose file
│   ├── docker-compose.dev.yml       # Development overrides
│   ├── docker-compose.prod.yml      # Production overrides
│   └── docker-compose.dashboard-service.yml
├── linux/                   # Linux scripts (.sh)
│   ├── setup-new-server.sh # New server setup
│   ├── docker-run.sh       # Docker management
│   ├── test-uploads.sh     # Upload testing
│   └── quick-start.sh      # Quick start script
└── windows/                 # Windows scripts (.ps1)
    ├── setup-new-server.ps1 # New server setup
    ├── docker-run.ps1       # Docker management
    └── test-uploads.ps1     # Upload testing
```

## Setup

### Windows

```bash
PS C:\agent> .\server\setup\windows\setup-new-server.ps1
```

### Linux

```bash
$> ./server/setup/linux/setup-new-server.sh
```

## Guides

- [Quick Setup Guide](./docs/QUICK_SETUP.md)
- [Docker Guide](./docs/DOCKER_README.md)
- [Linux Server Setup Guide](./docs/LINUX_SERVER_SETUP.md)
- [Windows Server Setup Guide](./docs/WINDOWS_SERVER_SETUP.md)
- [Administrator Guide](./docs/ADMIN_CHECKLIST.md)
- [Known Issues](./docs/KNOWN_ISSUES.md)
- [LLM Guide](./docs/LLM.md)
- [Social Media Guide](./docs/SOCIAL_MEDIA.md)
- [Cron Jobs Guide](./docs/CRON_JOBS.md)
- [Dashboard Guide](./docs/DASHBOARD_GUIDE.md)
