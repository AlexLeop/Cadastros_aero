from django.http import JsonResponse
from django.db import connections
from django.db.utils import OperationalError
from redis import Redis
from elasticsearch import Elasticsearch
import os

def health_check(request):
    checks = {
        'database': check_database(),
        'redis': check_redis(),
        'elasticsearch': check_elasticsearch(),
        'storage': check_storage()
    }
    
    status = 200 if all(checks.values()) else 503
    return JsonResponse({'status': 'healthy' if status == 200 else 'unhealthy', 'checks': checks}, status=status)

def check_database():
    try:
        connections['default'].cursor()
        return True
    except OperationalError:
        return False

def check_redis():
    try:
        redis = Redis.from_url(os.getenv('REDIS_URL'))
        return redis.ping()
    except:
        return False

def check_elasticsearch():
    try:
        es = Elasticsearch(os.getenv('ELASTICSEARCH_HOSTS'))
        return es.ping()
    except:
        return False

def check_storage():
    try:
        import boto3
        s3 = boto3.client('s3',
            endpoint_url=os.getenv('RAILWAY_VOLUME_ENDPOINT'),
            aws_access_key_id=os.getenv('RAILWAY_VOLUME_ACCESS_KEY'),
            aws_secret_access_key=os.getenv('RAILWAY_VOLUME_SECRET_KEY')
        )
        s3.list_buckets()
        return True
    except:
        return False 