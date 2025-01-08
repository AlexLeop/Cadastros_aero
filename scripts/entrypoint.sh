#!/bin/bash

# Esperar pelo banco de dados
echo "Waiting for database..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER
do
  sleep 2
done

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
gunicorn core.wsgi:application --bind 0.0.0.0:$PORT --workers 4 --threads 2 --timeout 120 