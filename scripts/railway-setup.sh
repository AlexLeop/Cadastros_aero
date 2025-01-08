#!/bin/bash

# Instalar CLI do Railway
npm install -g @railway/cli

# Login no Railway (necessário token)
railway login

# Criar novo projeto
railway init

# Adicionar serviços necessários
railway add postgresql
railway add redis
railway add volume

# Configurar variáveis de ambiente
railway variables set \
  DJANGO_SETTINGS_MODULE=core.settings_prod \
  DEBUG=False \
  ALLOWED_HOSTS=.railway.app \
  DJANGO_SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())') \
  SENTRY_DSN=$SENTRY_DSN

# Configurar domínio personalizado
railway domain 