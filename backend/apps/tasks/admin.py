"""
Admin configuration for Tasks app.
"""
from django.contrib import admin
from .models import Task, UpdateLog, Notification


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    """Admin interface for Task model."""
    
    list_display = ['title', 'client_name', 'assigned_to', 'status', 'priority', 'scheduled_time']
    list_filter = ['status', 'priority', 'scheduled_time', 'created_at']
    search_fields = ['title', 'client_name', 'location']
    readonly_fields = ['created_at', 'updated_at', 'completed_time']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'purpose')
        }),
        ('Client Details', {
            'fields': ('client_name', 'client_phone', 'client_email')
        }),
        ('Location', {
            'fields': ('location', 'latitude', 'longitude')
        }),
        ('Task Details', {
            'fields': ('status', 'priority', 'assigned_to', 'created_by')
        }),
        ('Time', {
            'fields': ('scheduled_time', 'completed_time')
        }),
        ('Additional', {
            'fields': ('notes', 'tags', 'attachment', 'is_recurring', 'recurrence_pattern')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UpdateLog)
class UpdateLogAdmin(admin.ModelAdmin):
    """Admin interface for UpdateLog model."""
    
    list_display = ['task', 'action', 'performed_by', 'created_at']
    list_filter = ['action', 'created_at']
    search_fields = ['task__title', 'performed_by__username']
    readonly_fields = ['created_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin interface for Notification model."""
    
    list_display = ['user', 'notification_type', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'title']
    readonly_fields = ['created_at', 'read_at']
