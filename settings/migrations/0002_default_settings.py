from django.db import migrations
import json

def create_default_settings(apps, schema_editor):
    Setting = apps.get_model('settings', 'Setting')
    
    default_settings = [
        {
            'key': 'file_types',
            'value': '.csv,.xlsx,.xls',
            'value_type': 'list',
            'description': 'Tipos de arquivo permitidos para upload',
            'is_public': True
        },
        {
            'key': 'max_file_size',
            'value': '10',
            'value_type': 'integer',
            'description': 'Tamanho máximo de arquivo em MB',
            'is_public': True
        },
        {
            'key': 'validation_rules',
            'value': json.dumps({
                'required_fields': ['nome', 'cpf', 'data_nascimento'],
                'cpf_format': r'^\d{3}\.\d{3}\.\d{3}-\d{2}$',
                'date_format': r'^\d{4}-\d{2}-\d{2}$'
            }),
            'value_type': 'json',
            'description': 'Regras de validação de registros',
            'is_public': False
        },
        {
            'key': 'notification_channels',
            'value': 'email,websocket',
            'value_type': 'list',
            'description': 'Canais ativos para notificações',
            'is_public': False
        },
        {
            'key': 'export_formats',
            'value': 'csv,xlsx',
            'value_type': 'list',
            'description': 'Formatos disponíveis para exportação',
            'is_public': True
        }
    ]
    
    for setting in default_settings:
        Setting.objects.get_or_create(
            key=setting['key'],
            defaults=setting
        )

class Migration(migrations.Migration):
    dependencies = [
        ('settings', '0001_initial'),
    ]
    
    operations = [
        migrations.RunPython(create_default_settings),
    ] 