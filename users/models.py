from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class Roles(models.TextChoices):
        ADMIN = 'admin', _('Administrador')
        MANAGER = 'manager', _('Gerente')
        OPERATOR = 'operator', _('Operador')
        VIEWER = 'viewer', _('Visualizador')
    
    role = models.CharField(
        max_length=20,
        choices=Roles.choices,
        default=Roles.VIEWER
    )
    
    last_password_change = models.DateTimeField(auto_now_add=True)
    failed_login_attempts = models.PositiveIntegerField(default=0)
    is_locked = models.BooleanField(default=False)
    
    def increment_failed_attempts(self):
        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.is_locked = True
        self.save()
    
    def reset_failed_attempts(self):
        self.failed_login_attempts = 0
        self.is_locked = False
        self.save() 