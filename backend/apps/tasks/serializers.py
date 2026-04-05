"""
Serializers for Tasks app.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task, UpdateLog, Notification
from apps.users.serializers import UserSerializer

User = get_user_model()


class TaskSerializer(serializers.ModelSerializer):
    """Basic task serializer."""
    
    assigned_to_detail = UserSerializer(source='assigned_to', read_only=True)
    created_by_detail = UserSerializer(source='created_by', read_only=True)
    is_today = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'client_name', 'client_phone',
            'client_email', 'location', 'latitude', 'longitude',
            'scheduled_time', 'completed_time', 'status', 'priority',
            'assigned_to', 'assigned_to_detail', 'created_by', 'created_by_detail',
            'purpose', 'notes', 'tags', 'attachment', 'is_recurring',
            'recurrence_pattern', 'is_today', 'is_overdue', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_time']
    
    def get_is_today(self, obj):
        return obj.is_today
    
    def get_is_overdue(self, obj):
        return obj.is_overdue


class TaskDetailSerializer(TaskSerializer):
    """Detailed task serializer with related objects."""
    
    update_logs = serializers.SerializerMethodField()
    notifications = serializers.SerializerMethodField()
    
    class Meta(TaskSerializer.Meta):
        fields = TaskSerializer.Meta.fields + ['update_logs', 'notifications']
    
    def get_update_logs(self, obj):
        logs = obj.update_logs.all()[:10]  # Last 10 logs
        return UpdateLogSerializer(logs, many=True).data
    
    def get_notifications(self, obj):
        notifications = obj.notifications.all()[:5]
        return NotificationSerializer(notifications, many=True).data


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating tasks."""
    
    class Meta:
        model = Task
        fields = [
            'title', 'description', 'client_name', 'client_phone',
            'client_email', 'location', 'latitude', 'longitude',
            'scheduled_time', 'status', 'priority', 'assigned_to',
            'purpose', 'notes', 'tags', 'attachment', 'is_recurring',
            'recurrence_pattern'
        ]
    
    def validate_scheduled_time(self, value):
        """Validate scheduled time is in the future or today."""
        from django.utils import timezone
        if value < timezone.now():
            raise serializers.ValidationError(
                "Scheduled time cannot be in the past."
            )
        return value


class UpdateLogSerializer(serializers.ModelSerializer):
    """Serializer for UpdateLog model."""
    
    performed_by_detail = UserSerializer(source='performed_by', read_only=True)
    
    class Meta:
        model = UpdateLog
        fields = [
            'id', 'action', 'performed_by', 'performed_by_detail',
            'description', 'old_value', 'new_value', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    
    task_detail = TaskSerializer(source='task', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 'is_read',
            'is_sent', 'task', 'task_detail', 'created_at', 'read_at'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']


class MarkTaskCompleteSerializer(serializers.Serializer):
    """Serializer for marking task as complete."""
    
    notes = serializers.CharField(required=False, allow_blank=True)


class RescheduleTaskSerializer(serializers.Serializer):
    """Serializer for rescheduling task."""
    
    scheduled_time = serializers.DateTimeField(required=True)
    reason = serializers.CharField(required=False, allow_blank=True)


class TaskStatsSerializer(serializers.Serializer):
    """Serializer for task statistics."""
    
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    pending_tasks = serializers.IntegerField()
    overdue_tasks = serializers.IntegerField()
    today_tasks = serializers.IntegerField()
