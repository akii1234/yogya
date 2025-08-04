from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class CompetencyFramework(models.Model):
    """
    Defines competency frameworks for different roles/technologies.
    Example: Python Developer, Java Developer, Data Scientist, etc.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)  # e.g., "Python Developer"
    description = models.TextField()
    technology = models.CharField(max_length=50)  # e.g., "Python", "Java", "Data Science"
    level = models.CharField(max_length=20, choices=[
        ('junior', 'Junior'),
        ('mid', 'Mid-Level'),
        ('senior', 'Senior'),
        ('lead', 'Lead'),
        ('architect', 'Architect'),
    ])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.level})"


class Competency(models.Model):
    """
    Individual competencies within a framework.
    Enhanced for STAR/CAR behavioral interviewing to reduce bias.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    framework = models.ForeignKey(CompetencyFramework, on_delete=models.CASCADE, related_name='competencies')
    title = models.CharField(max_length=100, blank=True, null=True)  # e.g., "Problem Solving", "Communication"
    description = models.TextField(help_text="Clear description of the competency")
    
    # Behavioral Interview Structure
    evaluation_method = models.CharField(max_length=10, choices=[
        ('STAR', 'STAR (Situation, Task, Action, Result)'),
        ('CAR', 'CAR (Context, Action, Result)'),
        ('SOAR', 'SOAR (Situation, Obstacle, Action, Result)'),
    ], default='STAR', help_text="Behavioral interview methodology")
    
    # Evaluation Criteria (JSON field for structured criteria)
    evaluation_criteria = models.JSONField(default=list, blank=True, null=True, help_text="List of specific evaluation criteria")
    
    # Tags for categorization
    tags = models.JSONField(default=list, blank=True, null=True, help_text="Tags like ['Core', 'High Priority', 'Engineering']")
    
    # Sample behavioral question
    sample_question = models.TextField(blank=True, null=True, help_text="Example STAR/CAR question for this competency")
    
    # Weightage in percentage
    weightage = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=10.0,
        help_text="Weightage percentage in interview evaluation"
    )
    
    # Legacy fields for backward compatibility
    name = models.CharField(max_length=100, blank=True)  # Legacy field
    category = models.CharField(max_length=50, blank=True)  # Legacy field
    weight = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        default=5,
        help_text="Legacy importance weight (1-10)"
    )
    
    order = models.IntegerField(default=0, help_text="Display order within framework")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['framework', 'order', 'title']
        unique_together = ['framework', 'title']

    def __str__(self):
        return f"{self.framework.name} - {self.display_name}"
    
    @property
    def display_name(self):
        """Return title for new structure, name for legacy"""
        return self.title or self.name


class InterviewTemplate(models.Model):
    """
    Template for conducting interviews based on competency frameworks.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    framework = models.ForeignKey(CompetencyFramework, on_delete=models.CASCADE, related_name='interview_templates')
    description = models.TextField()
    duration_minutes = models.IntegerField(default=60, help_text="Expected interview duration")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.framework.name})"


class InterviewQuestion(models.Model):
    """
    Questions mapped to specific competencies for interview templates.
    Enhanced for behavioral interviewing with STAR/CAR methodology.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    template = models.ForeignKey(InterviewTemplate, on_delete=models.CASCADE, related_name='questions')
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE, related_name='questions')
    
    # Question content
    question_text = models.TextField(help_text="The actual question to ask")
    question_type = models.CharField(max_length=20, choices=[
        ('behavioral', 'Behavioral (STAR/CAR)'),
        ('technical', 'Technical'),
        ('problem_solving', 'Problem Solving'),
        ('scenario', 'Scenario-Based'),
        ('coding', 'Coding Challenge'),
        ('situational', 'Situational'),
    ], default='behavioral')
    
    # Behavioral interview structure
    star_structure = models.JSONField(default=dict, blank=True, help_text="STAR structure: {situation: '', task: '', action: '', result: ''}")
    car_structure = models.JSONField(default=dict, blank=True, help_text="CAR structure: {context: '', action: '', result: ''}")
    
    # Evaluation guidance
    evaluation_criteria = models.JSONField(default=list, help_text="Specific criteria to evaluate this question")
    expected_answer_points = models.JSONField(default=list, help_text="Key points expected in the answer")
    
    # Question metadata
    difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ], default='medium')
    
    time_allocation = models.IntegerField(default=5, help_text="Minutes allocated for this question")
    
    # Legacy fields
    expected_answer = models.TextField(blank=True, help_text="Legacy expected answer field")
    
    order = models.IntegerField(default=0, help_text="Question order in template")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['template', 'order']
        unique_together = ['template', 'order']

    def __str__(self):
        return f"{self.template.name} - {self.competency.title} - Q{self.order}"


class QuestionBank(models.Model):
    """
    Global question bank with tagging system for reuse and AI integration.
    This enables question reuse across templates and AI-powered question recommendations.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Question content
    question_text = models.TextField(help_text="The actual question to ask")
    question_type = models.CharField(max_length=20, choices=[
        ('behavioral', 'Behavioral (STAR/CAR)'),
        ('technical', 'Technical'),
        ('problem_solving', 'Problem Solving'),
        ('scenario', 'Scenario-Based'),
        ('coding', 'Coding Challenge'),
        ('situational', 'Situational'),
    ], default='behavioral')
    
    # Tagging system for AI integration
    tags = models.JSONField(
        default=list,
        help_text="Tags like ['communication', 'senior', 'technical', 'remote-team']"
    )
    
    # Metadata
    difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ], default='medium')
    
    # Usage analytics
    usage_count = models.IntegerField(default=0, help_text="How many times this question has been used")
    success_rate = models.DecimalField(
        max_digits=5, decimal_places=2, 
        null=True, blank=True,
        help_text="Success rate based on candidate performance"
    )
    
    # Evaluation criteria
    evaluation_criteria = models.JSONField(default=list, help_text="Specific criteria to evaluate this question")
    expected_answer_points = models.JSONField(default=list, help_text="Key points expected in the answer")
    
    # Behavioral structure
    star_structure = models.JSONField(default=dict, blank=True, help_text="STAR structure: {situation: '', task: '', action: '', result: ''}")
    car_structure = models.JSONField(default=dict, blank=True, help_text="CAR structure: {context: '', action: '', result: ''}")
    
    # Management
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-usage_count', '-success_rate']
        indexes = [
            models.Index(fields=['question_type']),
            models.Index(fields=['difficulty']),
            models.Index(fields=['tags']),
        ]

    def __str__(self):
        return f"{self.question_text[:50]}... ({self.question_type})"
    
    def increment_usage(self):
        """Increment usage count when question is used"""
        self.usage_count += 1
        self.save(update_fields=['usage_count', 'updated_at'])
    
    def update_success_rate(self, success_percentage):
        """Update success rate based on candidate performance"""
        if self.success_rate is None:
            self.success_rate = success_percentage
        else:
            # Weighted average with existing rate
            self.success_rate = (self.success_rate * 0.7) + (success_percentage * 0.3)
        self.save(update_fields=['success_rate', 'updated_at'])


class InterviewSession(models.Model):
    """
    Individual interview sessions for candidates.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey('resume_checker.Candidate', on_delete=models.CASCADE, related_name='interview_sessions')
    job_description = models.ForeignKey('resume_checker.JobDescription', on_delete=models.CASCADE, related_name='interview_sessions')
    template = models.ForeignKey(InterviewTemplate, on_delete=models.CASCADE, related_name='sessions')
    interviewer_name = models.CharField(max_length=100, blank=True)
    interviewer_email = models.EmailField(blank=True)
    scheduled_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    status = models.CharField(max_length=20, choices=[
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ], default='scheduled')
    notes = models.TextField(blank=True)
    overall_score = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at']

    def __str__(self):
        return f"{self.candidate.name} - {self.job_description.title} ({self.status})"


class CompetencyEvaluation(models.Model):
    """
    Individual competency evaluations within an interview session.
    Enhanced with justification fields for transparency and audit trail.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(InterviewSession, on_delete=models.CASCADE, related_name='evaluations')
    competency = models.ForeignKey(Competency, on_delete=models.CASCADE, related_name='evaluations')
    score = models.DecimalField(
        max_digits=5, decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Score out of 100"
    )
    level = models.CharField(max_length=20, choices=[
        ('novice', 'Novice'),
        ('beginner', 'Beginner'),
        ('competent', 'Competent'),
        ('proficient', 'Proficient'),
        ('expert', 'Expert'),
    ])
    feedback = models.TextField(blank=True)
    strengths = models.TextField(blank=True)
    areas_for_improvement = models.TextField(blank=True)
    
    # New justification fields for transparency and audit trail
    justification = models.TextField(
        blank=True,
        help_text="Detailed explanation of the score for transparency and audit trail"
    )
    
    # AI-generated insights
    ai_insights = models.JSONField(
        default=dict,
        help_text="AI-generated insights about the evaluation"
    )
    
    # Panel review support
    review_notes = models.TextField(
        blank=True,
        help_text="Notes for panel review discussions"
    )
    
    # Audit trail
    created_by = models.ForeignKey(
        'user_management.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='evaluations_created'
    )
    reviewed_by = models.ForeignKey(
        'user_management.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='evaluations_reviewed'
    )
    review_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['session', 'competency']
        ordering = ['session', 'competency__order']

    def __str__(self):
        return f"{self.session.candidate.name} - {self.competency.name} ({self.score}%)"


class AIInterviewSession(models.Model):
    """
    AI-powered interview sessions using LLMs.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(InterviewSession, on_delete=models.CASCADE, related_name='ai_session')
    llm_model = models.CharField(max_length=50, default='gpt-4')
    conversation_history = models.JSONField(default=list, help_text="Stored conversation with AI")
    current_question_index = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"AI Interview - {self.session.candidate.name}"


class InterviewAnalytics(models.Model):
    """
    Analytics and insights from interview sessions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(InterviewSession, on_delete=models.CASCADE, related_name='analytics')
    total_questions_asked = models.IntegerField(default=0)
    total_time_spent = models.IntegerField(default=0, help_text="Time in minutes")
    confidence_score = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    communication_score = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    problem_solving_score = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    technical_depth_score = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    recommendations = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Analytics - {self.session.candidate.name}"
