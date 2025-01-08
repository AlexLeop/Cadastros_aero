from .settings import *

DEBUG = False
ALLOWED_HOSTS = ['*.railway.app']

# Configurações de segurança
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Configuração do S3/Railway Volume
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'

AWS_ACCESS_KEY_ID = os.getenv('RAILWAY_VOLUME_ACCESS_KEY')
AWS_SECRET_ACCESS_KEY = os.getenv('RAILWAY_VOLUME_SECRET_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('RAILWAY_VOLUME_NAME')
AWS_S3_ENDPOINT_URL = os.getenv('RAILWAY_VOLUME_ENDPOINT')
AWS_DEFAULT_ACL = None
AWS_QUERYSTRING_AUTH = False

# Configurações de logging em produção
LOGGING['handlers']['file']['filename'] = '/app/logs/app.log'
LOGGING['handlers']['elasticsearch']['hosts'] = [os.getenv('ELASTICSEARCH_HOSTS')] 