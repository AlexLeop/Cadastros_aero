#!/bin/bash
set -e

cd /app

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting application..."
exec gunicorn core.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 2 \
    --threads 2 \
    --timeout 30 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --capture-output 