from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, HRProfile, CandidateProfile, UserSession, UserActivity


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'password', 
            'password_confirm', 'role', 'phone_number'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Set status to active for testing (in production, this would be 'pending_verification')
        validated_data['status'] = 'active'
        user = User.objects.create_user(**validated_data)
        
        # Create role-specific profile
        if user.role == 'candidate':
            CandidateProfile.objects.create(user=user)
        elif user.role in ['hr', 'hiring_manager', 'interviewer']:
            HRProfile.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    """
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password.')
            if not user.is_active_user:
                raise serializers.ValidationError('Account is not active.')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password.')
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information.
    """
    
    role_display = serializers.CharField(source='get_role_display_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'role', 'role_display', 'status', 'status_display', 'phone_number',
            'profile_picture', 'bio', 'created_at', 'last_login_at',
            'email_verified_at', 'email_notifications', 'push_notifications'
        ]
        read_only_fields = ['id', 'email', 'created_at', 'last_login_at', 'email_verified_at']


class HRProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for HR profile information.
    """
    
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = HRProfile
        fields = [
            'id', 'user', 'department', 'position', 'employee_id',
            'can_create_jobs', 'can_manage_candidates', 'can_conduct_interviews',
            'can_view_analytics', 'can_manage_users', 'preferred_interview_types',
            'working_hours'
        ]
        read_only_fields = ['id']


class CandidateProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for candidate profile information.
    """
    
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'user', 'linkedin_url', 'github_url', 'portfolio_url',
            'preferred_job_types', 'preferred_locations', 'salary_expectations',
            'profile_visibility', 'total_applications', 'applications_this_month'
        ]
        read_only_fields = ['id', 'total_applications', 'applications_this_month']


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password change.
    """
    
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match.")
        return attrs
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for password reset request.
    """
    
    email = serializers.EmailField()
    
    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError('No user found with this email address.')
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for password reset confirmation.
    """
    
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs


class UserSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for user sessions.
    """
    
    user = UserProfileSerializer(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = UserSession
        fields = [
            'id', 'user', 'session_id', 'ip_address', 'user_agent', 'device_type',
            'created_at', 'last_activity', 'expires_at', 'is_active', 'is_expired'
        ]
        read_only_fields = ['id', 'session_id', 'created_at', 'last_activity', 'expires_at']


class UserActivitySerializer(serializers.ModelSerializer):
    """
    Serializer for user activities.
    """
    
    user = UserProfileSerializer(read_only=True)
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = [
            'id', 'user', 'activity_type', 'activity_type_display', 'description',
            'metadata', 'ip_address', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing users (admin view).
    """
    
    role_display = serializers.CharField(source='get_role_display_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'role', 'role_display', 'status', 
            'status_display', 'created_at', 'last_login_at', 'is_active_user'
        ]
        read_only_fields = ['id', 'created_at', 'last_login_at']


class UserStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user status (admin only).
    """
    
    class Meta:
        model = User
        fields = ['status']
    
    def validate_status(self, value):
        user = self.instance
        if user and user.role == 'admin' and value == 'suspended':
            raise serializers.ValidationError("Cannot suspend admin users.")
        return value 