import logging
import sys

# Configurar logging
logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('health_check')

def application(environ, start_response):
    """
    Servidor WSGI simples apenas para healthcheck
    """
    logger.info('Health check requested')
    status = '200 OK'
    response_headers = [('Content-type', 'text/plain')]
    start_response(status, response_headers)
    logger.info('Health check responding OK')
    return [b'OK'] 