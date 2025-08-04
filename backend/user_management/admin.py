from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, HRProfile, CandidateProfile, UserSession, UserActivity


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Admin configuration for custom User model.
    """
    
    list_display = ['email', 'first_name', 'last_name', 'role', 'status', 'is_active_user', 'created_at']
    list_filter = ['role', 'status', 'created_at', 'last_login_at']
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('username', 'first_name', 'last_name', 'phone_number', 'bio')}),
        ('Role & Status', {'fields': ('role', 'status', 'profile_picture')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'last_login_at', 'email_verified_at')}),
        ('Settings', {'fields': ('email_notifications', 'push_notifications')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )
    
    readonly_fields = ['last_login_at', 'email_verified_at', 'created_at', 'updated_at']
    
    def is_active_user(self, obj):
        return obj.is_active_user
    is_active_user.boolean = True
    is_active_user.short_description = 'Active User'


@admin.register(HRProfile)
class HRProfileAdmin(admin.ModelAdmin):
    """
    Admin configuration for HR profiles.
    """
    
    list_display = ['user', 'department', 'position', 'employee_id', 'can_create_jobs', 'can_manage_candidates']
    list_filter = ['department', 'can_create_jobs', 'can_manage_candidates', 'can_conduct_interviews']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'employee_id']
    ordering = ['user__first_name']
    
    fieldsets = (
        ('User Information', {'fields': ('user',)}),
        ('HR Details', {'fields': ('department', 'position', 'employee_id')}),
        ('Permissions', {
            'fields': ('can_create_jobs', 'can_manage_candidates', 'can_conduct_interviews', 'can_view_analytics', 'can_manage_users'),
            'classes': ('collapse',)
        }),
        ('Preferences', {
            'fields': ('preferred_interview_types', 'working_hours'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['user']


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    """
    Admin configuration for candidate profiles.
    """
    
    list_display = ['user', 'profile_visibility', 'total_applications', 'applications_this_month']
    list_filter = ['profile_visibility']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    ordering = ['user__first_name']
    
    fieldsets = (
        ('User Information', {'fields': ('user',)}),
        ('Social Links', {'fields': ('linkedin_url', 'github_url', 'portfolio_url')}),
        ('Preferences', {
            'fields': ('preferred_job_types', 'preferred_locations', 'salary_expectations'),
            'classes': ('collapse',)
        }),
        ('Privacy & Stats', {'fields': ('profile_visibility', 'total_applications', 'applications_this_month')}),
    )
    
    readonly_fields = ['user', 'total_applications', 'applications_this_month']


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    """
    Admin configuration for user sessions.
    """
    
    list_display = ['user', 'session_id', 'ip_address', 'device_type', 'created_at', 'expires_at', 'is_active', 'is_expired']
    list_filter = ['is_active', 'device_type', 'created_at', 'expires_at']
    search_fields = ['user__email', 'session_id', 'ip_address']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Session Information', {'fields': ('user', 'session_id', 'is_active')}),
        ('Connection Details', {'fields': ('ip_address', 'user_agent', 'device_type')}),
        ('Timestamps', {'fields': ('created_at', 'last_activity', 'expires_at')}),
    )
    
    readonly_fields = ['session_id', 'created_at', 'last_activity', 'expires_at', 'is_expired']
    
    def is_expired(self, obj):
        return obj.is_expired
    is_expired.boolean = True
    is_expired.short_description = 'Expired'


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    """
    Admin configuration for user activities.
    """
    
    list_display = ['user', 'activity_type', 'description', 'ip_address', 'created_at']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['user__email', 'description', 'ip_address']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Activity Information', {'fields': ('user', 'activity_type', 'description')}),
        ('Additional Data', {'fields': ('metadata', 'ip_address')}),
        ('Timestamp', {'fields': ('created_at',)}),
    )
    
    readonly_fields = ['created_at']
    
    def has_add_permission(self, request):
        return False  # Activities should only be created by the system
