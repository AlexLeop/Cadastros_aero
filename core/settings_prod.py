from .settings import *
import dj_database_url

DEBUG = False
ALLOWED_HOSTS = ['*.railway.app']

# Database
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL'),
        conn_max_age=600
    )
}

# Redis
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Celery
CELERY_BROKER_URL = os.getenv('REDIS_URL')
CELERY_RESULT_BACKEND = os.getenv('REDIS_URL')

# Storage
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'

AWS_ACCESS_KEY_ID = os.getenv('RAILWAY_VOLUME_ACCESS_KEY')
AWS_SECRET_ACCESS_KEY = os.getenv('RAILWAY_VOLUME_SECRET_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('RAILWAY_VOLUME_NAME')
AWS_S3_ENDPOINT_URL = os.getenv('RAILWAY_VOLUME_ENDPOINT')
AWS_DEFAULT_ACL = None
AWS_QUERYSTRING_AUTH = False

# Security
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Logging
LOGGING['handlers']['file']['filename'] = '/app/logs/app.log'
LOGGING['handlers']['elasticsearch']['hosts'] = [os.getenv('ELASTICSEARCH_HOSTS')] 