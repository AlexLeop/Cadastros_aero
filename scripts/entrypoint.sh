#!/bin/bash

# Função para verificar se um serviço está pronto
wait_for_service() {
    local host=$1
    local port=$2
    local service=$3
    
    echo "Waiting for $service to be ready..."
    while ! nc -z $host $port; do
        sleep 1
    done
    echo "$service is ready!"
}

# Extrair host e porta do DATABASE_URL
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\(.*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

# Extrair host e porta do REDIS_URL
REDIS_HOST=$(echo $REDIS_URL | sed -n 's/.*@\(.*\):.*/\1/p')
REDIS_PORT=$(echo $REDIS_URL | sed -n 's/.*:\([0-9]*\)$/\1/p')

# Esperar pelos serviços
wait_for_service $DB_HOST ${DB_PORT:-5432} "PostgreSQL"
wait_for_service $REDIS_HOST ${REDIS_PORT:-6379} "Redis"

# Aplicar migrações
echo "Applying database migrations..."
python manage.py migrate --noinput

# Coletar arquivos estáticos
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Iniciar Celery em background
echo "Starting Celery worker..."
celery -A core worker --loglevel=info &

# Iniciar aplicação
echo "Starting application..."
gunicorn core.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 4 \
    --threads 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info 