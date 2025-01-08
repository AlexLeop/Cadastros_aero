from django.contrib import admin
from django.urls import path, include
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)
from django.http import JsonResponse, HttpResponse
from .health import health_check

schema_view = get_schema_view(
    openapi.Info(
        title="Records API",
        default_version='v1',
        description="API para processamento de registros",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@records.local"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

def test_view(request):
    return HttpResponse("OK")

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    path('api/', include('records.urls')),
    path('api/', include('files.urls')),
    path('api/', include('settings.urls')),
    
    # Documentação
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0)),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0)),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/v1/', include('api.v1.urls')),
    path('api/v2/', include('api.v2.urls')),
    path('test/', test_view, name='test'),
] 