from django.db import models
from django.conf import settings
import uuid


class Interviewer(models.Model):
    """Interviewer profile linked to User"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interviewer_profile')
    company = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    
    # Interviewer specialization
    technical_skills = models.JSONField(default=list, blank=True, help_text="Technical skills for technical interviews")
    interview_types = models.JSONField(default=list, blank=True, help_text="Types of interviews they can conduct")
    experience_years = models.PositiveIntegerField(default=0, help_text="Years of interviewing experience")
    
    # AI Collaboration Preferences
    ai_assistance_enabled = models.BooleanField(default=True, help_text="Whether to use AI assistance during interviews")
    ai_question_suggestions = models.BooleanField(default=True, help_text="Receive AI-generated question suggestions")
    ai_response_analysis = models.BooleanField(default=True, help_text="Get AI analysis of candidate responses")
    ai_followup_suggestions = models.BooleanField(default=True, help_text="Receive AI follow-up question suggestions")
    
    # Availability
    is_active = models.BooleanField(default=True, help_text="Whether interviewer is available for assignments")
    max_interviews_per_week = models.PositiveIntegerField(default=10, help_text="Maximum interviews per week")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.company}"

    class Meta:
        verbose_name = "Interviewer"
        verbose_name_plural = "Interviewers"


class QuestionBank(models.Model):
    """Question bank for interviewers"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interviewer = models.ForeignKey(Interviewer, on_delete=models.CASCADE, related_name='question_banks')
    name = models.CharField(max_length=200, help_text="Name of the question bank")
    description = models.TextField(blank=True)
    
    # Question bank details
    category = models.CharField(max_length=100, help_text="Category (e.g., Technical, Behavioral, System Design)")
    difficulty_level = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
        ('expert', 'Expert')
    ], default='medium')
    
    # Competency Framework Integration
    competency_framework = models.ForeignKey('competency_hiring.CompetencyFramework', on_delete=models.SET_NULL, null=True, blank=True, related_name='question_banks')
    
    # Questions
    questions = models.JSONField(default=list, blank=True, help_text="List of questions in the bank")
    
    # AI Integration
    ai_generated = models.BooleanField(default=False, help_text="Whether questions were AI-generated")
    ai_model_used = models.CharField(max_length=50, blank=True, help_text="AI model used for generation")
    
    is_public = models.BooleanField(default=False, help_text="Whether other interviewers can use this bank")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.category} ({self.difficulty_level})"

    class Meta:
        verbose_name = "Question Bank"
        verbose_name_plural = "Question Banks"


class Interview(models.Model):
    """Interview conducted by interviewer with AI assistance"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interviewer = models.ForeignKey(Interviewer, on_delete=models.CASCADE, related_name='conducted_interviews')
    candidate = models.ForeignKey('resume_checker.Candidate', on_delete=models.CASCADE, related_name='interviews')
    job_posting = models.ForeignKey('hiring_manager.JobPosting', on_delete=models.CASCADE, related_name='interviews')
    
    # Competency Framework Integration
    competency_framework = models.ForeignKey('competency_hiring.CompetencyFramework', on_delete=models.SET_NULL, null=True, blank=True, related_name='interviews')
    interview_template = models.ForeignKey('competency_hiring.InterviewTemplate', on_delete=models.SET_NULL, null=True, blank=True, related_name='interviews')
    
    # Interview details
    interview_type = models.CharField(max_length=20, choices=[
        ('phone', 'Phone Screen'),
        ('video', 'Video Call'),
        ('onsite', 'On-site'),
        ('technical', 'Technical Assessment'),
        ('behavioral', 'Behavioral'),
        ('system_design', 'System Design'),
        ('hybrid', 'Human + AI Hybrid'),
        ('ai_assisted', 'AI-Assisted Human'),
    ])
    
    # AI Collaboration Mode
    ai_mode = models.CharField(max_length=20, choices=[
        ('human_only', 'Human Only'),
        ('ai_assisted', 'AI Assisted'),
        ('ai_co_pilot', 'AI Co-Pilot'),
        ('ai_lead', 'AI Lead, Human Guide'),
    ], default='ai_assisted')
    
    scheduled_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    actual_duration = models.IntegerField(null=True, blank=True, help_text="Actual duration in minutes")
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
        ('ai_prep', 'AI Preparation'),
        ('human_review', 'Human Review'),
    ], default='scheduled')
    
    # AI-Generated Content
    ai_generated_questions = models.JSONField(default=list, blank=True, help_text="AI-generated questions for this interview")
    ai_response_analysis = models.JSONField(default=list, blank=True, help_text="AI analysis of candidate responses")
    ai_followup_suggestions = models.JSONField(default=list, blank=True, help_text="AI follow-up question suggestions")
    ai_interview_summary = models.TextField(blank=True, help_text="AI-generated interview summary")
    
    # Evaluation (Enhanced with Competency Framework)
    technical_score = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    communication_score = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    problem_solving_score = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    cultural_fit_score = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    overall_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    
    # Competency-Specific Scores
    competency_scores = models.JSONField(default=dict, blank=True, help_text="Scores for each competency in the framework")
    
    # Feedback
    strengths = models.TextField(blank=True)
    areas_of_improvement = models.TextField(blank=True)
    general_feedback = models.TextField(blank=True)
    recommendation = models.CharField(max_length=20, choices=[
        ('strong_yes', 'Strong Yes'),
        ('yes', 'Yes'),
        ('maybe', 'Maybe'),
        ('no', 'No'),
        ('strong_no', 'Strong No')
    ], null=True, blank=True)
    
    # AI vs Human Assessment
    ai_recommendation = models.CharField(max_length=20, choices=[
        ('strong_yes', 'Strong Yes'),
        ('yes', 'Yes'),
        ('maybe', 'Maybe'),
        ('no', 'No'),
        ('strong_no', 'Strong No')
    ], null=True, blank=True)
    human_override = models.BooleanField(default=False, help_text="Whether human overrode AI recommendation")
    override_reason = models.TextField(blank=True, help_text="Reason for overriding AI recommendation")
    
    # Notes
    notes = models.TextField(blank=True)
    questions_asked = models.JSONField(default=list, blank=True, help_text="Questions asked during interview")
    
    # Real-time Collaboration
    is_live = models.BooleanField(default=False, help_text="Whether interview is currently live")
    session_id = models.CharField(max_length=100, blank=True, help_text="Live session identifier")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.candidate.user.get_full_name()} - {self.interview_type} - {self.interviewer.user.get_full_name()}"

    def save(self, *args, **kwargs):
        # Calculate overall score if all individual scores are provided
        scores = [self.technical_score, self.communication_score, self.problem_solving_score, self.cultural_fit_score]
        if all(score is not None for score in scores):
            self.overall_score = sum(scores) / len(scores)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Interview"
        verbose_name_plural = "Interviews"


class InterviewSession(models.Model):
    """Real-time interview session for live collaboration"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interview = models.OneToOneField(Interview, on_delete=models.CASCADE, related_name='session')
    
    # Session details
    session_id = models.CharField(max_length=100, unique=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    # Participants
    interviewer_joined = models.BooleanField(default=False)
    candidate_joined = models.BooleanField(default=False)
    ai_assistant_active = models.BooleanField(default=True)
    
    # Real-time data
    current_question = models.TextField(blank=True)
    question_history = models.JSONField(default=list, blank=True)
    response_history = models.JSONField(default=list, blank=True)
    ai_suggestions = models.JSONField(default=list, blank=True)
    
    # Session status
    is_active = models.BooleanField(default=True)
    current_phase = models.CharField(max_length=20, choices=[
        ('introduction', 'Introduction'),
        ('technical', 'Technical Questions'),
        ('behavioral', 'Behavioral Questions'),
        ('system_design', 'System Design'),
        ('closing', 'Closing'),
    ], default='introduction')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session {self.session_id} - {self.interview}"

    class Meta:
        verbose_name = "Interview Session"
        verbose_name_plural = "Interview Sessions"


class InterviewFeedback(models.Model):
    """Detailed feedback from interviewer with AI collaboration"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interview = models.OneToOneField(Interview, on_delete=models.CASCADE, related_name='feedback_details')
    
    # Technical assessment
    technical_skills_assessment = models.TextField(blank=True)
    coding_ability = models.TextField(blank=True)
    system_design_skills = models.TextField(blank=True)
    
    # Soft skills assessment
    communication_skills = models.TextField(blank=True)
    problem_solving_approach = models.TextField(blank=True)
    teamwork_ability = models.TextField(blank=True)
    
    # Experience assessment
    relevant_experience = models.TextField(blank=True)
    project_examples = models.TextField(blank=True)
    learning_ability = models.TextField(blank=True)
    
    # Cultural fit
    cultural_alignment = models.TextField(blank=True)
    work_style = models.TextField(blank=True)
    career_goals = models.TextField(blank=True)
    
    # Final assessment
    overall_impression = models.TextField(blank=True)
    hiring_recommendation = models.TextField(blank=True)
    concerns = models.TextField(blank=True)
    
    # AI Collaboration
    ai_generated_feedback = models.TextField(blank=True, help_text="AI-generated feedback summary")
    human_edited_feedback = models.TextField(blank=True, help_text="Human-edited version of AI feedback")
    ai_confidence_score = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True, help_text="AI confidence in assessment (0-1)")
    
    # Competency-specific feedback
    competency_feedback = models.JSONField(default=dict, blank=True, help_text="Detailed feedback for each competency")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Feedback for {self.interview}"

    class Meta:
        verbose_name = "Interview Feedback"
        verbose_name_plural = "Interview Feedbacks"


class AIInterviewAssistant(models.Model):
    """AI assistant configuration and settings for interviews"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="Name of the AI assistant")
    description = models.TextField(blank=True)
    
    # AI Configuration
    ai_model = models.CharField(max_length=50, default='gemini-pro', help_text="AI model to use")
    ai_provider = models.CharField(max_length=20, choices=[
        ('gemini', 'Google Gemini'),
        ('openai', 'OpenAI'),
        ('claude', 'Anthropic Claude'),
    ], default='gemini')
    
    # Behavior Settings
    question_generation_enabled = models.BooleanField(default=True)
    response_analysis_enabled = models.BooleanField(default=True)
    followup_suggestions_enabled = models.BooleanField(default=True)
    bias_detection_enabled = models.BooleanField(default=True)
    
    # Personality/Behavior
    assistant_personality = models.CharField(max_length=20, choices=[
        ('professional', 'Professional'),
        ('friendly', 'Friendly'),
        ('technical', 'Technical'),
        ('coaching', 'Coaching'),
    ], default='professional')
    
    # Prompt Templates
    question_generation_prompt = models.TextField(blank=True, help_text="Custom prompt for question generation")
    response_analysis_prompt = models.TextField(blank=True, help_text="Custom prompt for response analysis")
    followup_prompt = models.TextField(blank=True, help_text="Custom prompt for follow-up questions")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.ai_provider})"

    class Meta:
        verbose_name = "AI Interview Assistant"
        verbose_name_plural = "AI Interview Assistants"
