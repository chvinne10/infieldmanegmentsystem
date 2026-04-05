"""
Views for Notifications app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.tasks.models import Notification
from apps.tasks.serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for notification management.
    
    Endpoints:
    - GET /api/notifications/ - List notifications
    - GET /api/notifications/{id}/ - Get notification details
    - PUT /api/notifications/{id}/ - Mark as read
    - GET /api/notifications/unread/ - Get unread notifications
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        """Get notifications for current user."""
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """
        Get unread notifications.
        
        GET /api/notifications/unread/
        """
        notifications = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(notifications, many=True)
        return Response({
            'count': notifications.count(),
            'results': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Mark notification as read.
        
        POST /api/notifications/{id}/mark-as-read/
        """
        notification = self.get_object()
        notification.mark_as_read()
        
        serializer = self.get_serializer(notification)
        return Response({
            'message': 'Notification marked as read',
            'notification': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """
        Mark all notifications as read.
        
        POST /api/notifications/mark-all-as-read/
        """
        notifications = self.get_queryset().filter(is_read=False)
        notifications.update(is_read=True)
        
        return Response({
            'message': f'{notifications.count()} notifications marked as read'
        })
    
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """
        Delete all notifications for current user.
        
        DELETE /api/notifications/clear-all/
        """
        self.get_queryset().delete()
        
        return Response({
            'message': 'All notifications cleared'
        })
