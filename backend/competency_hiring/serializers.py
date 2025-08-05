from rest_framework import serializers
from .models import (
    CompetencyFramework, Competency, InterviewTemplate, InterviewQuestion,
    InterviewSession, CompetencyEvaluation, AIInterviewSession, InterviewAnalytics, QuestionBank,
    LLMQuestionPrompt, LLMQuestionGeneration, QuestionEmbedding, QuestionGenerationBatch
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


class QuestionBankSerializer(serializers.ModelSerializer):
    """Serializer for QuestionBank model with tagging system"""
    
    class Meta:
        model = QuestionBank
        fields = [
            'id', 'question_text', 'question_type', 'tags', 'difficulty',
            'usage_count', 'success_rate', 'evaluation_criteria', 'expected_answer_points',
            'star_structure', 'car_structure', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_count', 'success_rate', 'created_at', 'updated_at']
    
    def validate_tags(self, value):
        """Validate that tags is a list of strings"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list")
        for tag in value:
            if not isinstance(tag, str):
                raise serializers.ValidationError("All tags must be strings")
        return value


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
            'justification', 'ai_insights', 'review_notes', 'created_by', 'reviewed_by', 'review_date',
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


class LLMQuestionPromptSerializer(serializers.ModelSerializer):
    """Serializer for LLMQuestionPrompt model"""
    
    class Meta:
        model = LLMQuestionPrompt
        fields = [
            'id', 'name', 'description', 'prompt_template', 'question_type',
            'difficulty', 'target_skills', 'llm_model', 'temperature', 'max_tokens',
            'usage_count', 'success_rate', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'usage_count', 'success_rate', 'created_at', 'updated_at']
    
    def validate_target_skills(self, value):
        """Validate that target_skills is a list of strings"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Target skills must be a list")
        for skill in value:
            if not isinstance(skill, str):
                raise serializers.ValidationError("All target skills must be strings")
        return value


class LLMQuestionGenerationSerializer(serializers.ModelSerializer):
    """Serializer for LLMQuestionGeneration model"""
    
    prompt_name = serializers.CharField(source='prompt.name', read_only=True)
    question_bank_text = serializers.CharField(source='question_bank_entry.question_text', read_only=True)
    
    class Meta:
        model = LLMQuestionGeneration
        fields = [
            'id', 'prompt', 'prompt_name', 'input_parameters', 'generated_question',
            'generated_metadata', 'quality_score', 'human_reviewed', 'human_rating',
            'human_feedback', 'status', 'question_bank_entry', 'question_bank_text',
            'tokens_used', 'estimated_cost', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuestionEmbeddingSerializer(serializers.ModelSerializer):
    """Serializer for QuestionEmbedding model"""
    
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    question_type = serializers.CharField(source='question.question_type', read_only=True)
    
    class Meta:
        model = QuestionEmbedding
        fields = [
            'id', 'question', 'question_text', 'question_type', 'embedding_vector',
            'model_name', 'embedding_dimension', 'embedding_text', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuestionGenerationBatchSerializer(serializers.ModelSerializer):
    """Serializer for QuestionGenerationBatch model"""
    
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = QuestionGenerationBatch
        fields = [
            'id', 'name', 'description', 'target_skills', 'question_types',
            'difficulty_levels', 'count_per_skill', 'status', 'total_generated',
            'total_approved', 'total_rejected', 'total_tokens', 'total_cost',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_generated', 'total_approved', 'total_rejected', 
                           'total_tokens', 'total_cost', 'created_at', 'updated_at']
    
    def validate_target_skills(self, value):
        """Validate that target_skills is a list of strings"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Target skills must be a list")
        for skill in value:
            if not isinstance(skill, str):
                raise serializers.ValidationError("All target skills must be strings")
        return value
    
    def validate_question_types(self, value):
        """Validate that question_types is a list of valid types"""
        valid_types = ['technical', 'behavioral', 'situational', 'problem_solving']
        if not isinstance(value, list):
            raise serializers.ValidationError("Question types must be a list")
        for qtype in value:
            if qtype not in valid_types:
                raise serializers.ValidationError(f"Invalid question type: {qtype}")
        return value
    
    def validate_difficulty_levels(self, value):
        """Validate that difficulty_levels is a list of valid levels"""
        valid_levels = ['easy', 'medium', 'hard']
        if not isinstance(value, list):
            raise serializers.ValidationError("Difficulty levels must be a list")
        for level in value:
            if level not in valid_levels:
                raise serializers.ValidationError(f"Invalid difficulty level: {level}")
        return value 