import os
from .settings import *
import dj_database_url

DEBUG = False
ALLOWED_HOSTS = ['*']

# Middleware mínimo
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware',
]

# Database
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///' + os.path.join(BASE_DIR, 'db.sqlite3'),
        conn_max_age=600
    )
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Security
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Secret key
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-default-secret-key-here') 