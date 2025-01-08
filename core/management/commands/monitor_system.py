from django.core.management.base import BaseCommand
from django.db import connection
from django.core.cache import cache
from django.conf import settings
import psutil
import redis
import logging

logger = logging.getLogger('django')

class Command(BaseCommand):
    help = 'Monitora recursos do sistema e performance'

    def handle(self, *args, **options):
        # Verificar CPU e memória
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        
        # Verificar conexões do banco de dados
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT count(*) 
                FROM pg_stat_activity 
                WHERE datname = current_database()
            """)
            active_connections = cursor.fetchone()[0]
        
        # Verificar Redis
        redis_client = redis.from_url(settings.CELERY_BROKER_URL)
        redis_info = redis_client.info()
        
        # Registrar métricas
        logger.info(f"""
            Métricas do Sistema:
            - CPU: {cpu_percent}%
            - Memória: {memory.percent}%
            - Conexões DB: {active_connections}
            - Conexões Redis: {redis_info['connected_clients']}
            - Memória Redis: {redis_info['used_memory_human']}
        """)
        
        # Alertar se houver problemas
        if cpu_percent > 80:
            logger.warning('CPU em uso elevado!')
        if memory.percent > 80:
            logger.warning('Memória em uso elevado!')
        if active_connections > 100:
            logger.warning('Muitas conexões de banco ativas!') 