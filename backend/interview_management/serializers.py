from rest_framework import serializers
from .models import (
    InterviewSession, InterviewFeedback, InterviewQuestion, InterviewAnalytics,
    InterviewRoom, RoomParticipant, ChatMessage, InterviewRecording,
    CompetencyEvaluation
)
from user_management.models import User
from candidate_ranking.models import Candidate, JobDescription


class InterviewSessionSerializer(serializers.ModelSerializer):
    """Serializer for InterviewSession model"""
    
    candidate_name = serializers.CharField(source='candidate.name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    interviewer_name = serializers.CharField(source='interviewer.get_full_name', read_only=True)
    job_title = serializers.CharField(source='job_description.title', read_only=True)
    company_name = serializers.CharField(source='job_description.company', read_only=True)
    duration_actual = serializers.IntegerField(read_only=True)
    is_completed = serializers.BooleanField(read_only=True)
    overall_score = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = InterviewSession
        fields = [
            'id', 'session_id', 'candidate', 'candidate_name', 'candidate_email',
            'interviewer', 'interviewer_name', 'job_description', 'job_title', 'company_name',
            'interview_type', 'interview_mode', 'ai_enabled', 'ai_mode',
            'scheduled_date', 'actual_start_time', 'actual_end_time', 'duration_minutes',
            'duration_actual', 'status', 'meeting_link', 'meeting_instructions',
            'notes', 'recording_url', 'transcription', 'is_completed', 'overall_score',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'session_id', 'created_at', 'updated_at']


class CompetencyEvaluationSerializer(serializers.ModelSerializer):
    """Serializer for CompetencyEvaluation model"""
    
    weighted_score = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    
    class Meta:
        model = CompetencyEvaluation
        fields = [
            'id', 'session', 'competency_title', 'competency_description',
            'evaluation_method', 'score', 'weightage', 'performance_level',
            'star_observations', 'car_observations', 'strengths',
            'areas_for_improvement', 'detailed_feedback', 'criteria_scores',
            'criteria_feedback', 'weighted_score', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InterviewFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for InterviewFeedback model"""
    
    session_id = serializers.CharField(source='session.session_id', read_only=True)
    candidate_name = serializers.CharField(source='session.candidate.name', read_only=True)
    job_title = serializers.CharField(source='session.job_description.title', read_only=True)
    is_positive = serializers.BooleanField(read_only=True)
    needs_follow_up = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = InterviewFeedback
        fields = [
            'id', 'session', 'session_id', 'candidate_name', 'job_title',
            'overall_score', 'overall_recommendation', 'interviewer_notes',
            'ai_insights', 'strengths_summary', 'improvement_areas',
            'star_summary', 'car_summary', 'competency_scores',
            'competency_feedback', 'cultural_fit_score', 'values_alignment',
            'technical_score', 'technical_feedback', 'next_steps',
            'follow_up_required', 'follow_up_notes', 'is_positive',
            'needs_follow_up', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class InterviewQuestionSerializer(serializers.ModelSerializer):
    """Serializer for InterviewQuestion model"""
    
    session_id = serializers.CharField(source='session.session_id', read_only=True)
    
    class Meta:
        model = InterviewQuestion
        fields = [
            'id', 'session', 'session_id', 'question_text', 'question_type',
            'competency_title', 'star_structure', 'car_structure',
            'candidate_response', 'response_duration_seconds', 'ai_suggestions',
            'ai_follow_up_questions', 'question_score', 'question_feedback',
            'asked_at', 'answered_at'
        ]
        read_only_fields = ['id', 'asked_at']


class InterviewAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for InterviewAnalytics model"""
    
    session_id = serializers.CharField(source='session.session_id', read_only=True)
    
    class Meta:
        model = InterviewAnalytics
        fields = [
            'id', 'session', 'session_id', 'total_questions_asked',
            'average_response_time', 'completion_rate', 'strongest_competency',
            'weakest_competency', 'competency_gaps', 'ai_suggestions_used',
            'ai_follow_ups_generated', 'ai_effectiveness_score',
            'interview_quality_score', 'bias_detection_score',
            'time_spent_per_competency', 'question_effectiveness',
            'candidate_engagement_metrics', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# Nested serializers for detailed views
class InterviewSessionDetailSerializer(InterviewSessionSerializer):
    """Detailed serializer with nested competency evaluations and feedback"""
    
    competency_evaluations = CompetencyEvaluationSerializer(many=True, read_only=True)
    feedback = InterviewFeedbackSerializer(read_only=True)
    questions = InterviewQuestionSerializer(many=True, read_only=True)
    analytics = InterviewAnalyticsSerializer(read_only=True)
    
    class Meta(InterviewSessionSerializer.Meta):
        fields = InterviewSessionSerializer.Meta.fields + [
            'competency_evaluations', 'feedback', 'questions', 'analytics'
        ]


# Request/Response serializers for specific operations
class StartInterviewSerializer(serializers.Serializer):
    """Serializer for starting an interview session"""
    
    session_id = serializers.CharField()
    
    def validate_session_id(self, value):
        try:
            session = InterviewSession.objects.get(session_id=value)
            if session.status != 'scheduled':
                raise serializers.ValidationError("Interview is not in scheduled status")
            return value
        except InterviewSession.DoesNotExist:
            raise serializers.ValidationError("Interview session not found")


class EndInterviewSerializer(serializers.Serializer):
    """Serializer for ending an interview session"""
    
    session_id = serializers.CharField()
    notes = serializers.CharField(required=False, allow_blank=True)
    recording_url = serializers.URLField(required=False, allow_blank=True)
    transcription = serializers.CharField(required=False, allow_blank=True)


class CompetencyScoreSerializer(serializers.Serializer):
    """Serializer for submitting competency scores"""
    
    competency_title = serializers.CharField(max_length=100)
    score = serializers.DecimalField(max_digits=5, decimal_places=2)
    star_observations = serializers.DictField(required=False)
    car_observations = serializers.DictField(required=False)
    strengths = serializers.CharField(required=False, allow_blank=True)
    areas_for_improvement = serializers.CharField(required=False, allow_blank=True)
    detailed_feedback = serializers.CharField(required=False, allow_blank=True)
    criteria_scores = serializers.DictField(required=False)
    criteria_feedback = serializers.DictField(required=False)


class SubmitFeedbackSerializer(serializers.Serializer):
    """Serializer for submitting complete interview feedback"""
    
    overall_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    overall_recommendation = serializers.ChoiceField(choices=[
        ('proceed', 'Proceed to Next Round'),
        ('hold', 'Hold for Further Review'),
        ('reject', 'Reject'),
        ('strong_hire', 'Strong Hire'),
        ('conditional_hire', 'Conditional Hire'),
    ])
    interviewer_notes = serializers.CharField(required=False, allow_blank=True)
    ai_insights = serializers.CharField(required=False, allow_blank=True)
    strengths_summary = serializers.CharField(required=False, allow_blank=True)
    improvement_areas = serializers.CharField(required=False, allow_blank=True)
    star_summary = serializers.DictField(required=False)
    car_summary = serializers.DictField(required=False)
    competency_scores = serializers.DictField(required=False)
    competency_feedback = serializers.DictField(required=False)
    cultural_fit_score = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    values_alignment = serializers.DictField(required=False)
    technical_score = serializers.DecimalField(max_digits=5, decimal_places=2, required=False)
    technical_feedback = serializers.CharField(required=False, allow_blank=True)
    next_steps = serializers.CharField(required=False, allow_blank=True)
    follow_up_required = serializers.BooleanField(required=False, default=False)
    follow_up_notes = serializers.CharField(required=False, allow_blank=True)


class InterviewQuestionSerializer(serializers.Serializer):
    """Serializer for asking questions during interview"""
    
    question_text = serializers.CharField()
    question_type = serializers.ChoiceField(choices=[
        ('behavioral', 'Behavioral (STAR/CAR)'),
        ('technical', 'Technical'),
        ('problem_solving', 'Problem Solving'),
        ('scenario', 'Scenario-Based'),
        ('coding', 'Coding Challenge'),
        ('situational', 'Situational'),
    ])
    competency_title = serializers.CharField(required=False, allow_blank=True)
    star_structure = serializers.DictField(required=False)
    car_structure = serializers.DictField(required=False)


class CandidateResponseSerializer(serializers.Serializer):
    """Serializer for candidate responses"""
    
    question_id = serializers.UUIDField()
    response = serializers.CharField()
    response_duration_seconds = serializers.IntegerField(required=False)


# Analytics serializers
class InterviewAnalyticsRequestSerializer(serializers.Serializer):
    """Serializer for analytics requests"""
    
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    interviewer_id = serializers.UUIDField(required=False)
    job_id = serializers.CharField(required=False)
    interview_type = serializers.ChoiceField(choices=[
        ('technical', 'Technical Interview'),
        ('behavioral', 'Behavioral Interview'),
        ('mixed', 'Mixed Interview'),
        ('screening', 'Initial Screening'),
        ('final', 'Final Round'),
    ], required=False)


class InterviewAnalyticsResponseSerializer(serializers.Serializer):
    """Serializer for analytics responses"""
    
    total_interviews = serializers.IntegerField()
    completed_interviews = serializers.IntegerField()
    average_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    completion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_duration = serializers.DecimalField(max_digits=5, decimal_places=2)
    competency_breakdown = serializers.DictField()
    ai_usage_stats = serializers.DictField()
    interviewer_performance = serializers.ListField()
    recent_interviews = serializers.ListField()


class InterviewRoomSerializer(serializers.ModelSerializer):
    """Serializer for InterviewRoom model"""
    interview_title = serializers.CharField(source='interview.job_description.title', read_only=True)
    interview_candidate = serializers.CharField(source='interview.candidate.email', read_only=True)
    participant_count = serializers.SerializerMethodField()
    
    class Meta:
        model = InterviewRoom
        fields = [
            'id', 'room_id', 'interview', 'interview_title', 'interview_candidate',
            'created_at', 'started_at', 'ended_at', 'is_active',
            'ice_servers', 'recording_enabled', 'screen_sharing_enabled', 'chat_enabled',
            'participant_count'
        ]
        read_only_fields = ['id', 'room_id', 'created_at', 'started_at', 'ended_at']
    
    def get_participant_count(self, obj):
        return obj.participants.filter(is_active=True).count()

class RoomParticipantSerializer(serializers.ModelSerializer):
    """Serializer for RoomParticipant model"""
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    
    class Meta:
        model = RoomParticipant
        fields = [
            'id', 'room', 'user', 'user_email', 'user_name', 'user_role',
            'participant_type', 'joined_at', 'left_at', 'is_active',
            'peer_id', 'connection_state'
        ]
        read_only_fields = ['id', 'joined_at', 'left_at']

class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for ChatMessage model"""
    sender_email = serializers.CharField(source='sender.email', read_only=True)
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'room', 'sender', 'sender_email', 'sender_name',
            'message', 'timestamp', 'is_system_message'
        ]
        read_only_fields = ['id', 'timestamp']

class InterviewRecordingSerializer(serializers.ModelSerializer):
    """Serializer for InterviewRecording model"""
    room_id = serializers.CharField(source='room.room_id', read_only=True)
    
    class Meta:
        model = InterviewRecording
        fields = [
            'id', 'room', 'room_id', 'recording_type', 'file_path',
            'file_size', 'duration', 'created_at', 'is_processed'
        ]
        read_only_fields = ['id', 'created_at']
