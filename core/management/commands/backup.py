from django.core.management.base import BaseCommand
from django.conf import settings
import boto3
import os
from datetime import datetime

class Command(BaseCommand):
    help = 'Backup do banco de dados e arquivos'

    def handle(self, *args, **options):
        # Backup do banco
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f'backup_{timestamp}.dump'
        
        os.system(f'pg_dump {settings.DATABASES["default"]["NAME"]} > {backup_file}')
        
        # Upload para S3
        s3 = boto3.client('s3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        s3.upload_file(backup_file, settings.AWS_STORAGE_BUCKET_NAME, f'backups/{backup_file}')
        
        os.remove(backup_file) 