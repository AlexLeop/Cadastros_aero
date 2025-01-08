from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import Record

@registry.register_document
class RecordDocument(Document):
    file = fields.ObjectField(properties={
        'id': fields.IntegerField(),
        'original_name': fields.KeywordField(),
    })
    
    data = fields.ObjectField()
    created_by = fields.ObjectField(properties={
        'id': fields.IntegerField(),
        'username': fields.KeywordField(),
    })
    
    class Index:
        name = 'records'
        settings = {
            'number_of_shards': 1,
            'number_of_replicas': 0
        }
        
    class Django:
        model = Record
        fields = [
            'id',
            'row_number',
            'status',
            'error_message',
            'created_at',
            'updated_at',
        ]
        
        related_models = ['file', 'created_by']
        
    def get_instances_from_related(self, related_instance):
        if isinstance(related_instance, Record.file.field.related_model):
            return related_instance.records.all()
        return [] 