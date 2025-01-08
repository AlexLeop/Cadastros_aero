from django.db import models
from django.core.cache import cache
from django.core.exceptions import ValidationError
import json

class Setting(models.Model):
    KEY_CHOICES = [
        ('file_types', 'Tipos de arquivo permitidos'),
        ('max_file_size', 'Tamanho máximo de arquivo (MB)'),
        ('validation_rules', 'Regras de validação'),
        ('notification_channels', 'Canais de notificação'),
        ('export_formats', 'Formatos de exportação'),
    ]
    
    TYPE_CHOICES = [
        ('string', 'Texto'),
        ('integer', 'Número inteiro'),
        ('float', 'Número decimal'),
        ('boolean', 'Booleano'),
        ('json', 'JSON'),
        ('list', 'Lista'),
    ]
    
    key = models.CharField(max_length=50, choices=KEY_CHOICES, unique=True)
    value = models.TextField()
    value_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def clean(self):
        try:
            self.get_typed_value()
        except Exception as e:
            raise ValidationError(f'Valor inválido para o tipo {self.value_type}: {str(e)}')
    
    def get_typed_value(self):
        if self.value_type == 'string':
            return self.value
        elif self.value_type == 'integer':
            return int(self.value)
        elif self.value_type == 'float':
            return float(self.value)
        elif self.value_type == 'boolean':
            return self.value.lower() == 'true'
        elif self.value_type == 'json':
            return json.loads(self.value)
        elif self.value_type == 'list':
            return [x.strip() for x in self.value.split(',')]
    
    def save(self, *args, **kwargs):
        # Validar valor antes de salvar
        self.full_clean()
        super().save(*args, **kwargs)
        
        # Limpar cache
        cache_key = f'setting_{self.key}'
        cache.delete(cache_key)
    
    @classmethod
    def get_setting(cls, key, default=None):
        cache_key = f'setting_{key}'
        value = cache.get(cache_key)
        
        if value is None:
            try:
                setting = cls.objects.get(key=key)
                value = setting.get_typed_value()
                cache.set(cache_key, value)
            except cls.DoesNotExist:
                value = default
        
        return value
    
    class Meta:
        ordering = ['key']
        verbose_name = 'Configuração'
        verbose_name_plural = 'Configurações' 