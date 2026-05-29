# Ceromancia CV — listo para Render, Fly.io, Railway, etc.
FROM python:3.11-slim-bookworm

RUN apt-get update && apt-get install -y --no-install-recommends \
    libheif1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
RUN python scripts/generate_pwa_icons.py

ENV PORT=8000
ENV PYTHONUNBUFFERED=1
ENV OMP_NUM_THREADS=1
ENV OPENBLAS_NUM_THREADS=1
ENV OPENCV_NUM_THREADS=1
ENV MALLOC_ARENA_MAX=2
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --timeout-keep-alive 120 --limit-concurrency 4"]
