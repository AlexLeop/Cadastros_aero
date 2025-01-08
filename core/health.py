from django.http import HttpResponse

def health_check(request):
    """
    Endpoint simples para healthcheck
    """
    return HttpResponse("OK", status=200) 