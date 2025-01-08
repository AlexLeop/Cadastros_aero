from rest_framework import permissions

class RoleBasedPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Verificar se o usuário está autenticado
        if not request.user.is_authenticated:
            return False
            
        # Definir permissões baseadas em roles
        if request.user.role == 'admin':
            return True
            
        if request.user.role == 'manager':
            if view.action in ['create', 'update', 'partial_update']:
                return True
            return view.action in ['list', 'retrieve']
            
        if request.user.role == 'operator':
            if view.action in ['create']:
                return True
            return view.action in ['list', 'retrieve']
            
        # Visualizador tem apenas acesso de leitura
        return view.action in ['list', 'retrieve']

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Admins podem fazer tudo
        if request.user.role == 'admin':
            return True
            
        # Verificar se o usuário é o proprietário
        return obj.created_by == request.user 