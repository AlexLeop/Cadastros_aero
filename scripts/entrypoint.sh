#!/bin/bash
set -e

cd /app

# Verificar variáveis de ambiente necessárias
if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL is not set"
    exit 1
fi

if [ -z "$DJANGO_SECRET_KEY" ]; then
    echo "DJANGO_SECRET_KEY is not set"
    exit 1
fi

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting application..."
exec gunicorn core.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 1 \
    --threads 2 \
    --timeout 30 \
    --access-logfile - \
    --error-logfile - \
    --log-level debug \
    --capture-output \
    --preload 