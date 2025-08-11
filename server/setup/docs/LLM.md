# LLM

`llama3.2:latest` is a `2.0 GB` model and it takes time to download it. See `ollama-service` docker logs.

## Manual download

You can manually download LLM `llama3.2:latest` in `ollama-service` container using:

```bash
docker exec -it ollama-service ollama pull llama3.2:latest
```

## Test LLM

```bash
docker run --rm -it --network docker_admin-network curlimages/curl   curl -v -X POST http://ollama-service:11434/api/generate   -H "Content-Type: application/json"   -d '{"model":"llama3.2:latest","prompt":"hello"}'
```
