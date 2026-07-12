FROM python:3.12-slim AS backend

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
COPY backend/src/ ./src/

RUN pip install --no-cache-dir -e .

EXPOSE 11434

ENV OLLAMA_EMU_BIND=0.0.0.0

CMD ["ollamomui", "serve", "--host", "0.0.0.0", "--port", "11434"]
