from django.utils.deprecation import MiddlewareMixin
from .models import Setting

class SettingsMiddleware(MiddlewareMixin):
    def process_template_response(self, request, response):
        if hasattr(response, 'data') and isinstance(response.data, dict):
            # Adicionar configurações públicas à resposta da API
            public_settings = {
                setting.key: setting.get_typed_value()
                for setting in Setting.objects.filter(is_public=True)
            }
            response.data['settings'] = public_settings
        return response 