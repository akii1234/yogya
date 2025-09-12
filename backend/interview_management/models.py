import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from user_management.models import User
from candidate_ranking.models import Candidate, JobDescription


def generate_session_id():
    """Generate a unique session ID"""
    return f"INT-{uuid.uuid4().hex[:8].upper()}"


class InterviewSession(models.Model):
    """
    Represents a complete interview session with candidate, interviewer, and evaluation data.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session_id = models.CharField(max_length=20, unique=True, default=generate_session_id)
    
    # Interview participants
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='management_interview_sessions')
    interviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conducted_management_interviews')
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE, related_name='management_interview_sessions')
    
    # Interview configuration
    interview_type = models.CharField(max_length=20, choices=[
        ('technical', 'Technical Interview'),
        ('behavioral', 'Behavioral Interview'),
        ('mixed', 'Mixed Interview'),
        ('screening', 'Initial Screening'),
        ('final', 'Final Round'),
    ], default='mixed')
    
    interview_mode = models.CharField(max_length=20, choices=[
        ('video', 'Video Call'),
        ('audio', 'Audio Call'),
        ('text', 'Text-based'),
        ('onsite', 'On-site'),
    ], default='video')
    
    # AI configuration
    ai_enabled = models.BooleanField(default=True)
    ai_mode = models.CharField(max_length=20, choices=[
        ('ai_assisted', 'AI Assisted'),
        ('ai_co_pilot', 'AI Co-Pilot'),
        ('ai_lead', 'AI Lead'),
    ], default='ai_assisted')
    
    # Session details
    scheduled_date = models.DateTimeField()
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=60)
    
    # Session status
    status = models.CharField(max_length=20, choices=[
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ], default='scheduled')
    
    # Meeting details
    meeting_link = models.URLField(blank=True, null=True)
    meeting_instructions = models.TextField(blank=True)
    
    # Session metadata
    notes = models.TextField(blank=True)
    recording_url = models.URLField(blank=True, null=True)
    transcription = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Interview Session'
        verbose_name_plural = 'Interview Sessions'
    
    def __str__(self):
        return f"Interview {self.session_id} - {self.candidate.email} for {self.job_description.title}"
    
    @property
    def duration_actual(self):
        """Calculate actual interview duration in minutes"""
        if self.actual_start_time and self.actual_end_time:
            return int((self.actual_end_time - self.actual_start_time).total_seconds() / 60)
        return None
    
    @property
    def is_completed(self):
        """Check if interview is completed"""
        return self.status == 'completed'
    
    @property
    def overall_score(self):
        """Calculate weighted overall score from competency evaluations"""
        evaluations = self.competency_evaluations.all()
        if not evaluations:
            return None
        
        total_score = 0
        total_weight = 0
        
        for evaluation in evaluations:
            weight = evaluation.weightage
            score = evaluation.score
            total_score += (score * weight)
            total_weight += weight
        
        if total_weight > 0:
            return round(total_score / total_weight, 2)
        return None


class CompetencyEvaluation(models.Model):
    """
    Individual competency evaluation within an interview session.
    Implements STAR/CAR methodology with structured scoring.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(InterviewSession, on_delete=models.CASCADE, related_name='competency_evaluations')
    
    # Competency reference (from competency_hiring app)
    competency_title = models.CharField(max_length=100)  # e.g., "Problem Solving"
    competency_description = models.TextField()
    evaluation_method = models.CharField(max_length=10, choices=[
        ('STAR', 'STAR (Situation, Task, Action, Result)'),
        ('CAR', 'CAR (Context, Action, Result)'),
        ('SOAR', 'SOAR (Situation, Obstacle, Action, Result)'),
    ], default='STAR')
    
    # Scoring
    score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Score from 0-100"
    )
    
    weightage = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Weightage percentage"
    )
    
    # Performance level
    performance_level = models.CharField(max_length=20, choices=[
        ('novice', 'Novice (0-20)'),
        ('beginner', 'Beginner (21-40)'),
        ('competent', 'Competent (41-60)'),
        ('proficient', 'Proficient (61-80)'),
        ('expert', 'Expert (81-100)'),
    ])
    
    # STAR/CAR structured feedback
    star_observations = models.JSONField(default=dict, blank=True, help_text="STAR structure observations")
    car_observations = models.JSONField(default=dict, blank=True, help_text="CAR structure observations")
    
    # Detailed feedback
    strengths = models.TextField(blank=True, help_text="Key strengths demonstrated")
    areas_for_improvement = models.TextField(blank=True, help_text="Areas that need improvement")
    detailed_feedback = models.TextField(blank=True, help_text="Comprehensive feedback")
    
    # Evaluation criteria assessment
    criteria_scores = models.JSONField(default=dict, help_text="Individual criteria scores")
    criteria_feedback = models.JSONField(default=dict, help_text="Feedback for each criterion")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['session', 'competency_title']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.competency_title} - {self.session.session_id} - Score: {self.score}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate performance level based on score
        if self.score <= 20:
            self.performance_level = 'novice'
        elif self.score <= 40:
            self.performance_level = 'beginner'
        elif self.score <= 60:
            self.performance_level = 'competent'
        elif self.score <= 80:
            self.performance_level = 'proficient'
        else:
            self.performance_level = 'expert'
        
        super().save(*args, **kwargs)
    
    @property
    def weighted_score(self):
        """Calculate weighted score contribution"""
        return (self.score * self.weightage) / 100


class InterviewFeedback(models.Model):
    """
    Comprehensive interview feedback with AI insights and recommendations.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(InterviewSession, on_delete=models.CASCADE, related_name='feedback')
    
    # Overall assessment
    overall_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Overall interview score"
    )
    
    overall_recommendation = models.CharField(max_length=20, choices=[
        ('proceed', 'Proceed to Next Round'),
        ('hold', 'Hold for Further Review'),
        ('reject', 'Reject'),
        ('strong_hire', 'Strong Hire'),
        ('conditional_hire', 'Conditional Hire'),
    ])
    
    # Detailed feedback
    interviewer_notes = models.TextField(blank=True, help_text="Interviewer's detailed notes")
    ai_insights = models.TextField(blank=True, help_text="AI-generated insights")
    strengths_summary = models.TextField(blank=True, help_text="Overall strengths")
    improvement_areas = models.TextField(blank=True, help_text="Areas for improvement")
    
    # STAR/CAR methodology summary
    star_summary = models.JSONField(default=dict, help_text="Overall STAR observations")
    car_summary = models.JSONField(default=dict, help_text="Overall CAR observations")
    
    # Competency breakdown
    competency_scores = models.JSONField(default=dict, help_text="Scores by competency")
    competency_feedback = models.JSONField(default=dict, help_text="Feedback by competency")
    
    # Cultural fit and values
    cultural_fit_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    values_alignment = models.JSONField(default=dict, help_text="Alignment with company values")
    
    # Technical assessment (for technical roles)
    technical_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    technical_feedback = models.TextField(blank=True)
    
    # Next steps
    next_steps = models.TextField(blank=True, help_text="Recommended next steps")
    follow_up_required = models.BooleanField(default=False)
    follow_up_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Interview Feedback'
        verbose_name_plural = 'Interview Feedback'
    
    def __str__(self):
        return f"Feedback - {self.session.session_id} - {self.overall_recommendation}"
    
    @property
    def is_positive(self):
        """Check if feedback is positive"""
        return self.overall_recommendation in ['proceed', 'strong_hire', 'conditional_hire']
    
    @property
    def needs_follow_up(self):
        """Check if follow-up is required"""
        return self.follow_up_required or self.overall_recommendation == 'hold'


class InterviewQuestion(models.Model):
    """
    Questions asked during an interview session with candidate responses.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(InterviewSession, on_delete=models.CASCADE, related_name='questions')
    
    # Question details
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=[
        ('behavioral', 'Behavioral (STAR/CAR)'),
        ('technical', 'Technical'),
        ('problem_solving', 'Problem Solving'),
        ('scenario', 'Scenario-Based'),
        ('coding', 'Coding Challenge'),
        ('situational', 'Situational'),
    ], default='behavioral')
    
    competency_title = models.CharField(max_length=100, blank=True)
    
    # Question structure
    star_structure = models.JSONField(default=dict, blank=True)
    car_structure = models.JSONField(default=dict, blank=True)
    
    # Candidate response
    candidate_response = models.TextField(blank=True)
    response_duration_seconds = models.IntegerField(null=True, blank=True)
    
    # AI assistance
    ai_suggestions = models.JSONField(default=list, blank=True)
    ai_follow_up_questions = models.JSONField(default=list, blank=True)
    
    # Evaluation
    question_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    question_feedback = models.TextField(blank=True)
    
    # Timing
    asked_at = models.DateTimeField(auto_now_add=True)
    answered_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['asked_at']
    
    def __str__(self):
        return f"Q: {self.question_text[:50]}... - {self.session.session_id}"


class InterviewAnalytics(models.Model):
    """
    Analytics and insights from interview sessions.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.OneToOneField(InterviewSession, on_delete=models.CASCADE, related_name='analytics')
    
    # Performance metrics
    total_questions_asked = models.IntegerField(default=0)
    average_response_time = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    
    # Competency analysis
    strongest_competency = models.CharField(max_length=100, blank=True)
    weakest_competency = models.CharField(max_length=100, blank=True)
    competency_gaps = models.JSONField(default=list, help_text="Identified competency gaps")
    
    # AI usage analytics
    ai_suggestions_used = models.IntegerField(default=0)
    ai_follow_ups_generated = models.IntegerField(default=0)
    ai_effectiveness_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Interview quality metrics
    interview_quality_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    bias_detection_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Detailed analytics
    time_spent_per_competency = models.JSONField(default=dict)
    question_effectiveness = models.JSONField(default=dict)
    candidate_engagement_metrics = models.JSONField(default=dict)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Interview Analytics'
        verbose_name_plural = 'Interview Analytics'
    
    def __str__(self):
        return f"Analytics - {self.session.session_id}"


class InterviewRoom(models.Model):
    """Model for managing WebRTC interview rooms"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room_id = models.CharField(max_length=100, unique=True)
    interview = models.ForeignKey(InterviewSession, on_delete=models.CASCADE, related_name='rooms')
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # WebRTC specific fields
    ice_servers = models.JSONField(default=list)  # STUN/TURN servers
    recording_enabled = models.BooleanField(default=True)
    screen_sharing_enabled = models.BooleanField(default=True)
    chat_enabled = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'interview_rooms'
    
    def __str__(self):
        return f"Room {self.room_id} - {self.interview}"
    
    def start_room(self):
        """Start the interview room"""
        self.started_at = timezone.now()
        self.is_active = True
        self.save()
    
    def end_room(self):
        """End the interview room"""
        self.ended_at = timezone.now()
        self.is_active = False
        self.save()

class RoomParticipant(models.Model):
    """Model for tracking participants in interview rooms"""
    PARTICIPANT_TYPES = [
        ('interviewer', 'Interviewer'),
        ('candidate', 'Candidate'),
        ('observer', 'Observer'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(InterviewRoom, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    participant_type = models.CharField(max_length=20, choices=PARTICIPANT_TYPES)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # WebRTC connection info
    peer_id = models.CharField(max_length=100, null=True, blank=True)
    connection_state = models.CharField(max_length=20, default='disconnected')
    
    class Meta:
        db_table = 'room_participants'
        unique_together = ['room', 'user']
    
    def __str__(self):
        return f"{self.user.email} - {self.participant_type} in {self.room.room_id}"
    
    def join_room(self, peer_id=None):
        """Join the interview room"""
        self.joined_at = timezone.now()
        self.is_active = True
        self.connection_state = 'connecting'
        if peer_id:
            self.peer_id = peer_id
        self.save()
    
    def leave_room(self):
        """Leave the interview room"""
        self.left_at = timezone.now()
        self.is_active = False
        self.connection_state = 'disconnected'
        self.save()

class InterviewRecording(models.Model):
    """Model for storing interview recordings"""
    RECORDING_TYPES = [
        ('video', 'Video Recording'),
        ('audio', 'Audio Recording'),
        ('screen', 'Screen Recording'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(InterviewRoom, on_delete=models.CASCADE, related_name='recordings')
    recording_type = models.CharField(max_length=20, choices=RECORDING_TYPES)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField(null=True, blank=True)
    duration = models.IntegerField(null=True, blank=True)  # Duration in seconds
    created_at = models.DateTimeField(auto_now_add=True)
    is_processed = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'interview_recordings'
    
    def __str__(self):
        return f"{self.recording_type} recording for {self.room}"

class ChatMessage(models.Model):
    """Model for interview chat messages"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(InterviewRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_system_message = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'chat_messages'
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender.email}: {self.message[:50]}..."
