from django.core.management.base import BaseCommand
from django_elasticsearch_dsl.registries import registry

class Command(BaseCommand):
    help = 'Reindexar documentos no Elasticsearch'

    def add_arguments(self, parser):
        parser.add_argument(
            '--models',
            nargs='+',
            type=str,
            help='Lista de modelos para reindexar (ex: records.Record)'
        )

    def handle(self, *args, **options):
        # Obter todos os documentos registrados
        documents = registry.get_documents()
        
        if options['models']:
            # Filtrar documentos pelos modelos especificados
            models = [m.split('.') for m in options['models']]
            documents = [
                d for d in documents
                if d._doc_type.model.__module__.split('.')[-2] == models[0][0]
                and d._doc_type.model.__name__ == models[0][1]
            ]
        
        # Reindexar cada documento
        for doc in documents:
            self.stdout.write(f'Reindexando {doc._doc_type.model.__name__}...')
            doc().update()
            self.stdout.write(
                self.style.SUCCESS(
                    f'{doc._doc_type.model.__name__} reindexado com sucesso!'
                )
            ) 