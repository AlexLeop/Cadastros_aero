from rest_framework import viewsets, parsers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import File
from .serializers import FileSerializer
from .tasks import process_file
from records.tasks import validate_file_records
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)

    def perform_create(self, serializer):
        file_obj = serializer.save(uploaded_by=self.request.user)
        process_file.delay(file_obj.id)

    @extend_schema(
        summary='Upload de arquivo',
        description='Faz upload de um arquivo para processamento',
        request={
            'multipart/form-data': {
                'type': 'object',
                'properties': {
                    'file': {'type': 'string', 'format': 'binary'},
                    'original_name': {'type': 'string'},
                    'file_type': {'type': 'string'},
                },
                'required': ['file']
            }
        },
        responses={201: FileSerializer},
        examples=[
            OpenApiExample(
                'Sucesso',
                value={
                    'id': 1,
                    'file': '/media/files/example.csv',
                    'original_name': 'example.csv',
                    'file_type': '.csv',
                    'status': 'pending',
                    'created_at': '2024-01-01T00:00:00Z'
                }
            )
        ]
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary='Status do processamento',
        description='Retorna o status atual do processamento do arquivo',
        responses={200: {
            'type': 'object',
            'properties': {
                'status': {'type': 'string'},
                'total_records': {'type': 'integer'},
                'processed_records': {'type': 'integer'},
                'error_message': {'type': 'string', 'nullable': True}
            }
        }}
    )
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        file_obj = self.get_object()
        return Response({
            'status': file_obj.status,
            'total_records': file_obj.total_records,
            'processed_records': file_obj.processed_records,
            'error_message': file_obj.error_message
        })

    @action(detail=True, methods=['post'])
    def validate_records(self, request, pk=None):
        file_obj = self.get_object()
        validate_file_records.delay(file_obj.id)
        return Response({'status': 'Validação iniciada'}) 