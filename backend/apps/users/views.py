"""
Views for User app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer,
    UserRegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserDetailSerializer,
    UpdateFCMTokenSerializer
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token obtain view with user data in response."""
    serializer_class = CustomTokenObtainPairSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management.
    
    Endpoints:
    - GET /api/users/ - List all users
    - POST /api/users/ - Create new user
    - GET /api/users/{id}/ - Get user details
    - PUT /api/users/{id}/ - Update user
    - DELETE /api/users/{id}/ - Delete user
    - POST /api/users/register/ - Register new user
    - GET /api/users/me/ - Get current user
    - POST /api/users/update-fcm-token/ - Update FCM token
    """
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'register':
            return UserRegisterSerializer
        elif self.action == 'list':
            return UserSerializer
        elif self.action in ['retrieve', 'me']:
            return UserDetailSerializer
        elif self.action == 'update_fcm_token':
            return UpdateFCMTokenSerializer
        return UserSerializer
    
    def get_permissions(self):
        """Set permissions based on action."""
        if self.action == 'register':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        Register a new user.
        
        POST /api/users/register/
        {
            "username": "john_doe",
            "email": "john@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "password": "secure_password_123",
            "password2": "secure_password_123",
            "phone": "+1234567890",
            "role": "employee"
        }
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserDetailSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Get current user profile.
        
        GET /api/users/me/
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_fcm_token(self, request):
        """
        Update Firebase Cloud Messaging token for push notifications.
        
        POST /api/users/update-fcm-token/
        {
            "fcm_token": "your-fcm-token"
        }
        """
        serializer = self.get_serializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'message': 'FCM token updated successfully',
            'user': UserDetailSerializer(request.user).data
        })
    
    @action(detail=False, methods=['get'])
    def managers(self, request):
        """
        Get all managers in the system.
        
        GET /api/users/managers/
        """
        managers = User.objects.filter(role__in=['manager', 'admin'])
        serializer = self.get_serializer(managers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def employees(self, request):
        """
        Get all employees. (Manager/Admin only)
        
        GET /api/users/employees/
        """
        if not request.user.is_manager():
            return Response(
                {'error': 'Only managers can view employees'},
                status=status.HTTP_403_FORBIDDEN
            )
        employees = User.objects.filter(role='employee')
        serializer = self.get_serializer(employees, many=True)
        return Response(serializer.data)
