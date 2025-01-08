import logging.config
import json
from pythonjsonlogger import jsonlogger
from elasticsearch import Elasticsearch

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        log_record['logger'] = record.name
        log_record['level'] = record.levelname
        log_record['timestamp'] = self.formatTime(record)

class ElasticsearchHandler(logging.Handler):
    def __init__(self, hosts):
        super().__init__()
        self.es = Elasticsearch(hosts)
        
    def emit(self, record):
        try:
            msg = self.format(record)
            self.es.index(
                index=f"logs-{record.levelname.lower()}",
                document=json.loads(msg)
            )
        except Exception:
            self.handleError(record)

LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': CustomJsonFormatter,
            'format': '%(timestamp)s %(level)s %(name)s %(message)s'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json'
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/app.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
            'formatter': 'json'
        },
        'elasticsearch': {
            '()': ElasticsearchHandler,
            'hosts': ['localhost:9200'],
            'formatter': 'json'
        }
    },
    'loggers': {
        '': {
            'handlers': ['console', 'file', 'elasticsearch'],
            'level': 'INFO'
        },
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False
        },
        'django.security': {
            'handlers': ['console', 'file', 'elasticsearch'],
            'level': 'WARNING',
            'propagate': False
        }
    }
}

logging.config.dictConfig(LOGGING_CONFIG) 