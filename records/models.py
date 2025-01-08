from django.db import models
from users.models import User
from files.models import File

class Record(models.Model):
    """
    Modelo para armazenar registros extraídos de arquivos.
    
    Attributes:
        file (File): Arquivo de origem do registro
        row_number (int): Número da linha no arquivo original
        data (JSONField): Dados extraídos do registro
        status (str): Status atual do registro (pending, validated, error)
        error_message (str): Mensagem de erro, se houver
        created_by (User): Usuário que criou o registro
        created_at (datetime): Data de criação
        updated_at (datetime): Data da última atualização
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('validated', 'Validado'),
        ('error', 'Erro'),
    ]
    
    file = models.ForeignKey(
        'files.File',
        on_delete=models.CASCADE,
        help_text='Arquivo de origem do registro'
    )
    data = models.JSONField()  # Armazena os dados extraídos em formato JSON
    row_number = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['file', 'row_number']
        unique_together = ['file', 'row_number'] 