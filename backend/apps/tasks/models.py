from django.db import models
from django.conf import settings

class Task(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Skipped', 'Skipped'),
        ('Rescheduled', 'Rescheduled'),
    )

    client_name = models.CharField(max_length=255)
    location = models.CharField(max_length=500)
    time = models.CharField(max_length=100) # e.g., "3:00 PM"
    purpose = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client_name} - {self.location}"