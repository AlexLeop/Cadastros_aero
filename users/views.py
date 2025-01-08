from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer, CustomTokenObtainPairSerializer
from django.utils import timezone
from datetime import timedelta

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        # Verificar se o usuário está bloqueado
        username = request.data.get('username')
        try:
            user = User.objects.get(username=username)
            if user.is_locked:
                return Response(
                    {'error': 'Conta bloqueada. Contate o administrador.'},
                    status=403
                )
        except User.DoesNotExist:
            pass
            
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Login bem-sucedido
            user.reset_failed_attempts()
            user.last_login = timezone.now()
            user.save()
        else:
            # Login falhou
            if user:
                user.increment_failed_attempts()
                
        return response

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not user.check_password(old_password):
            return Response(
                {'error': 'Senha atual incorreta'},
                status=400
            )
            
        # Verificar se a nova senha é diferente das últimas 3
        if PasswordHistory.is_password_used(user, new_password):
            return Response(
                {'error': 'Nova senha não pode ser igual às últimas 3 senhas'},
                status=400
            )
            
        user.set_password(new_password)
        user.last_password_change = timezone.now()
        user.save()
        
        # Registrar nova senha no histórico
        PasswordHistory.objects.create(
            user=user,
            password=make_password(new_password)
        )
        
        return Response({'message': 'Senha alterada com sucesso'})

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data) 