"""
Serializers for Uploads app.
"""
from rest_framework import serializers
from .models import ScheduleUpload, OCRResult


class OCRResultSerializer(serializers.ModelSerializer):
    """Serializer for OCR results."""
    
    class Meta:
        model = OCRResult
        fields = [
            'id', 'raw_text', 'confidence', 'processing_time',
            'tesseract_version', 'language_detected', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ScheduleUploadSerializer(serializers.ModelSerializer):
    """Serializer for schedule uploads."""
    
    ocr_result = OCRResultSerializer(read_only=True)
    uploaded_by_username = serializers.CharField(
        source='uploaded_by.username',
        read_only=True
    )
    
    class Meta:
        model = ScheduleUpload
        fields = [
            'id', 'image', 'status', 'extracted_text', 'parsed_tasks_count',
            'error_message', 'file_name', 'file_size', 'mime_type',
            'uploaded_by', 'uploaded_by_username', 'ocr_result',
            'created_at', 'processed_at'
        ]
        read_only_fields = [
            'id', 'status', 'extracted_text', 'parsed_tasks_count',
            'error_message', 'file_size', 'mime_type', 'uploaded_by',
            'ocr_result', 'created_at', 'processed_at'
        ]


class ScheduleUploadCreateSerializer(serializers.Serializer):
    """Serializer for uploading schedule images."""
    
    image = serializers.ImageField(required=True)
    description = serializers.CharField(required=False, allow_blank=True)
    
    def validate_image(self, value):
        """Validate image file."""
        # Check file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError(
                "Image file size should not exceed 10MB."
            )
        
        # Check file type
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/tiff']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                f"Allowed image types are: {', '.join(allowed_types)}"
            )
        
        return value


class ParsedTaskSerializer(serializers.Serializer):
    """Serializer for parsed tasks from OCR."""
    
    title = serializers.CharField()
    client_name = serializers.CharField()
    location = serializers.CharField(required=False)
    time = serializers.CharField(required=False)
    description = serializers.CharField(required=False)


class ScheduleParseResponseSerializer(serializers.Serializer):
    """Serializer for schedule parsing response."""
    
    upload_id = serializers.IntegerField()
    status = serializers.CharField()
    extracted_text = serializers.CharField()
    parsed_tasks = ParsedTaskSerializer(many=True)
    task_count = serializers.IntegerField()
    confidence = serializers.FloatField()
    processing_time = serializers.FloatField()
