#!/bin/bash

# Coleta arquivos estáticos
python manage.py collectstatic --noinput

# Aplica migrações
python manage.py migrate

# Cria superusuário se não existir
python manage.py createsuperuser --noinput || true

# Inicia o Gunicorn
gunicorn core.wsgi:application --bind 0.0.0.0:$PORT 