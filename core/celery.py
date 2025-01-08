import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('core')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Configurar tarefas periódicas
app.conf.beat_schedule = {
    'cleanup-old-files': {
        'task': 'files.tasks.cleanup_old_files',
        'schedule': crontab(hour=0, minute=0),  # Executar diariamente à meia-noite
    },
    'process-pending-records': {
        'task': 'records.tasks.process_pending_records',
        'schedule': crontab(minute='*/15'),  # Executar a cada 15 minutos
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 