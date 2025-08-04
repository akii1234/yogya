from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import uuid


class User(AbstractUser):
    """
    Custom User model with role-based access control.
    Extends Django's AbstractUser to add role-specific fields.
    """
    
    # Role choices
    ROLE_CHOICES = [
        ('hr', 'HR/Recruiter'),
        ('hiring_manager', 'Hiring Manager'),
        ('interviewer', 'Interviewer'),
        ('candidate', 'Candidate'),
        ('admin', 'System Administrator'),
    ]
    
    # User status
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('pending_verification', 'Pending Verification'),
    ]
    
    # Basic fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='candidate')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_verification')
    
    # Profile fields
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_at = models.DateTimeField(blank=True, null=True)
    email_verified_at = models.DateTimeField(blank=True, null=True)
    
    # Settings
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    
    # Override username to use email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def is_hr(self):
        return self.role in ['hr', 'hiring_manager', 'admin']
    
    @property
    def is_candidate(self):
        return self.role == 'candidate'
    
    @property
    def is_interviewer(self):
        return self.role in ['interviewer', 'hiring_manager', 'admin']
    
    @property
    def is_admin(self):
        return self.role == 'admin'
    
    @property
    def is_active_user(self):
        return self.status == 'active'
    
    def get_role_display_name(self):
        return dict(self.ROLE_CHOICES).get(self.role, self.role.title())


class HRProfile(models.Model):
    """
    Extended profile for HR/Recruiter users.
    """
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hr_profile')
    
    # HR-specific fields
    department = models.CharField(max_length=100, blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    employee_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    
    # Permissions
    can_create_jobs = models.BooleanField(default=True)
    can_manage_candidates = models.BooleanField(default=True)
    can_conduct_interviews = models.BooleanField(default=True)
    can_view_analytics = models.BooleanField(default=True)
    can_manage_users = models.BooleanField(default=False)
    
    # Work preferences
    preferred_interview_types = models.JSONField(default=list, blank=True)
    working_hours = models.JSONField(default=dict, blank=True)
    
    class Meta:
        verbose_name = "HR Profile"
        verbose_name_plural = "HR Profiles"
    
    def __str__(self):
        return f"HR Profile - {self.user.get_full_name()}"


class CandidateProfile(models.Model):
    """
    Extended profile for Candidate users.
    """
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='candidate_profile')
    
    # Candidate-specific fields
    linkedin_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    portfolio_url = models.URLField(blank=True, null=True)
    
    # Preferences
    preferred_job_types = models.JSONField(default=list, blank=True)
    preferred_locations = models.JSONField(default=list, blank=True)
    salary_expectations = models.JSONField(default=dict, blank=True)
    
    # Privacy settings
    profile_visibility = models.CharField(
        max_length=20,
        choices=[
            ('public', 'Public'),
            ('private', 'Private'),
            ('recruiters_only', 'Recruiters Only'),
        ],
        default='recruiters_only'
    )
    
    # Application tracking
    total_applications = models.PositiveIntegerField(default=0)
    applications_this_month = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name = "Candidate Profile"
        verbose_name_plural = "Candidate Profiles"
    
    def __str__(self):
        return f"Candidate Profile - {self.user.get_full_name()}"
    
    def increment_applications(self):
        """Increment application counters."""
        self.total_applications += 1
        self.applications_this_month += 1
        self.save()


class UserSession(models.Model):
    """
    Track user sessions for analytics and security.
    """
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    session_id = models.CharField(max_length=100, unique=True)
    
    # Session details
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    device_type = models.CharField(max_length=20, blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "User Session"
        verbose_name_plural = "User Sessions"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Session - {self.user.email} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at


class UserActivity(models.Model):
    """
    Track user activities for analytics and audit trails.
    """
    
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('profile_update', 'Profile Update'),
        ('job_application', 'Job Application'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('resume_upload', 'Resume Upload'),
        ('skill_update', 'Skill Update'),
        ('password_change', 'Password Change'),
        ('email_verification', 'Email Verification'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField()
    
    # Additional data
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "User Activity"
        verbose_name_plural = "User Activities"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.get_activity_type_display()} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
