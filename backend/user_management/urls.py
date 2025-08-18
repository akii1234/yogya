from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserRegistrationView, UserLoginView, UserLogoutView,
    UserProfileViewSet, HRProfileViewSet, CandidateProfileViewSet,
    PasswordResetRequestView, PasswordResetConfirmView,
    UserSessionViewSet, UserActivityViewSet, AdminUserManagementViewSet,
    HROrganizationUpdateView
)

# Create router for ViewSets
router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='user-profile')
router.register(r'hr-profiles', HRProfileViewSet, basename='hr-profile')
router.register(r'candidate-profiles', CandidateProfileViewSet, basename='candidate-profile')
router.register(r'sessions', UserSessionViewSet, basename='user-session')
router.register(r'activities', UserActivityViewSet, basename='user-activity')
router.register(r'admin/users', AdminUserManagementViewSet, basename='admin-user')

# URL patterns
urlpatterns = [
    # Authentication endpoints
    path('auth/register/', UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', UserLoginView.as_view(), name='user-login'),
    path('auth/logout/', UserLogoutView.as_view(), name='user-logout'),
    
    # Password reset endpoints
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset-request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # HR Organization endpoint
    path('hr/organization/', HROrganizationUpdateView.as_view(), name='hr-organization-update'),
    
    # Include router URLs
    path('', include(router.urls)),
] 