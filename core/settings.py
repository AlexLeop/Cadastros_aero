import os
from pathlib import Path

# Carregar .env apenas se existir
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Apps de terceiros
    'rest_framework',
    'corsheaders',
    
    # Apps locais
    'users',
    'files',
    'records',
    'notifications',
    'rest_framework_simplejwt',
    'settings',
    'drf_spectacular',
    'django_elasticsearch_dsl',
    'channels',
]

# Configuração do Banco de Dados
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600
    )
}

# Configuração do CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://seu-dominio.com"
]
CORS_ALLOW_CREDENTIALS = True

# Configuração do REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day'
    }
}

# Adicionar configurações do JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Configurar o modelo de usuário personalizado
AUTH_USER_MODEL = 'users.User' 

# Configurações do Celery
CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = REDIS_URL
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'America/Sao_Paulo'

# Configurações específicas do Celery
CELERY_TASK_ROUTES = {
    'files.tasks.process_file': {'queue': 'files'},
    'records.tasks.validate_record': {'queue': 'records'},
    'records.tasks.generate_export': {'queue': 'exports'},
}

CELERY_TASK_DEFAULT_QUEUE = 'default'

CELERY_TASK_QUEUES = {
    'default': {},
    'files': {
        'exchange': 'files',
        'routing_key': 'files',
    },
    'records': {
        'exchange': 'records',
        'routing_key': 'records',
    },
    'exports': {
        'exchange': 'exports',
        'routing_key': 'exports',
    },
}

# Configurações de arquivos estáticos e mídia para produção
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'mediafiles')

# Configuração do S3 para armazenamento de arquivos em produção
if not DEBUG:
    AWS_ACCESS_KEY_ID = os.getenv('RAILWAY_VOLUME_ACCESS_KEY')
    AWS_SECRET_ACCESS_KEY = os.getenv('RAILWAY_VOLUME_SECRET_KEY')
    AWS_STORAGE_BUCKET_NAME = os.getenv('RAILWAY_VOLUME_NAME')
    AWS_S3_ENDPOINT_URL = os.getenv('RAILWAY_VOLUME_ENDPOINT')
    AWS_DEFAULT_ACL = 'private'
    AWS_S3_FILE_OVERWRITE = False
    
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage' 

# Adicionar configuração de logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
        'json': {
            'class': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs/app.log'),
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 5,
            'formatter': 'json'
        },
        'error_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs/error.log'),
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 5,
            'formatter': 'json'
        },
        'audit_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs/audit.log'),
            'maxBytes': 1024 * 1024 * 10,  # 10 MB
            'backupCount': 5,
            'formatter': 'json'
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['error_file'],
            'level': 'ERROR',
            'propagate': False,
        },
        'celery': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'audit': {
            'handlers': ['audit_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        }
    }
} 

# Configurações do Spectacular
SPECTACULAR_SETTINGS = {
    'TITLE': 'Sistema de Gestão de Registros API',
    'DESCRIPTION': '''
    API para gerenciamento de arquivos e registros com suporte a:
    * Upload e processamento de arquivos
    * Validação de registros
    * Exportação de dados
    * Notificações em tempo real
    * Configurações dinâmicas
    ''',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayOperationId': True,
    },
    'TAGS': [
        {'name': 'auth', 'description': 'Endpoints de autenticação'},
        {'name': 'files', 'description': 'Gerenciamento de arquivos'},
        {'name': 'records', 'description': 'Gerenciamento de registros'},
        {'name': 'settings', 'description': 'Configurações do sistema'},
        {'name': 'notifications', 'description': 'Sistema de notificações'},
    ],
    'SECURITY': [
        {'Bearer': []}
    ],
} 

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'PARSER_CLASS': 'redis.connection.HiredisParser',
            'CONNECTION_POOL_CLASS': 'redis.BlockingConnectionPool',
            'CONNECTION_POOL_CLASS_KWARGS': {
                'max_connections': 50,
                'timeout': 20,
            }
        }
    }
}

# Usar cache para sessões
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# Cache para DRF
REST_FRAMEWORK['DEFAULT_THROTTLE_CLASSES'] = [
    'rest_framework.throttling.AnonRateThrottle',
    'rest_framework.throttling.UserRateThrottle'
]
REST_FRAMEWORK['DEFAULT_THROTTLE_RATES'] = {
    'anon': '100/hour',
    'user': '1000/hour'
} 

# Configuração do Elasticsearch
ELASTICSEARCH_DSL = {
    'default': {
        'hosts': os.getenv('ELASTICSEARCH_HOSTS', 'localhost:9200')
    },
}

# Configurações do documento
ELASTICSEARCH_DSL_INDEX_SETTINGS = {
    'number_of_shards': 1,
    'number_of_replicas': 0
} 

# Configurações de autenticação
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Configurações do JWT mais robustas
SIMPLE_JWT.update({
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
})

# Configurações de segurança
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY' 

# Configuração do ASGI
ASGI_APPLICATION = 'core.asgi.application'

# Configuração do Channel Layers
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [os.getenv('REDIS_URL', 'redis://localhost:6379/2')],
        },
    },
} 

# Configuração do Sentry
if not DEBUG:
    sentry_sdk.init(
        dsn="sua-dsn-do-sentry",
        integrations=[DjangoIntegration()],
        traces_sample_rate=1.0,
        send_default_pii=True
    ) 

# Security settings
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://seu-dominio.com"
]
CORS_ALLOW_CREDENTIALS = True

# Rate limiting
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day'
    }
} 

# Configurar Celery
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_RESULT_EXTENDED = True
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60 