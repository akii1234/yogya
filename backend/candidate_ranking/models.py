from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from resume_checker.models import JobDescription, Candidate, Application
import uuid


def generate_ranking_id():
    """Generate a unique ranking ID in format: RANK-XXXXXX"""
    return f"RANK-{uuid.uuid4().hex[:6].upper()}"


def generate_batch_id():
    """Generate a unique batch ID in format: BATCH-XXXXXXXX"""
    return f"BATCH-{uuid.uuid4().hex[:8].upper()}"


class CandidateRanking(models.Model):
    """
    Model to store candidate ranking results for job positions.
    Provides a simple skill-based matching algorithm without salary considerations.
    """
    
    # Unique Ranking ID
    ranking_id = models.CharField(max_length=10, unique=True, default=generate_ranking_id, editable=False)
    
    # Related Models
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE, related_name='candidate_rankings')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='job_rankings')
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='rankings', blank=True, null=True)
    
    # Ranking Scores (0-100)
    overall_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Overall ranking score (0-100)"
    )
    
    # Detailed Scoring Breakdown
    skill_match_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0, 
        help_text="Skill matching score (0-100)"
    )
    experience_match_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0, 
        help_text="Experience level matching score (0-100)"
    )
    education_match_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0, 
        help_text="Education matching score (0-100)"
    )
    location_match_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0, 
        help_text="Location compatibility score (0-100)"
    )
    
    # Ranking Details
    rank_position = models.PositiveIntegerField(help_text="Position in the ranking (1 = top candidate)")
    total_candidates = models.PositiveIntegerField(help_text="Total number of candidates for this job")
    
    # Match Analysis
    matched_skills = models.JSONField(default=list, blank=True, help_text="Skills that matched the job requirements")
    missing_skills = models.JSONField(default=list, blank=True, help_text="Skills that are missing from candidate")
    skill_gap_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0, 
        help_text="Percentage of missing skills"
    )
    
    # Experience Analysis
    experience_years = models.PositiveIntegerField(help_text="Candidate's total experience years")
    required_experience_years = models.PositiveIntegerField(help_text="Job's required experience years")
    experience_gap = models.IntegerField(help_text="Experience gap (positive = overqualified, negative = underqualified)")
    
    # Ranking Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('active', 'Active'),
            ('archived', 'Archived'),
            ('expired', 'Expired'),
        ],
        default='active'
    )
    
    # HR Actions
    is_shortlisted = models.BooleanField(default=False)
    is_rejected = models.BooleanField(default=False)
    hr_notes = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_ranked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('job_description', 'candidate')
        ordering = ['rank_position', '-overall_score']
        verbose_name = "Candidate Ranking"
        verbose_name_plural = "Candidate Rankings"
    
    def __str__(self):
        return f"{self.ranking_id} - {self.candidate.full_name} ranked #{self.rank_position} for {self.job_description.title}"
    
    def save(self, *args, **kwargs):
        if not self.ranking_id:
            self.ranking_id = generate_ranking_id()
        super().save(*args, **kwargs)
    
    @property
    def score_percentage(self):
        """Return score as percentage string"""
        return f"{self.overall_score}%"
    
    @property
    def is_top_candidate(self):
        """Check if candidate is in top 10%"""
        return self.rank_position <= max(1, self.total_candidates // 10)
    
    @property
    def is_high_match(self):
        """Check if overall score is high (>= 80)"""
        return self.overall_score >= 80
    
    @property
    def is_medium_match(self):
        """Check if overall score is medium (60-79)"""
        return 60 <= self.overall_score < 80
    
    @property
    def is_low_match(self):
        """Check if overall score is low (< 60)"""
        return self.overall_score < 60
    
    @property
    def experience_status(self):
        """Get experience status description"""
        if self.experience_gap >= 2:
            return "Overqualified"
        elif self.experience_gap <= -2:
            return "Underqualified"
        else:
            return "Well Matched"


class RankingBatch(models.Model):
    """
    Model to track ranking batches for jobs.
    Useful for bulk ranking operations and analytics.
    """
    
    batch_id = models.CharField(max_length=20, unique=True, default=generate_batch_id, editable=False)
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE, related_name='ranking_batches')
    
    # Batch Details
    total_candidates = models.PositiveIntegerField(default=0)
    ranked_candidates = models.PositiveIntegerField(default=0)
    failed_rankings = models.PositiveIntegerField(default=0)
    
    # Batch Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
            ('partial', 'Partially Completed'),
        ],
        default='pending'
    )
    
    # Processing Details
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    processing_time_seconds = models.PositiveIntegerField(blank=True, null=True)
    
    # Error Tracking
    error_message = models.TextField(blank=True, null=True)
    
    # Created by
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='ranking_batches'
    )
    
    class Meta:
        ordering = ['-started_at']
        verbose_name = "Ranking Batch"
        verbose_name_plural = "Ranking Batches"
    
    def __str__(self):
        return f"{self.batch_id} - {self.job_description.title} ({self.status})"
    
    @property
    def success_rate(self):
        """Calculate success rate of the batch"""
        if self.total_candidates == 0:
            return 0
        return (self.ranked_candidates / self.total_candidates) * 100
    
    @property
    def is_completed(self):
        """Check if batch is completed"""
        return self.status in ['completed', 'partial']


class RankingCriteria(models.Model):
    """
    Model to store ranking criteria and weights for different job types.
    Allows customization of ranking algorithms.
    """
    
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    
    # Scoring Weights (must sum to 100)
    skill_weight = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=40,
        help_text="Weight for skill matching (0-100)"
    )
    experience_weight = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=30,
        help_text="Weight for experience matching (0-100)"
    )
    education_weight = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=20,
        help_text="Weight for education matching (0-100)"
    )
    location_weight = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=10,
        help_text="Weight for location matching (0-100)"
    )
    
    # Criteria Settings
    is_default = models.BooleanField(default=False, help_text="Use as default criteria")
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_default', 'name']
        verbose_name = "Ranking Criteria"
        verbose_name_plural = "Ranking Criteria"
    
    def __str__(self):
        return self.name
    
    def clean(self):
        """Validate that weights sum to 100"""
        from django.core.exceptions import ValidationError
        total_weight = (
            self.skill_weight + 
            self.experience_weight + 
            self.education_weight + 
            self.location_weight
        )
        if total_weight != 100:
            raise ValidationError(f"Weights must sum to 100, current sum: {total_weight}")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    @property
    def total_weight(self):
        """Calculate total weight"""
        return (
            self.skill_weight + 
            self.experience_weight + 
            self.education_weight + 
            self.location_weight
        )
