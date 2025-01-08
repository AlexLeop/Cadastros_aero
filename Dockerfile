FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

RUN mkdir -p /app/staticfiles && \
    chmod +x /app/scripts/entrypoint.sh

EXPOSE 8000

HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health/ || exit 1

CMD ["/app/scripts/entrypoint.sh"] 