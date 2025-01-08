#!/bin/bash

# Esperar pelo banco de dados
python manage.py wait_for_db

# Aplicar migrações
python manage.py migrate

# Iniciar Celery em background
celery -A core worker -l INFO &

# Iniciar aplicação
gunicorn core.wsgi:application --bind 0.0.0.0:8000 