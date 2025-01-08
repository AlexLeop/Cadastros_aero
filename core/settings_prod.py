from .settings import *

DEBUG = False
ALLOWED_HOSTS = ['seu-dominio.railway.app']

# Configurações de segurança para produção
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Configuração do S3 para arquivos estáticos e mídia
AWS_ACCESS_KEY_ID = os.getenv('RAILWAY_VOLUME_ACCESS_KEY')
AWS_SECRET_ACCESS_KEY = os.getenv('RAILWAY_VOLUME_SECRET_KEY')
AWS_STORAGE_BUCKET_NAME = os.getenv('RAILWAY_VOLUME_NAME')
AWS_S3_ENDPOINT_URL = os.getenv('RAILWAY_VOLUME_ENDPOINT')
AWS_DEFAULT_ACL = 'private'
AWS_S3_FILE_OVERWRITE = False

DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage' 