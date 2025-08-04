from rest_framework import serializers
from .models import (
    CompetencyFramework, Competency, InterviewTemplate, InterviewQuestion,
    InterviewSession, CompetencyEvaluation, AIInterviewSession, InterviewAnalytics
)


class CompetencySerializer(serializers.ModelSerializer):
    """Serializer for Competency model"""
    
    class Meta:
        model = Competency
        fields = [
            'id', 'name', 'description', 'category', 'weight', 'order', 
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CompetencyFrameworkSerializer(serializers.ModelSerializer):
    """Serializer for CompetencyFramework model with nested competencies"""
    
    competencies = CompetencySerializer(many=True, read_only=True)
    competency_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CompetencyFramework
        fields = [
            'id', 'name', 'description', 'technology', 'level', 'is_active',
            'competencies', 'competency_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_competency_count(self, obj):
        return obj.competencies.count()


class InterviewQuestionSerializer(serializers.ModelSerializer):
    """Serializer for InterviewQuestion model"""
    
    competency_name = serializers.CharField(source='competency.name', read_only=True)
    competency_category = serializers.CharField(source='competency.category', read_only=True)
    
    class Meta:
        model = InterviewQuestion
        fields = [
            'id', 'template', 'competency', 'competency_name', 'competency_category',
            'question_text', 'question_type', 'difficulty', 'expected_answer',
            'order', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InterviewTemplateSerializer(serializers.ModelSerializer):
    """Serializer for InterviewTemplate model with nested questions"""
    
    framework_name = serializers.CharField(source='framework.name', read_only=True)
    framework_technology = serializers.CharField(source='framework.technology', read_only=True)
    questions = InterviewQuestionSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()
    
    class Meta:
        model = InterviewTemplate
        fields = [
            'id', 'name', 'framework', 'framework_name', 'framework_technology',
            'description', 'duration_minutes', 'is_active', 'questions',
            'question_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_question_count(self, obj):
        return obj.questions.count()


class CompetencyEvaluationSerializer(serializers.ModelSerializer):
    """Serializer for CompetencyEvaluation model"""
    
    competency_name = serializers.CharField(source='competency.name', read_only=True)
    competency_category = serializers.CharField(source='competency.category', read_only=True)
    
    class Meta:
        model = CompetencyEvaluation
        fields = [
            'id', 'session', 'competency', 'competency_name', 'competency_category',
            'score', 'level', 'feedback', 'strengths', 'areas_for_improvement',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InterviewSessionSerializer(serializers.ModelSerializer):
    """Serializer for InterviewSession model"""
    
    candidate_name = serializers.CharField(source='candidate.name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    job_title = serializers.CharField(source='job_description.title', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    evaluations = CompetencyEvaluationSerializer(many=True, read_only=True)
    evaluation_count = serializers.SerializerMethodField()
    
    class Meta:
        model = InterviewSession
        fields = [
            'id', 'candidate', 'candidate_name', 'candidate_email',
            'job_description', 'job_title', 'template', 'template_name',
            'interviewer_name', 'interviewer_email', 'scheduled_at',
            'duration_minutes', 'status', 'notes', 'overall_score',
            'evaluations', 'evaluation_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_evaluation_count(self, obj):
        return obj.evaluations.count()


class AIInterviewSessionSerializer(serializers.ModelSerializer):
    """Serializer for AIInterviewSession model"""
    
    session_candidate = serializers.CharField(source='session.candidate.name', read_only=True)
    session_job_title = serializers.CharField(source='session.job_description.title', read_only=True)
    
    class Meta:
        model = AIInterviewSession
        fields = [
            'id', 'session', 'session_candidate', 'session_job_title',
            'llm_model', 'conversation_history', 'current_question_index',
            'is_active', 'started_at', 'completed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'started_at', 'created_at', 'updated_at']


class InterviewAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for InterviewAnalytics model"""
    
    session_candidate = serializers.CharField(source='session.candidate.name', read_only=True)
    session_job_title = serializers.CharField(source='session.job_description.title', read_only=True)
    
    class Meta:
        model = InterviewAnalytics
        fields = [
            'id', 'session', 'session_candidate', 'session_job_title',
            'total_questions_asked', 'total_time_spent', 'confidence_score',
            'communication_score', 'problem_solving_score', 'technical_depth_score',
            'recommendations', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# Specialized serializers for specific use cases

class InterviewSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating interview sessions"""
    
    class Meta:
        model = InterviewSession
        fields = [
            'candidate', 'job_description', 'template', 'interviewer_name',
            'interviewer_email', 'scheduled_at', 'duration_minutes'
        ]


class CompetencyEvaluationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating competency evaluations"""
    
    class Meta:
        model = CompetencyEvaluation
        fields = [
            'session', 'competency', 'score', 'level', 'feedback',
            'strengths', 'areas_for_improvement'
        ]


class AIInterviewStartSerializer(serializers.Serializer):
    """Serializer for starting AI interviews"""
    
    session_id = serializers.UUIDField()
    llm_model = serializers.CharField(max_length=50, default='gpt-4')


class AIInterviewResponseSerializer(serializers.Serializer):
    """Serializer for AI interview responses"""
    
    session_id = serializers.UUIDField()
    candidate_response = serializers.CharField()
    question_index = serializers.IntegerField()


class InterviewSessionUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating interview sessions"""
    
    class Meta:
        model = InterviewSession
        fields = [
            'status', 'notes', 'overall_score', 'interviewer_name', 'interviewer_email'
        ]


class FrameworkRecommendationSerializer(serializers.Serializer):
    """Serializer for framework recommendations based on job description"""
    
    job_description_id = serializers.UUIDField()
    confidence_score = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    recommended_framework = CompetencyFrameworkSerializer(read_only=True)
    matching_competencies = serializers.ListField(read_only=True) 