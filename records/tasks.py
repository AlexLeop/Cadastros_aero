from celery import shared_task
from django.db import transaction
from .models import Record
from notifications.models import Notification
import csv
import xlsxwriter
from io import BytesIO
from django.core.files.base import ContentFile
from django.utils import timezone
from core.decorators import cache_function

@shared_task
@cache_function(timeout=60 * 5)  # Cache por 5 minutos
def validate_record(record_id):
    try:
        record = Record.objects.get(id=record_id)
        
        # Implementar regras de validação específicas aqui
        validation_rules = {
            'required_fields': ['nome', 'cpf', 'data_nascimento'],
            'cpf_format': r'^\d{3}\.\d{3}\.\d{3}-\d{2}$',
            'date_format': r'^\d{4}-\d{2}-\d{2}$'
        }

        errors = []
        data = record.data

        # Verificar campos obrigatórios
        for field in validation_rules['required_fields']:
            if field not in data or not data[field]:
                errors.append(f'Campo obrigatório ausente: {field}')

        # Validar formato do CPF
        if 'cpf' in data:
            import re
            if not re.match(validation_rules['cpf_format'], data['cpf']):
                errors.append('Formato de CPF inválido')

        # Validar formato de data
        if 'data_nascimento' in data:
            if not re.match(validation_rules['date_format'], data['data_nascimento']):
                errors.append('Formato de data inválido')

        with transaction.atomic():
            if errors:
                record.status = 'error'
                record.error_message = '\n'.join(errors)
            else:
                record.status = 'validated'
                record.error_message = None
            
            record.save()

            # Criar notificação
            Notification.objects.create(
                user=record.created_by,
                title='Registro Validado',
                message=f'Registro {record.id} foi {"validado com sucesso" if not errors else "invalidado"}.',
                type='success' if not errors else 'error'
            )

    except Exception as e:
        # Em caso de erro inesperado
        record.status = 'error'
        record.error_message = f'Erro durante validação: {str(e)}'
        record.save()

        Notification.objects.create(
            user=record.created_by,
            title='Erro na Validação',
            message=f'Erro ao validar registro {record.id}: {str(e)}',
            type='error'
        )
        raise

@shared_task
def validate_file_records(file_id):
    from files.models import File
    
    try:
        file_obj = File.objects.get(id=file_id)
        records = Record.objects.filter(file=file_obj, status='pending')

        for record in records:
            validate_record.delay(record.id)

        Notification.objects.create(
            user=file_obj.uploaded_by,
            title='Validação Iniciada',
            message=f'A validação dos registros do arquivo {file_obj.original_name} foi iniciada.',
            type='info'
        )

    except Exception as e:
        Notification.objects.create(
            user=file_obj.uploaded_by,
            title='Erro na Validação',
            message=f'Erro ao iniciar validação dos registros: {str(e)}',
            type='error'
        )
        raise 

@shared_task
@cache_function(timeout=60 * 15)  # Cache por 15 minutos
def generate_export(filter_params, format_type, user_id):
    from users.models import User
    from files.models import File
    
    try:
        user = User.objects.get(id=user_id)
        records = Record.objects.filter(**filter_params)
        
        output = BytesIO()
        
        if format_type == 'xlsx':
            workbook = xlsxwriter.Workbook(output)
            worksheet = workbook.add_worksheet()
            
            # Escrever cabeçalhos
            headers = ['ID', 'Arquivo', 'Linha', 'Status', 'Data', 'Dados']
            for col, header in enumerate(headers):
                worksheet.write(0, col, header)
            
            # Escrever dados
            for row, record in enumerate(records, 1):
                worksheet.write(row, 0, record.id)
                worksheet.write(row, 1, record.file.original_name)
                worksheet.write(row, 2, record.row_number)
                worksheet.write(row, 3, record.status)
                worksheet.write(row, 4, record.created_at.strftime('%Y-%m-%d %H:%M:%S'))
                worksheet.write(row, 5, str(record.data))
            
            workbook.close()
            file_ext = '.xlsx'
            content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            
        elif format_type == 'csv':
            writer = csv.writer(output)
            writer.writerow(['ID', 'Arquivo', 'Linha', 'Status', 'Data', 'Dados'])
            
            for record in records:
                writer.writerow([
                    record.id,
                    record.file.original_name,
                    record.row_number,
                    record.status,
                    record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                    str(record.data)
                ])
            
            file_ext = '.csv'
            content_type = 'text/csv'
        
        # Criar arquivo de exportação
        output.seek(0)
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')
        filename = f'export_{timestamp}{file_ext}'
        
        export_file = File.objects.create(
            file=ContentFile(output.getvalue(), name=filename),
            original_name=filename,
            file_type=file_ext,
            uploaded_by=user,
            status='completed'
        )
        
        # Criar notificação
        Notification.objects.create(
            user=user,
            title='Exportação Concluída',
            message=f'Sua exportação foi concluída e está disponível para download.',
            type='success',
            data={'file_id': export_file.id}
        )
        
        return export_file.id
        
    except Exception as e:
        Notification.objects.create(
            user=user,
            title='Erro na Exportação',
            message=f'Ocorreu um erro durante a exportação: {str(e)}',
            type='error'
        )
        raise 