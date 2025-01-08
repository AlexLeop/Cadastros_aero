from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Record
from .serializers import RecordSerializer, RecordSerializerV1, RecordSerializerV2
from django.db import models
from .tasks import generate_export
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie
from django.core.cache import cache
from elasticsearch_dsl import Q
from .documents import RecordDocument
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from core.versioning import CustomVersioning

class RecordViewSet(viewsets.ModelViewSet):
    queryset = Record.objects.all()
    versioning_class = CustomVersioning
    
    def get_serializer_class(self):
        if self.request.version == '1':
            return RecordSerializerV1
        return RecordSerializerV2
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'file']
    search_fields = ['data']
    ordering_fields = ['created_at', 'updated_at', 'row_number']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @extend_schema(
        summary="Listar registros",
        description="Retorna uma lista paginada de registros com suporte a filtros e busca.",
        parameters=[
            OpenApiParameter(
                name="status",
                type=str,
                description="Filtrar por status (pending, validated, error)",
                required=False
            ),
            OpenApiParameter(
                name="search",
                type=str,
                description="Busca textual nos campos dos registros",
                required=False
            ),
        ],
        responses={
            200: RecordSerializer(many=True),
            401: None,
            403: None
        },
        tags=["records"]
    )
    @method_decorator(cache_page(60 * 15))  # Cache por 15 minutos
    @method_decorator(vary_on_cookie)
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        summary='Criar registro',
        description='Cria um novo registro e inicia o processo de validação',
        request=RecordSerializer,
        responses={
            201: RecordSerializer,
            400: None,
            401: None,
            403: None,
        },
        examples=[
            OpenApiExample(
                'Exemplo válido',
                value={
                    'file': 1,
                    'row_number': 1,
                    'data': {
                        'nome': 'João Silva',
                        'cpf': '123.456.789-00',
                        'data_nascimento': '1990-01-01'
                    }
                }
            )
        ]
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        summary='Estatísticas',
        description='Retorna estatísticas dos registros',
        responses={
            200: inline_serializer(
                name='StatisticsResponse',
                fields={
                    'total_records': serializers.IntegerField(),
                    'by_status': serializers.ListField(
                        child=serializers.DictField()
                    )
                }
            )
        }
    )
    @method_decorator(cache_page(60 * 60))  # Cache por 1 hora
    @method_decorator(vary_on_cookie)
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        cache_key = f'record_stats_{request.user.id}'
        stats = cache.get(cache_key)
        
        if not stats:
            total_records = Record.objects.count()
            by_status = Record.objects.values('status').annotate(
                count=models.Count('id')
            )
            
            stats = {
                'total_records': total_records,
                'by_status': list(by_status)
            }
            cache.set(cache_key, stats, timeout=60 * 60)  # Cache por 1 hora
        
        return Response(stats)

    @action(detail=False, methods=['post'])
    def export(self, request):
        """
        Endpoint para exportar registros filtrados
        """
        format_type = request.data.get('format', 'xlsx')
        if format_type not in ['xlsx', 'csv']:
            return Response(
                {'error': 'Formato inválido. Use xlsx ou csv.'},
                status=400
            )

        # Construir filtros a partir dos parâmetros
        filters = {}
        if 'status' in request.data:
            filters['status'] = request.data['status']
        if 'date_from' in request.data:
            filters['created_at__gte'] = request.data['date_from']
        if 'date_to' in request.data:
            filters['created_at__lte'] = request.data['date_to']
        if 'file_id' in request.data:
            filters['file_id'] = request.data['file_id']

        # Iniciar task de exportação
        task = generate_export.delay(filters, format_type, request.user.id)

        return Response({
            'message': 'Exportação iniciada. Você receberá uma notificação quando estiver pronta.',
            'task_id': task.id
        })

    @action(detail=False, methods=['post'])
    def search(self, request):
        """
        Busca avançada em registros usando Elasticsearch
        """
        query = request.data.get('query', '')
        filters = request.data.get('filters', {})
        
        # Construir query do Elasticsearch
        search = RecordDocument.search()
        
        # Aplicar filtros
        if filters:
            for field, value in filters.items():
                if field == 'date_range':
                    search = search.filter('range', created_at={
                        'gte': value['start'],
                        'lte': value['end']
                    })
                elif field == 'status':
                    search = search.filter('terms', status=value)
                elif field == 'file':
                    search = search.filter('term', file__id=value)
        
        # Aplicar busca em texto
        if query:
            search = search.query(Q(
                'multi_match',
                query=query,
                fields=['data.*', 'file.original_name', 'error_message']
            ))
        
        # Executar busca
        response = search.execute()
        
        # Formatar resultados
        results = []
        for hit in response:
            result = {
                'id': hit.id,
                'status': hit.status,
                'data': hit.data,
                'file': {
                    'id': hit.file.id,
                    'name': hit.file.original_name
                },
                'created_at': hit.created_at,
                'score': hit.meta.score
            }
            results.append(result)
        
        return Response({
            'total': response.hits.total.value,
            'results': results
        }) 