import logging
from functools import wraps
from celery.signals import task_prerun, task_postrun, task_failure
from django.utils import timezone
from notifications.models import Notification
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration
import os

logger = logging.getLogger('celery')

def monitor_task(task_func):
    @wraps(task_func)
    def wrapper(*args, **kwargs):
        start_time = timezone.now()
        task_name = task_func.__name__
        
        logger.info(f'Iniciando task {task_name}')
        try:
            result = task_func(*args, **kwargs)
            execution_time = (timezone.now() - start_time).total_seconds()
            
            logger.info(
                f'Task {task_name} concluída com sucesso em {execution_time:.2f}s'
            )
            return result
            
        except Exception as e:
            execution_time = (timezone.now() - start_time).total_seconds()
            logger.error(
                f'Erro na task {task_name} após {execution_time:.2f}s: {str(e)}'
            )
            raise
            
    return wrapper

@task_prerun.connect
def task_prerun_handler(sender=None, task_id=None, task=None, **kwargs):
    logger.info(f'Iniciando task {task.name} [{task_id}]')

@task_postrun.connect
def task_postrun_handler(sender=None, task_id=None, task=None, retval=None, state=None, **kwargs):
    logger.info(f'Task {task.name} [{task_id}] finalizada com status {state}')

@task_failure.connect
def task_failure_handler(sender=None, task_id=None, exception=None, **kwargs):
    logger.error(f'Task {sender.name} [{task_id}] falhou: {str(exception)}') 

def init_monitoring():
    sentry_sdk.init(
        dsn=os.getenv('SENTRY_DSN'),
        integrations=[
            DjangoIntegration(),
            CeleryIntegration(),
            RedisIntegration(),
        ],
        traces_sample_rate=1.0,
        send_default_pii=True,
        environment=os.getenv('ENVIRONMENT', 'production')
    ) 