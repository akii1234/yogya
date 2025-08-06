from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import login, logout
from django.utils import timezone
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import uuid

from .models import User, HRProfile, CandidateProfile, UserSession, UserActivity
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    HRProfileSerializer, CandidateProfileSerializer, PasswordChangeSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    UserSessionSerializer, UserActivitySerializer, UserListSerializer,
    UserStatusUpdateSerializer
)


@method_decorator(csrf_exempt, name='dispatch')
class UserRegistrationView(APIView):
    """
    User registration endpoint.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Log activity
            UserActivity.objects.create(
                user=user,
                activity_type='profile_update',
                description='User registered',
                ip_address=self.get_client_ip(request)
            )
            
            return Response({
                'message': 'User registered successfully. Please verify your email.',
                'user_id': user.id,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


@method_decorator(csrf_exempt, name='dispatch')
class UserLoginView(APIView):
    """
    User login endpoint.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            
            # Update last login
            user.last_login_at = timezone.now()
            user.save()
            
            # Create session
            session = UserSession.objects.create(
                user=user,
                session_id=str(uuid.uuid4()),
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                expires_at=timezone.now() + timezone.timedelta(hours=24)
            )
            
            # Log activity
            UserActivity.objects.create(
                user=user,
                activity_type='login',
                description='User logged in',
                ip_address=self.get_client_ip(request),
                metadata={'session_id': session.session_id}
            )
            
            return Response({
                'message': 'Login successful',
                'user': UserProfileSerializer(user).data,
                'session_id': session.session_id
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


@method_decorator(csrf_exempt, name='dispatch')
class UserLogoutView(APIView):
    """
    User logout endpoint.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Log activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='logout',
            description='User logged out',
            ip_address=self.get_client_ip(request)
        )
        
        # Deactivate session if session_id provided
        session_id = request.data.get('session_id')
        if session_id:
            try:
                session = UserSession.objects.get(
                    user=request.user,
                    session_id=session_id,
                    is_active=True
                )
                session.is_active = False
                session.save()
            except UserSession.DoesNotExist:
                pass
        
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


@method_decorator(csrf_exempt, name='dispatch')
class UserProfileViewSet(viewsets.ModelViewSet):
    """
    User profile management.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if hasattr(self, 'request') and self.request and hasattr(self.request, 'user') and self.request.user and hasattr(self.request.user, 'is_admin') and self.request.user.is_admin:
            return User.objects.all()
        if hasattr(self, 'request') and self.request and hasattr(self.request, 'user') and self.request.user:
            return User.objects.filter(id=self.request.user.id)
        return User.objects.none()
    
    def get_serializer_class(self):
        if self.action == 'list' and hasattr(self, 'request') and self.request and hasattr(self.request, 'user') and self.request.user and hasattr(self.request.user, 'is_admin') and self.request.user.is_admin:
            return UserListSerializer
        return UserProfileSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_profile(self, request):
        """Update current user's profile."""
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='profile_update',
                description='Profile updated',
                ip_address=self.get_client_ip(request)
            )
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password."""
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Log activity
            UserActivity.objects.create(
                user=user,
                activity_type='password_change',
                description='Password changed',
                ip_address=self.get_client_ip(request)
            )
            
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


@method_decorator(csrf_exempt, name='dispatch')
class HRProfileViewSet(viewsets.ModelViewSet):
    """
    HR profile management.
    """
    serializer_class = HRProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if hasattr(self, 'request') and self.request and hasattr(self.request, 'user') and self.request.user and hasattr(self.request.user, 'is_admin') and self.request.user.is_admin:
            return HRProfile.objects.all()
        if hasattr(self, 'request') and self.request and hasattr(self.request, 'user') and self.request.user:
            return HRProfile.objects.filter(user=self.request.user)
        return HRProfile.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current HR user's profile."""
        if not request.user.is_hr:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = HRProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except HRProfile.DoesNotExist:
            return Response({'error': 'HR profile not found'}, status=status.HTTP_404_NOT_FOUND)


@method_decorator(csrf_exempt, name='dispatch')
class CandidateProfileViewSet(viewsets.ModelViewSet):
    """
    Candidate profile management.
    """
    serializer_class = CandidateProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if hasattr(self, 'request') and self.request and hasattr(self.request, 'user') and self.request.user and hasattr(self.request.user, 'is_admin') and self.request.user.is_admin:
            return CandidateProfile.objects.all()
        if hasattr(self, 'request') and self.request and hasattr(self.request, 'user') and self.request.user:
            return CandidateProfile.objects.filter(user=self.request.user)
        return CandidateProfile.objects.none()
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Get current candidate's profile."""
        if not request.user.is_candidate:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            profile = CandidateProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except CandidateProfile.DoesNotExist:
            return Response({'error': 'Candidate profile not found'}, status=status.HTTP_404_NOT_FOUND)


@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetRequestView(APIView):
    """
    Request password reset.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            # In a real implementation, you would send an email with reset link
            # For now, we'll just return a success message
            return Response({
                'message': 'Password reset email sent if the email exists in our system.'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetConfirmView(APIView):
    """
    Confirm password reset.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            # In a real implementation, you would validate the token
            # For now, we'll just return a success message
            return Response({
                'message': 'Password reset successful.'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class UserSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    User session management (read-only for users, full access for admins).
    """
    serializer_class = UserSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_admin:
            return UserSession.objects.all()
        return UserSession.objects.filter(user=self.request.user, is_active=True)
    
    @action(detail=True, methods=['post'])
    def terminate(self, request, pk=None):
        """Terminate a session."""
        session = self.get_object()
        if not request.user.is_admin and session.user != request.user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        session.is_active = False
        session.save()
        return Response({'message': 'Session terminated'})


@method_decorator(csrf_exempt, name='dispatch')
class UserActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    User activity tracking (read-only for users, full access for admins).
    """
    serializer_class = UserActivitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_admin:
            return UserActivity.objects.all()
        return UserActivity.objects.filter(user=self.request.user)


@method_decorator(csrf_exempt, name='dispatch')
class AdminUserManagementViewSet(viewsets.ModelViewSet):
    """
    Admin user management (admin only).
    """
    serializer_class = UserListSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return UserStatusUpdateSerializer
        return UserListSerializer
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a user."""
        user = self.get_object()
        user.status = 'active'
        user.save()
        return Response({'message': 'User activated'})
    
    @action(detail=True, methods=['post'])
    def suspend(self, request, pk=None):
        """Suspend a user."""
        user = self.get_object()
        if user.role == 'admin':
            return Response({'error': 'Cannot suspend admin users'}, status=status.HTTP_400_BAD_REQUEST)
        user.status = 'suspended'
        user.save()
        return Response({'message': 'User suspended'})
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a user."""
        user = self.get_object()
        if user.role == 'admin':
            return Response({'error': 'Cannot deactivate admin users'}, status=status.HTTP_400_BAD_REQUEST)
        user.status = 'inactive'
        user.save()
        return Response({'message': 'User deactivated'})
