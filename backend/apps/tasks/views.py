"""
Views for Tasks app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from .models import Task, UpdateLog, Notification
from .serializers import (
    TaskSerializer,
    TaskDetailSerializer,
    TaskCreateUpdateSerializer,
    UpdateLogSerializer,
    NotificationSerializer,
    MarkTaskCompleteSerializer,
    RescheduleTaskSerializer,
    TaskStatsSerializer
)


class TaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for task management.
    
    Endpoints:
    - GET /api/tasks/ - List all tasks
    - POST /api/tasks/ - Create new task
    - GET /api/tasks/{id}/ - Get task details
    - PUT /api/tasks/{id}/ - Update task
    - DELETE /api/tasks/{id}/ - Delete task
    - GET /api/tasks/today/ - Get today's tasks
    - POST /api/tasks/{id}/mark-complete/ - Mark task as complete
    - POST /api/tasks/{id}/skip/ - Skip task
    - POST /api/tasks/{id}/reschedule/ - Reschedule task
    - GET /api/tasks/stats/ - Get task statistics
    """
    
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'priority', 'assigned_to', 'scheduled_time']
    search_fields = ['title', 'client_name', 'location']
    ordering_fields = ['scheduled_time', 'priority', 'status', 'created_at']
    ordering = ['scheduled_time']
    
    def get_queryset(self):
        """Get tasks based on user role."""
        user = self.request.user
        queryset = Task.objects.select_related('assigned_to', 'created_by')
        
        # Employees see only their own tasks
        if user.is_employee():
            queryset = queryset.filter(assigned_to=user)
        # Managers see all tasks
        # (no additional filter needed)
        
        return queryset
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'retrieve':
            return TaskDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        return TaskSerializer
    
    def perform_create(self, serializer):
        """Create task and log the action."""
        task = serializer.save(created_by=self.request.user)
        
        # Create update log
        UpdateLog.objects.create(
            task=task,
            action='created',
            performed_by=self.request.user,
            description=f'Task created: {task.title}'
        )
        
        # Create notification for assigned user
        if task.assigned_to != self.request.user:
            Notification.objects.create(
                user=task.assigned_to,
                task=task,
                notification_type='task_assigned',
                title='New Task Assigned',
                message=f'You have been assigned a task: {task.title}'
            )
    
    def perform_update(self, serializer):
        """Update task and log the changes."""
        task = serializer.save()
        
        # Create update log
        UpdateLog.objects.create(
            task=task,
            action='updated',
            performed_by=self.request.user,
            description=f'Task updated: {task.title}'
        )
        
        # Notify assigned user if updated by someone else
        if task.assigned_to != self.request.user:
            Notification.objects.create(
                user=task.assigned_to,
                task=task,
                notification_type='task_updated',
                title='Task Updated',
                message=f'Your task has been updated: {task.title}'
            )
    
    def perform_destroy(self, instance):
        """Delete task and log the action."""
        UpdateLog.objects.create(
            task=instance,
            action='deleted',
            performed_by=self.request.user,
            description=f'Task deleted: {instance.title}'
        )
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """
        Get tasks scheduled for today.
        
        GET /api/tasks/today/
        """
        today = timezone.now().date()
        queryset = self.get_queryset().filter(
            scheduled_time__date=today
        ).exclude(status__in=['completed', 'skipped'])
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })
    
    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        """
        Mark task as completed.
        
        POST /api/tasks/{id}/mark-complete/
        {
            "notes": "Optional completion notes"
        }
        """
        task = self.get_object()
        serializer = MarkTaskCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        task.mark_completed()
        
        # Add notes if provided
        if serializer.validated_data.get('notes'):
            task.notes = serializer.validated_data['notes']
            task.save()
        
        # Create update log
        UpdateLog.objects.create(
            task=task,
            action='completed',
            performed_by=request.user,
            description='Task marked as completed'
        )
        
        # Notify manager
        if task.created_by:
            Notification.objects.create(
                user=task.created_by,
                task=task,
                notification_type='task_completed',
                title='Task Completed',
                message=f'Task completed: {task.title}'
            )
        
        return Response({
            'message': 'Task marked as completed',
            'task': TaskSerializer(task).data
        })
    
    @action(detail=True, methods=['post'])
    def skip(self, request, pk=None):
        """
        Skip task.
        
        POST /api/tasks/{id}/skip/
        {
            "reason": "Optional reason for skipping"
        }
        """
        task = self.get_object()
        task.mark_skipped()
        
        # Create update log
        UpdateLog.objects.create(
            task=task,
            action='skipped',
            performed_by=request.user,
            description=f'Task skipped: {task.title}'
        )
        
        return Response({
            'message': 'Task marked as skipped',
            'task': TaskSerializer(task).data
        })
    
    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        """
        Reschedule task to a new time.
        
        POST /api/tasks/{id}/reschedule/
        {
            "scheduled_time": "2024-01-20T15:30:00Z",
            "reason": "Optional reason"
        }
        """
        task = self.get_object()
        serializer = RescheduleTaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        old_time = task.scheduled_time
        task.reschedule(serializer.validated_data['scheduled_time'])
        
        # Create update log
        UpdateLog.objects.create(
            task=task,
            action='rescheduled',
            performed_by=request.user,
            description=f'Task rescheduled from {old_time} to {task.scheduled_time}',
            old_value={'scheduled_time': str(old_time)},
            new_value={'scheduled_time': str(task.scheduled_time)}
        )
        
        return Response({
            'message': 'Task rescheduled successfully',
            'task': TaskSerializer(task).data
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get task statistics for current user.
        
        GET /api/tasks/stats/
        """
        queryset = self.get_queryset()
        
        stats = {
            'total_tasks': queryset.count(),
            'completed_tasks': queryset.filter(status='completed').count(),
            'pending_tasks': queryset.filter(status__in=['pending', 'in_progress']).count(),
            'overdue_tasks': queryset.filter(
                scheduled_time__lt=timezone.now(),
                status__in=['pending', 'in_progress']
            ).count(),
            'today_tasks': queryset.filter(
                scheduled_time__date=timezone.now().date()
            ).exclude(status__in=['completed', 'skipped']).count(),
        }
        
        serializer = TaskStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """
        Get overdue tasks.
        
        GET /api/tasks/overdue/
        """
        queryset = self.get_queryset().filter(
            scheduled_time__lt=timezone.now(),
            status__in=['pending', 'in_progress']
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })
