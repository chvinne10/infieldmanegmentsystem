"""
User models for authentication and user management.
"""
from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    """Extended User model with additional fields."""
    
    ROLE_CHOICES = [
        ('employee', 'Sales/Marketing Employee'),
        ('manager', 'Manager'),
        ('admin', 'Administrator'),
    ]
    
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='employee'
    )
    profile_image = models.ImageField(
        upload_to='profile_images/',
        blank=True,
        null=True
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Firebase FCM token for push notifications
    fcm_token = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"
    
    def is_manager(self):
        """Check if user is a manager."""
        return self.role in ['manager', 'admin']
    
    def is_employee(self):
        """Check if user is an employee."""
        return self.role == 'employee'
