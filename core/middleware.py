import time
import logging
from django.db import connection
from django.conf import settings
from django.middleware.cache import UpdateCacheMiddleware, FetchFromCacheMiddleware
from django.utils.cache import get_cache_key, learn_cache_key
from django.core.cache import cache
from prometheus_client import Counter, Histogram
from django.utils import timezone

logger = logging.getLogger('django')

# Métricas do Prometheus
REQUEST_COUNT = Counter(
    'django_http_requests_total',
    'Total request count',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'django_http_request_duration_seconds',
    'Request latency in seconds',
    ['method', 'endpoint']
)

DB_QUERY_COUNT = Counter(
    'django_db_query_count_total',
    'Total database query count',
    ['view']
)

class PerformanceMonitoringMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        # Contar queries antes da view
        n_queries_before = len(connection.queries)
        
        response = self.get_response(request)
        
        # Calcular tempo de execução e queries
        execution_time = time.time() - start_time
        n_queries_after = len(connection.queries)
        n_queries = n_queries_after - n_queries_before
        
        # Registrar métricas se o tempo de execução for alto
        if execution_time > 0.5:  # 500ms
            logger.warning(
                f'Requisição lenta detectada: {request.path} - '
                f'Tempo: {execution_time:.2f}s, Queries: {n_queries}'
            )
            
            if settings.DEBUG:
                # Registrar queries em modo debug
                queries = connection.queries[n_queries_before:n_queries_after]
                logger.debug('Queries executadas:')
                for query in queries:
                    logger.debug(f"Time: {query['time']}, SQL: {query['sql']}")
        
        return response 

class CustomCacheMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.cache_middleware = UpdateCacheMiddleware(FetchFromCacheMiddleware(get_response))

    def __call__(self, request):
        # Não cachear para usuários autenticados
        if request.user.is_authenticated:
            return self.get_response(request)

        # Verificar se a requisição é cacheável
        if request.method not in ('GET', 'HEAD'):
            return self.get_response(request)

        # Tentar obter do cache
        cache_key = get_cache_key(request)
        if cache_key is None:
            response = self.get_response(request)
            return response

        response = cache.get(cache_key)
        if response is None:
            response = self.get_response(request)
            cache_timeout = settings.CACHE_MIDDLEWARE_SECONDS
            learn_cache_key(request, response, cache_timeout)
            cache.set(cache_key, response, cache_timeout)

        return response 

class SecurityHeadersMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Adicionar headers de segurança
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response['Content-Security-Policy'] = "default-src 'self'"
        
        return response 

class MonitoringMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = logging.getLogger('audit')

    def __call__(self, request):
        start_time = time.time()
        
        # Contar queries antes da view
        queries_before = len(connection.queries)
        
        response = self.get_response(request)
        
        # Calcular métricas
        duration = time.time() - start_time
        queries_after = len(connection.queries)
        queries_count = queries_after - queries_before
        
        # Registrar métricas no Prometheus
        endpoint = request.resolver_match.view_name if request.resolver_match else 'unknown'
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=endpoint,
            status=response.status_code
        ).inc()
        
        REQUEST_LATENCY.labels(
            method=request.method,
            endpoint=endpoint
        ).observe(duration)
        
        DB_QUERY_COUNT.labels(
            view=endpoint
        ).inc(queries_count)
        
        # Registrar log de auditoria para ações importantes
        if request.method in ['POST', 'PUT', 'DELETE']:
            self.logger.info(
                'Audit log',
                extra={
                    'user': request.user.username if request.user.is_authenticated else 'anonymous',
                    'method': request.method,
                    'path': request.path,
                    'status': response.status_code,
                    'duration': duration,
                    'queries': queries_count,
                    'ip': request.META.get('REMOTE_ADDR'),
                    'user_agent': request.META.get('HTTP_USER_AGENT')
                }
            )
        
        return response 

class AuditMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log antes da requisição
        start_time = timezone.now()
        
        response = self.get_response(request)
        
        # Log após a requisição
        if hasattr(request, 'user') and request.user.is_authenticated:
            logger.info(
                'Audit: %s %s %s %s %s',
                request.user.email,
                request.method,
                request.path,
                response.status_code,
                timezone.now() - start_time
            )
        
        return response 

class PerformanceMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration = time.time() - start_time

        if duration > 1.0:  # Log requisições lentas
            logger.warning(f'Requisição lenta: {request.path} ({duration:.2f}s)')

        return response 