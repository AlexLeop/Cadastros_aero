from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import SystemSettings, UserSettings
from .serializers import SystemSettingsSerializer, UserSettingsSerializer

class SettingsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get', 'patch'])
    def system(self, request):
        if not request.user.is_staff:
            return Response(
                {"detail": "Permissão negada"},
                status=403
            )

        settings = SystemSettings.objects.first()
        if not settings:
            settings = SystemSettings.objects.create()

        if request.method == 'PATCH':
            serializer = SystemSettingsSerializer(
                settings,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
        else:
            serializer = SystemSettingsSerializer(settings)

        return Response(serializer.data)

    @action(detail=False, methods=['get', 'patch'])
    def user(self, request):
        settings, _ = UserSettings.objects.get_or_create(user=request.user)

        if request.method == 'PATCH':
            serializer = UserSettingsSerializer(
                settings,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
        else:
            serializer = UserSettingsSerializer(settings)

        return Response(serializer.data) 