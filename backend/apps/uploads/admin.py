"""
Admin configuration for Uploads app.
"""
from django.contrib import admin
from .models import ScheduleUpload, OCRResult


@admin.register(ScheduleUpload)
class ScheduleUploadAdmin(admin.ModelAdmin):
    """Admin interface for ScheduleUpload model."""
    
    list_display = ['file_name', 'uploaded_by', 'status', 'parsed_tasks_count', 'created_at']
    list_filter = ['status', 'created_at', 'mime_type']
    search_fields = ['file_name', 'uploaded_by__username', 'extracted_text']
    readonly_fields = ['file_size', 'mime_type', 'created_at', 'processed_at']
    
    fieldsets = (
        ('Upload Information', {
            'fields': ('uploaded_by', 'image', 'file_name', 'file_size', 'mime_type')
        }),
        ('Processing', {
            'fields': ('status', 'extracted_text', 'parsed_tasks_count', 'error_message')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'processed_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(OCRResult)
class OCRResultAdmin(admin.ModelAdmin):
    """Admin interface for OCRResult model."""
    
    list_display = ['upload', 'confidence', 'processing_time', 'created_at']
    list_filter = ['created_at', 'confidence']
    search_fields = ['upload__file_name', 'raw_text']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('OCR Data', {
            'fields': ('upload', 'raw_text', 'confidence')
        }),
        ('Metadata', {
            'fields': ('processing_time', 'tesseract_version', 'language_detected', 'created_at')
        }),
    )
