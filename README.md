# Sistema de Processamento de Registros

Sistema completo para upload, processamento e validação de registros com interface web moderna e APIs RESTful.

## Características

- Upload e processamento assíncrono de arquivos
- Validação automática de registros
- Interface moderna com Material-UI
- API RESTful documentada
- Autenticação JWT
- Cache com Redis
- Busca com Elasticsearch
- Filas com Celery
- Testes automatizados
- CI/CD com GitHub Actions

## Tecnologias

### Backend
- Python 3.10+
- Django 4.2+
- Django REST Framework
- Celery
- Redis
- Elasticsearch
- PostgreSQL

### Frontend
- React 18
- Redux Toolkit
- Material-UI
- Formik
- Axios
- Cypress

## Instalação

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+
- Python 3.10+

### Backend

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/seu-projeto.git
cd seu-projeto

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Aplicar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Iniciar serviços
docker-compose up -d  # Redis, Elasticsearch, PostgreSQL
python manage.py runserver
celery -A core worker -l info
```

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar aplicação
npm start
```

## Uso

### API

A documentação completa da API está disponível em `/api/docs/` após iniciar o servidor.

Endpoints principais:

- `/api/auth/token/` - Autenticação JWT
- `/api/records/` - CRUD de registros
- `/api/files/` - Upload e processamento de arquivos
- `/api/settings/` - Configurações do sistema

### Interface Web

Acesse `http://localhost:3000` e faça login com as credenciais do superusuário.

## Desenvolvimento

### Testes

Backend:
```bash
# Testes unitários
python manage.py test

# Cobertura
coverage run manage.py test
coverage report
```

Frontend:
```bash
# Testes unitários
npm test

# Testes E2E
npm run cypress:open
```

### Linting e Formatação

Backend:
```bash
flake8
black .
isort .
```

Frontend:
```bash
npm run lint
npm run format
```

## Deploy

O projeto está configurado para deploy automático no Railway.

1. Fork do repositório
2. Conectar com Railway
3. Configurar variáveis de ambiente
4. Deploy automático a cada push na branch main

## Monitoramento

- Logs: Papertrail
- Métricas: Prometheus + Grafana
- Erros: Sentry
- Performance: New Relic

## Segurança

- Autenticação JWT com refresh tokens
- Rate limiting por IP e usuário
- Validação de entrada com schemas
- Headers de segurança (HSTS, CSP, etc.)
- CORS configurado
- Auditoria de ações

## Contribuindo

1. Fork do repositório
2. Criar branch (`git checkout -b feature/nova-feature`)
3. Commit (`git commit -am 'Adiciona nova feature'`)
4. Push (`git push origin feature/nova-feature`)
5. Criar Pull Request

## Licença

MIT #   C a d a s t r o s _ a e r o  
 