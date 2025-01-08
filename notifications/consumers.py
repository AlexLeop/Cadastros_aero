import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Notification

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']
        if not user.is_authenticated:
            await self.close()
            return
            
        # Criar grupo único para o usuário
        self.group_name = f'user_{user.id}_notifications'
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        
        # Enviar notificações não lidas
        notifications = await self.get_unread_notifications(user)
        if notifications:
            await self.send(text_data=json.dumps({
                'type': 'unread_notifications',
                'notifications': notifications
            }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')
        
        if action == 'mark_read':
            notification_id = data.get('notification_id')
            await self.mark_notification_read(notification_id)
            
            await self.send(text_data=json.dumps({
                'type': 'notification_updated',
                'notification_id': notification_id,
                'status': 'read'
            }))

    async def notification(self, event):
        # Enviar notificação para o WebSocket
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'notification': event['notification']
        }))

    @database_sync_to_async
    def get_unread_notifications(self, user):
        return list(
            Notification.objects.filter(
                user=user,
                read=False
            ).values()
        )

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        notification = Notification.objects.get(id=notification_id)
        notification.read = True
        notification.save() 