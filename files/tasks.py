import pandas as pd
from celery import shared_task
from django.db import transaction
from .models import File
from records.models import Record
from notifications.models import Notification

@shared_task
def process_file(file_id):
    try:
        file_obj = File.objects.get(id=file_id)
        file_obj.status = 'processing'
        file_obj.save()

        # Determinar o tipo de arquivo e ler
        if file_obj.file_type in ['.xlsx', '.xls']:
            df = pd.read_excel(file_obj.file.path)
        elif file_obj.file_type == '.csv':
            df = pd.read_csv(file_obj.file.path)
        else:
            raise ValueError(f'Tipo de arquivo não suportado: {file_obj.file_type}')

        # Processar registros em lotes
        batch_size = 1000
        records_to_create = []
        
        for index, row in df.iterrows():
            record = Record(
                file=file_obj,
                row_number=index + 1,
                data=row.to_dict(),
                created_by=file_obj.uploaded_by
            )
            records_to_create.append(record)

            if len(records_to_create) >= batch_size:
                Record.objects.bulk_create(records_to_create)
                records_to_create = []

        # Criar registros restantes
        if records_to_create:
            Record.objects.bulk_create(records_to_create)

        # Atualizar status do arquivo
        file_obj.status = 'processed'
        file_obj.save()

        # Criar notificação
        Notification.objects.create(
            user=file_obj.uploaded_by,
            title='Arquivo Processado',
            message=f'O arquivo {file_obj.original_name} foi processado com sucesso.',
            type='success'
        )

    except Exception as e:
        # Em caso de erro, atualizar status e criar notificação
        file_obj.status = 'error'
        file_obj.error_message = str(e)
        file_obj.save()

        Notification.objects.create(
            user=file_obj.uploaded_by,
            title='Erro no Processamento',
            message=f'Erro ao processar o arquivo {file_obj.original_name}: {str(e)}',
            type='error'
        )
        raise 