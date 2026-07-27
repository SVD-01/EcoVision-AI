# EcoVision AI Engine - Multi-stage GPU-ready Docker Image
FROM python:3.11-slim AS base
WORKDIR /app

# System dependencies for OpenCV, image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx libglib2.0-0 libsm6 libxrender1 libxext6 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir fastapi uvicorn pydantic pydantic-settings \
    python-multipart httpx structlog numpy Pillow scikit-learn pandas

COPY . .

ENV AI_PORT=8000
ENV AI_HOST=0.0.0.0
ENV AI_DEBUG=false
ENV AI_ENVIRONMENT=production

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
