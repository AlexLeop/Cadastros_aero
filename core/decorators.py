from functools import wraps
from django.core.cache import cache
import hashlib
import json

def cache_function(timeout=300):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Criar chave única baseada nos argumentos
            cache_key = f"{func.__name__}:"
            args_key = hashlib.md5(
                json.dumps((args, kwargs), sort_keys=True).encode()
            ).hexdigest()
            cache_key += args_key

            # Tentar obter do cache
            result = cache.get(cache_key)
            if result is not None:
                return result

            # Executar função e armazenar no cache
            result = func(*args, **kwargs)
            cache.set(cache_key, result, timeout=timeout)
            return result
        return wrapper
    return decorator 