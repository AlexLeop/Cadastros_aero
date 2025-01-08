import os
from .settings import *
import dj_database_url

DEBUG = False
ALLOWED_HOSTS = ['*']

# Database
DATABASES = {
    'default': dj_database_url.config(conn_max_age=600)
}

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Security
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https') 