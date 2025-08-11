# Docker Setup for Services

This document provides instructions for running the services using Docker.

## 🆕 New Server Setup

If this is a fresh machine, complete OS-specific setup first:

- Linux: see [LINUX_SERVER_SETUP](LINUX_SERVER_SETUP.md)
- Windows: see [WINDOWS_SERVER_SETUP](WINDOWS_SERVER_SETUP.md)

## Services

- **ollama**: AI/LLM service using Ollama (Port 11434)
- **admin-app**: Next.js/Shadcn admin application (Port 3000)
- **dashboard-service**: Fastify-based dashboard service (Port 5001)
- **auth-service**: Authentication service (Port 5002)
- **marketing-service**: Marketing automation service (Port 5003)

## Prerequisites

- Docker and Docker Compose installed
- Node.js and pnpm (for building)
- Nx CLI (for development builds)
- At least 4GB RAM (recommended for Ollama)

## Quick Start

### Option 1: Run All Services

```bash
# Build and run all services
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop all services
docker-compose down
```

### Option 2: Run Only Dashboard Service

```bash
# Build and run only dashboard-service
docker-compose -f docker-compose.dashboard-service.yml up --build

# Run in detached mode
docker-compose -f docker-compose.dashboard-service.yml up -d --build
```

### Option 3: Run Only Admin App

```bash
# Build and run only admin-app
docker-compose up --build admin-app

# Run in detached mode
docker-compose up -d --build admin-app
```

### Option 4: Run Only Ollama

```bash
# Run only Ollama service
docker-compose up --build ollama

# Run in detached mode
docker-compose up -d --build ollama
```

### Option 5: Using Nx Commands

```bash
# Build the dashboard-service
npx nx build dashboard-service

# Build Docker image using Nx
npx nx docker-build dashboard-service

# Run the container
docker run -p 5001:5001 -t dashboard-service
```

## Development Workflow

### 1. Build the Application

```bash
# Install dependencies
pnpm install

# Build the dashboard-service
npx nx build dashboard-service
```

### 2. Build Docker Image

```bash
# Using Nx command
npx nx docker-build dashboard-service

# Or manually
docker build -f apps/services/dashboard-service/Dockerfile . -t dashboard-service
```

### 3. Run Container

```bash
# Basic run
docker run -p 5001:5001 -t dashboard-service

# With environment variables
docker run -p 5001:5001 \
  -e NODE_ENV=production \
  -e HOST=0.0.0.0 \
  -e PORT=5001 \
  -t dashboard-service
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `HOST` | `0.0.0.0` | Host to bind to |
| `PORT` | `5001` | Port to listen on |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disable Next.js telemetry |
| `DATA_PATH` | `/app/data` | Path to data directory |
| `SERVICE_URL` | `http://localhost:5001` | Base URL for dashboard service |

## Service Ports and URLs

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Ollama | 11434 | <http://localhost:11434> | AI/LLM service |
| Admin App | 3000 | <http://localhost:3000> | Next.js/Shadcn admin interface |
| Dashboard Service | 5001 | <http://localhost:5001> | Dashboard API |
| Auth Service | 5002 | <http://localhost:5002> | Authentication API |
| Marketing Service | 5003 | <http://localhost:5003> | Marketing automation API |

## Uploads and Media Files

### Public Access to Uploads

The dashboard service provides public access to uploaded media files through the `/uploads/` endpoint. This is essential for social media integration (Facebook, Instagram Graph API) and external access.

**Uploads URL Format:**

```bash
http://localhost:5001/uploads/{filename}
```

**Examples:**

- Image: `http://localhost:5001/uploads/carbonara.jpg`
- Video: `http://localhost:5001/uploads/promo-video.mp4`
- Document: `http://localhost:5001/uploads/presentation.pdf`

### Uploads Directory Structure

```bash
../data/
├── db/
│   ├── campaigns.json
│   ├── campaign-tasks.json
│   ├── schedules.json
│   ├── medias.json
│   ├── settings.json
│   └── backup/
└── uploads/
    ├── carbonara.jpg
    ├── promo-video.mp4
    └── presentation.pdf
```

### Uploads Configuration

- **Directory**: `/app/data/uploads` (inside container)
- **Host Mount**: `../data/uploads` (read-write)
- **Public Access**: Enabled via Fastify static file serving
- **Permissions**: 755 (readable by all)
- **CORS**: Enabled for external access

### Media API Endpoints

- `GET /media/list` - List all media files
- `GET /media/get?id={id}` - Get specific media by ID
- `POST /media/create` - Create new media record
- `POST /media/upload` - Upload new media file
- `PUT /media/update` - Update media record
- `DELETE /media/delete` - Delete media file and record
- `GET /media/search?tags={tags}` - Search media by tags

## Health Checks

All services include health checks that verify the service is responding on their respective ports:

- **Ollama**: `http://localhost:11434/api/tags`
- **Admin App**: `http://localhost:3000`
- **Dashboard Service**: `http://localhost:5001/health`
- **Auth Service**: `http://localhost:5002/health`
- **Marketing Service**: `http://localhost:5003/health`

## Data Directory

The services use a shared data directory located at `../data` which is mounted into each service container at `/app/data`. This directory contains:

- **Database files**: JSON files for campaigns, tasks, schedules, etc.
- **Uploads**: User-uploaded files and media (publicly accessible)
- **Backups**: Database backups

## Logs

Logs are mounted to the `./logs` directory in the host system. You can access them via:

```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs dashboard-service
docker-compose logs admin-app
docker-compose logs ollama

# Follow logs in real-time
docker-compose logs -f dashboard-service
```

## Troubleshooting

### Build Issues

1. **Clean build artifacts**:

   ```bash
   npx nx reset
   rm -rf dist/
   ```

2. **Rebuild without cache**:

   ```bash
   docker-compose build --no-cache
   ```

### Port Conflicts

If you get port conflicts, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "5002:5001"  # Map host port 5002 to container port 5001
```

### Permission Issues

If you encounter permission issues with logs directory:

```bash
mkdir -p logs
chmod 755 logs
```

### Uploads Issues

1. **Uploads not accessible**: Check if the uploads directory is properly mounted

   ```bash
   # Check if uploads directory exists
   ls -la ../data/uploads
   
   # Check container logs
   docker-compose logs dashboard-service
   ```

2. **File permissions**: Ensure uploads directory has correct permissions

   ```bash
   chmod -R 755 ../data/uploads
   ```

3. **URL format**: Verify the uploads URL format

   ```bash
   http://localhost:5001/uploads/{filename}
   ```

### Ollama Issues

1. **Memory requirements**: Ollama requires at least 2GB RAM, recommended 4GB+
2. **Model downloads**: First run may take time to download models
3. **GPU support**: For better performance, consider GPU-enabled Docker

### Admin App Issues

1. **Build issues**: Ensure Next.js standalone output is enabled
2. **Hot reload**: In development, source code is mounted for live reloading
3. **Environment variables**: Check Next.js configuration for API endpoints

## Production Deployment

For production deployment, consider:

1. **Environment-specific configurations**:

   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

2. **Resource limits**:

   ```yaml
   services:
     ollama:
       deploy:
         resources:
           limits:
             memory: 4G
             cpus: '2.0'
   ```

3. **Health checks and restart policies** (already configured)

4. **Logging and monitoring**:

   ```yaml
   services:
     dashboard-service:
       logging:
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"
   ```

5. **Uploads security**: Consider implementing additional security measures for public uploads
   - File type validation
   - File size limits
   - Virus scanning
   - Access control

## Service Dependencies

The services have the following dependencies:

- **admin-app**: Depends on dashboard-service, auth-service, marketing-service
- **dashboard-service**: Depends on ollama
- **marketing-service**: Depends on dashboard-service, ollama
- **auth-service**: Standalone service
- **ollama**: Standalone service

## Network Configuration

All services are connected via the `admin-network` bridge network, allowing inter-service communication using service names as hostnames.

## Security Considerations

1. **Non-root user**: All services run as non-root users
2. **Minimal base image**: Using Alpine Linux for smaller attack surface
3. **Health checks**: Regular health monitoring
4. **Resource limits**: Configurable resource constraints
5. **Network isolation**: Services communicate via internal network
6. **Data persistence**: Data directory is mounted as read-only for services
7. **Public uploads**: Uploads directory is publicly accessible for social media integration

## Monitoring

Monitor your services using:

```bash
# Check service status
docker-compose ps

# View resource usage
docker stats

# Check health status
docker-compose exec dashboard-service wget -qO- http://localhost:5001/health
docker-compose exec admin-app wget -qO- http://localhost:3000
docker-compose exec ollama curl -f http://localhost:11434/api/tags

# Test uploads access
curl -I http://localhost:5001/uploads/carbonara.jpg
```

## Development vs Production

### Development Mode

- Hot reloading enabled
- Source code mounted for live editing
- Debug ports exposed
- Development environment variables

### Production Mode

- Optimized builds
- Resource limits applied
- Health checks enabled
- Production environment variables
- Logging configured
