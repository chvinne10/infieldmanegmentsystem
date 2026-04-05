"""
URL configuration for Uploads app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScheduleUploadViewSet

router = DefaultRouter()
router.register(r'', ScheduleUploadViewSet, basename='upload')

urlpatterns = [
    path('', include(router.urls)),
]
