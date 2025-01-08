from django.core.exceptions import ValidationError
import re
from zxcvbn import zxcvbn

def validate_password_strength(password):
    result = zxcvbn(password)
    if result['score'] < 3:
        raise ValidationError(
            f"Senha muito fraca. Sugestões: {', '.join(result['feedback']['suggestions'])}"
        )

def validate_file_safety(file):
    # Verificar tamanho máximo
    if file.size > 10 * 1024 * 1024:  # 10MB
        raise ValidationError("Arquivo muito grande")
    
    # Verificar tipo de arquivo
    allowed_types = ['application/pdf', 'text/csv', 'application/vnd.ms-excel']
    if file.content_type not in allowed_types:
        raise ValidationError("Tipo de arquivo não permitido")
    
    # Verificar nome do arquivo
    if not re.match(r'^[\w\-. ]+$', file.name):
        raise ValidationError("Nome de arquivo inválido")

def sanitize_input(value):
    if isinstance(value, str):
        # Remover caracteres perigosos
        value = re.sub(r'[<>&;]', '', value)
        # Limitar tamanho
        value = value[:1000]
    return value

class SecurityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Verificar rate limiting por IP
        if not self.check_rate_limit(request):
            return HttpResponseTooManyRequests()
            
        # Sanitizar inputs
        request.GET = self.sanitize_querydict(request.GET)
        request.POST = self.sanitize_querydict(request.POST)
        
        response = self.get_response(request)
        
        # Adicionar headers de segurança
        response['Content-Security-Policy'] = "default-src 'self'"
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        
        return response 