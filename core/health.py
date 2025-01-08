from django.http import JsonResponse

def health_check(request):
    """
    Endpoint simples para verificar se a aplicação está rodando
    """
    return JsonResponse({
        'status': 'healthy',
        'message': 'Application is running'
    }) 