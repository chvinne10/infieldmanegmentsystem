"""
Models for Notifications app.
"""
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


# Notification model is defined in tasks app for now
# This file serves as the home for any notification-specific utilities
