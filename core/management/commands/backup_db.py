from django.core.management.base import BaseCommand
from django.conf import settings
import boto3
import os
from datetime import datetime
import subprocess

class Command(BaseCommand):
    help = 'Realiza backup do banco de dados e arquivos'

    def handle(self, *args, **options):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Backup do banco
        db_settings = settings.DATABASES['default']
        backup_file = f'backup_{timestamp}.sql'
        
        subprocess.run([
            'pg_dump',
            f'--dbname=postgresql://{db_settings["USER"]}:{db_settings["PASSWORD"]}@{db_settings["HOST"]}:{db_settings["PORT"]}/{db_settings["NAME"]}',
            '-F', 'c',
            '-f', backup_file
        ])
        
        # Backup de arquivos
        files_backup = f'files_{timestamp}.tar.gz'
        subprocess.run([
            'tar', 'czf', files_backup, settings.MEDIA_ROOT
        ])
        
        # Upload para S3
        s3 = boto3.client('s3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        
        for file in [backup_file, files_backup]:
            s3.upload_file(
                file,
                settings.AWS_STORAGE_BUCKET_NAME,
                f'backups/{file}'
            )
            os.remove(file) 