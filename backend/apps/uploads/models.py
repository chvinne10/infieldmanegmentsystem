"""
Models for Uploads app - OCR and image processing.
"""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ScheduleUpload(models.Model):
    """Model for storing uploaded schedule images."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Processing'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='schedule_uploads'
    )
    image = models.ImageField(upload_to='schedules/%Y/%m/%d/')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    
    # Extracted data
    extracted_text = models.TextField(blank=True)
    parsed_tasks_count = models.IntegerField(default=0)
    
    # Error tracking
    error_message = models.TextField(blank=True)
    
    # Metadata
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()  # in bytes
    mime_type = models.CharField(max_length=50)
    
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['uploaded_by', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Schedule upload by {self.uploaded_by} - {self.file_name}"


class OCRResult(models.Model):
    """Model for storing raw OCR results."""
    
    upload = models.OneToOneField(
        ScheduleUpload,
        on_delete=models.CASCADE,
        related_name='ocr_result'
    )
    
    raw_text = models.TextField()
    confidence = models.FloatField(default=0.0)  # Confidence score
    processing_time = models.FloatField()  # in seconds
    
    # Metadata
    tesseract_version = models.CharField(max_length=50, blank=True)
    language_detected = models.CharField(max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"OCR Result for {self.upload.file_name}"
