#!/bin/bash
set -e

cd /app

# Iniciar apenas o Gunicorn para a aplicação principal
exec gunicorn core.wsgi:application \
    --bind 0.0.0.0:$PORT \
    --workers 1 \
    --threads 2 \
    --timeout 30 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --capture-output 