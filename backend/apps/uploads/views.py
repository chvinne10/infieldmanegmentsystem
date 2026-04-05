"""
Views for Uploads app - OCR and schedule processing.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
import logging
from .models import ScheduleUpload, OCRResult
from .serializers import (
    ScheduleUploadSerializer,
    ScheduleUploadCreateSerializer,
    ScheduleParseResponseSerializer
)
from utils.ocr import (
    extract_text_from_image,
    preprocess_image,
    parse_tasks_from_text,
    generate_task_suggestions
)

logger = logging.getLogger(__name__)


class ScheduleUploadViewSet(viewsets.ModelViewSet):
    """
    ViewSet for schedule uploads and OCR processing.
    
    Endpoints:
    - POST /api/uploads/ - Upload a schedule image
    - GET /api/uploads/ - List uploads
    - GET /api/uploads/{id}/ - Get upload details
    - POST /api/uploads/{id}/process/ - Process upload with OCR
    - GET /api/uploads/{id}/tasks/ - Get suggested tasks
    """
    
    permission_classes = [IsAuthenticated]
    serializer_class = ScheduleUploadSerializer
    
    def get_queryset(self):
        """Get uploads for current user or all if manager."""
        user = self.request.user
        queryset = ScheduleUpload.objects.select_related('ocr_result')
        
        # Employees see only their own uploads
        if user.is_employee():
            queryset = queryset.filter(uploaded_by=user)
        # Managers see all uploads
        
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return ScheduleUploadCreateSerializer
        return ScheduleUploadSerializer
    
    def create(self, request, *args, **kwargs):
        """
        Handle image upload.
        
        POST /api/uploads/
        Form-data:
        {
            "image": <image file>,
            "description": "Optional description"
        }
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        image_file = serializer.validated_data['image']
        
        # Create upload record
        upload = ScheduleUpload.objects.create(
            uploaded_by=request.user,
            image=image_file,
            file_name=image_file.name,
            file_size=image_file.size,
            mime_type=image_file.content_type,
            status='pending'
        )
        
        # Return upload details
        response_serializer = ScheduleUploadSerializer(upload)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """
        Process upload with OCR to extract text and parse tasks.
        
        POST /api/uploads/{id}/process/
        """
        upload = self.get_object()
        
        # Check if already processed
        if upload.status == 'processing':
            return Response(
                {'error': 'Upload is already being processed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if upload.status == 'completed' and upload.extracted_text:
            # Return existing results
            parsed_tasks = parse_tasks_from_text(upload.extracted_text)
            return Response({
                'upload_id': upload.id,
                'status': upload.status,
                'extracted_text': upload.extracted_text,
                'parsed_tasks': parsed_tasks,
                'task_count': upload.parsed_tasks_count,
                'message': 'This upload was already processed'
            })
        
        try:
            # Update status
            upload.status = 'processing'
            upload.save()
            
            # Get image path
            image_path = upload.image.path
            
            logger.info(f"Starting OCR processing for upload {upload.id}")
            
            # Extract text using OCR
            ocr_result_data = extract_text_from_image(image_path)
            
            # Create OCR result record
            ocr_result = OCRResult.objects.create(
                upload=upload,
                raw_text=ocr_result_data['raw_text'],
                confidence=ocr_result_data['confidence'],
                processing_time=ocr_result_data['processing_time']
            )
            
            # Parse tasks from extracted text
            parsed_tasks = parse_tasks_from_text(ocr_result_data['raw_text'])
            
            # Update upload record
            upload.status = 'completed'
            upload.extracted_text = ocr_result_data['raw_text']
            upload.parsed_tasks_count = len(parsed_tasks)
            upload.processed_at = timezone.now()
            upload.save()
            
            logger.info(f"Successfully processed upload {upload.id}, found {len(parsed_tasks)} tasks")
            
            return Response({
                'upload_id': upload.id,
                'status': upload.status,
                'extracted_text': upload.extracted_text,
                'parsed_tasks': parsed_tasks,
                'task_count': len(parsed_tasks),
                'confidence': ocr_result_data['confidence'],
                'processing_time': ocr_result_data['processing_time']
            })
        
        except Exception as e:
            # Update upload with error
            upload.status = 'failed'
            upload.error_message = str(e)
            upload.save()
            
            logger.error(f"Error processing upload {upload.id}: {str(e)}")
            
            return Response(
                {'error': f'Failed to process image: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """
        Get suggested tasks from processed upload.
        
        GET /api/uploads/{id}/tasks/
        """
        upload = self.get_object()
        
        if not upload.extracted_text:
            return Response(
                {'error': 'Upload has not been processed yet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Parse tasks from extracted text
        parsed_tasks = parse_tasks_from_text(upload.extracted_text)
        
        # Generate suggestions
        suggestions = generate_task_suggestions(upload.extracted_text)
        
        return Response({
            'upload_id': upload.id,
            'parsed_tasks': parsed_tasks,
            'task_count': len(parsed_tasks),
            'suggestions': suggestions
        })
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recent uploads.
        
        GET /api/uploads/recent/
        """
        uploads = self.get_queryset()[:10]
        serializer = self.get_serializer(uploads, many=True)
        return Response({
            'count': len(uploads),
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get upload statistics.
        
        GET /api/uploads/stats/
        """
        uploads = self.get_queryset()
        
        stats = {
            'total_uploads': uploads.count(),
            'completed': uploads.filter(status='completed').count(),
            'pending': uploads.filter(status='pending').count(),
            'failed': uploads.filter(status='failed').count(),
            'total_tasks_extracted': sum(uploads.values_list('parsed_tasks_count', flat=True))
        }
        
        return Response(stats)
