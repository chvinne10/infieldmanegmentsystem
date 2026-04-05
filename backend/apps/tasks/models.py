"""
Task models for task management system.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Task(models.Model):
    """Model for managing daily tasks."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
        ('rescheduled', 'Rescheduled'),
        ('cancelled', 'Cancelled'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    # Basic fields
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Client information
    client_name = models.CharField(max_length=255)
    client_phone = models.CharField(max_length=20, blank=True)
    client_email = models.EmailField(blank=True)
    
    # Location
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Time fields
    scheduled_time = models.DateTimeField()
    completed_time = models.DateTimeField(null=True, blank=True)
    
    # Status and priority
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    
    # Assignment
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_tasks'
    )
    
    # Additional fields
    purpose = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    tags = models.CharField(max_length=255, blank=True)  # Comma-separated
    
    # Attachments
    attachment = models.FileField(
        upload_to='task_attachments/',
        blank=True,
        null=True
    )
    
    # Metadata
    is_recurring = models.BooleanField(default=False)
    recurrence_pattern = models.CharField(
        max_length=50,
        blank=True
    )  # daily, weekly, etc.
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['scheduled_time']
        indexes = [
            models.Index(fields=['assigned_to', 'status', 'scheduled_time']),
            models.Index(fields=['scheduled_time']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.client_name}"
    
    @property
    def is_today(self):
        """Check if task is scheduled for today."""
        return self.scheduled_time.date() == timezone.now().date()
    
    @property
    def is_overdue(self):
        """Check if task is overdue."""
        return self.scheduled_time < timezone.now() and self.status not in ['completed', 'skipped']
    
    def mark_completed(self):
        """Mark task as completed."""
        self.status = 'completed'
        self.completed_time = timezone.now()
        self.save()
    
    def mark_skipped(self):
        """Mark task as skipped."""
        self.status = 'skipped'
        self.save()
    
    def reschedule(self, new_time):
        """Reschedule task to a new time."""
        self.scheduled_time = new_time
        self.status = 'rescheduled'
        self.save()


class UpdateLog(models.Model):
    """Log entries for task updates (audit trail)."""
    
    ACTION_CHOICES = [
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('status_changed', 'Status Changed'),
        ('assigned', 'Assigned'),
        ('completed', 'Completed'),
        ('skipped', 'Skipped'),
        ('rescheduled', 'Rescheduled'),
        ('deleted', 'Deleted'),
    ]
    
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name='update_logs'
    )
    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES
    )
    performed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='update_logs'
    )
    description = models.TextField()
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['task', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.action} - {self.task.title} by {self.performed_by}"


class Notification(models.Model):
    """Notification model for task reminders."""
    
    NOTIFICATION_TYPE_CHOICES = [
        ('task_assigned', 'Task Assigned'),
        ('task_updated', 'Task Updated'),
        ('task_reminder', 'Task Reminder'),
        ('task_completed', 'Task Completed'),
        ('task_overdue', 'Task Overdue'),
        ('message', 'General Message'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPE_CHOICES
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['user', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.notification_type} - {self.user}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
