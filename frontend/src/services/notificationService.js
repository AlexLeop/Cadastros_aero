import axiosInstance from './axiosConfig';

class NotificationService {
  constructor() {
    this.socket = null;
    this.callbacks = new Set();
  }

  connect() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.socket = new WebSocket(
      `${process.env.REACT_APP_WS_URL}/ws/notifications/`
    );

    this.socket.onopen = () => {
      console.log('WebSocket conectado');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleNotification(data);
    };

    this.socket.onclose = () => {
      console.log('WebSocket desconectado');
      // Tentar reconectar após 5 segundos
      setTimeout(() => this.connect(), 5000);
    };
  }

  handleNotification(data) {
    switch (data.type) {
      case 'new_notification':
        this.notifyCallbacks(data.notification);
        break;
      case 'unread_notifications':
        data.notifications.forEach(notification => 
          this.notifyCallbacks(notification)
        );
        break;
      case 'notification_updated':
        // Atualizar estado da notificação
        break;
    }
  }

  subscribe(callback) {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  notifyCallbacks(notification) {
    this.callbacks.forEach(callback => callback(notification));
  }

  markAsRead(notificationId) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        action: 'mark_read',
        notification_id: notificationId
      }));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default new NotificationService(); 