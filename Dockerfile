FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HEALTH_PORT=8001 \
    DJANGO_SETTINGS_MODULE=core.settings_prod \
    PYTHONPATH=/app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    supervisor && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/

# Criar diretórios e configurar permissões
RUN mkdir -p /app/staticfiles /app/logs /run/supervisor && \
    chmod +x /app/scripts/entrypoint.sh && \
    chown -R www-data:www-data /app

# Configuração do Supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 8000 8001

# Healthcheck usando a porta dedicada
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:$HEALTH_PORT/ || exit 1

USER www-data

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"] 