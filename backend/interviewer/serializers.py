from rest_framework import serializers
from .models import Interviewer, Interview, QuestionBank
from user_management.models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'status']


class InterviewerSerializer(serializers.ModelSerializer):
    """Serializer for Interviewer model"""
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True, required=False)
    
    # Computed fields
    full_name = serializers.SerializerMethodField()
    availability_status = serializers.SerializerMethodField()
    interviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Interviewer
        fields = [
            'id', 'user', 'user_id', 'company', 'department', 'title', 'phone',
            'technical_skills', 'interview_types', 'experience_years',
            'ai_assistance_enabled', 'ai_question_suggestions', 'ai_response_analysis',
            'ai_followup_suggestions', 'is_active', 'max_interviews_per_week',
            'created_at', 'updated_at', 'full_name', 'availability_status',
            'interviews_count', 'average_rating'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_availability_status(self, obj):
        if obj.is_active:
            return 'available'
        else:
            return 'busy'
    
    def get_interviews_count(self, obj):
        return obj.conducted_interviews.count()
    
    def get_average_rating(self, obj):
        interviews = obj.conducted_interviews.filter(overall_score__isnull=False)
        if interviews.exists():
            avg_score = interviews.aggregate(avg_score=serializers.Avg('overall_score'))['avg_score']
            return round(avg_score, 1) if avg_score else 0
        return 0
    
    def create(self, validated_data):
        user_id = validated_data.pop('user_id', None)
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                validated_data['user'] = user
            except User.DoesNotExist:
                raise serializers.ValidationError("User not found")
        
        return super().create(validated_data)


class InterviewSerializer(serializers.ModelSerializer):
    """Serializer for Interview model"""
    interviewer_name = serializers.SerializerMethodField()
    candidate_name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    
    class Meta:
        model = Interview
        fields = [
            'id', 'interviewer', 'interviewer_name', 'candidate', 'candidate_name',
            'job_posting', 'job_title', 'competency_framework', 'interview_template',
            'interview_type', 'ai_mode', 'ai_model_used', 'scheduled_time',
            'start_time', 'end_time', 'duration_minutes', 'status', 'overall_score',
            'competency_scores', 'interviewer_notes', 'ai_insights', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_interviewer_name(self, obj):
        if obj.interviewer and obj.interviewer.user:
            return f"{obj.interviewer.user.first_name} {obj.interviewer.user.last_name}"
        return "Unknown"
    
    def get_candidate_name(self, obj):
        if obj.candidate:
            return obj.candidate.name
        return "Unknown"
    
    def get_job_title(self, obj):
        if obj.job_posting:
            return obj.job_posting.title
        return "Unknown"


class QuestionBankSerializer(serializers.ModelSerializer):
    """Serializer for QuestionBank model"""
    interviewer_name = serializers.SerializerMethodField()
    
    class Meta:
        model = QuestionBank
        fields = [
            'id', 'interviewer', 'interviewer_name', 'name', 'description',
            'category', 'difficulty_level', 'competency_framework', 'questions',
            'ai_generated', 'ai_model_used', 'is_public', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_interviewer_name(self, obj):
        if obj.interviewer and obj.interviewer.user:
            return f"{obj.interviewer.user.first_name} {obj.interviewer.user.last_name}"
        return "Unknown"
