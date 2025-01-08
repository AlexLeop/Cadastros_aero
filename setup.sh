#!/bin/bash

# Instalar dependências de desenvolvimento
poetry install --with dev

# Criar diretório para logs
mkdir -p logs

# Executar migrações
python manage.py migrate

# Executar testes
pytest

# Verificar cobertura
coverage report

# Executar linting
flake8
black . --check

# Executar verificação de segurança
bandit -r .
safety check 