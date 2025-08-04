# hiring_app/models.py
import uuid
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator

def generate_job_id():
    """Generate a unique job ID in format: JOB-XXXXXX"""
    return f"JOB-{uuid.uuid4().hex[:6].upper()}"

def generate_candidate_id():
    """Generate a unique candidate ID in format: CAN-XXXXXX"""
    return f"CAN-{uuid.uuid4().hex[:6].upper()}"

def generate_application_id():
    """Generate a unique application ID in format: APP-XXXXXX"""
    return f"APP-{uuid.uuid4().hex[:6].upper()}"

class JobDescription(models.Model):
    """
    MVP model to store Job Descriptions with proper job ID for distinction.
    Focuses on essential fields for effective hiring.
    """
    # Unique Job ID for distinction (e.g., JOB-000KYQ)
    job_id = models.CharField(max_length=10, unique=True, default=generate_job_id, editable=False)
    
    # Essential Information
    title = models.CharField(max_length=255, help_text="Job title (e.g., Senior Python Developer)")
    company = models.CharField(max_length=255, help_text="Company name")
    department = models.CharField(max_length=255, help_text="Department (e.g., Digital Products, Engineering, Innovation)")
    location = models.CharField(max_length=255, blank=True, null=True, help_text="Job location")
    
    # Job Details
    description = models.TextField(help_text="Full job description")
    requirements = models.TextField(blank=True, null=True, help_text="Specific requirements")
    
    # Experience Level (Essential for matching)
    experience_level = models.CharField(
        max_length=50,
        choices=[
            ('entry', 'Entry Level'),
            ('junior', 'Junior'),
            ('mid', 'Mid Level'),
            ('senior', 'Senior'),
            ('lead', 'Lead'),
        ],
        default='mid'
    )
    min_experience_years = models.PositiveIntegerField(default=0, help_text="Minimum years of experience")
    
    # Employment Type
    employment_type = models.CharField(
        max_length=50,
        choices=[
            ('full_time', 'Full Time'),
            ('part_time', 'Part Time'),
            ('contract', 'Contract'),
            ('internship', 'Internship'),
        ],
        default='full_time'
    )
    
    # Status
    status = models.CharField(
        max_length=50,
        choices=[
            ('draft', 'Draft'),
            ('active', 'Active'),
            ('closed', 'Closed'),
        ],
        default='active'
    )
    
    # Timestamps
    posted_date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # NLP Processing
    processed_text = models.TextField(blank=True, null=True, help_text="Preprocessed text for NLP operations")
    extracted_skills = models.JSONField(default=list, blank=True, help_text="Extracted skills from job description")
    
    class Meta:
        ordering = ['-posted_date']
        verbose_name = "Job Description"
        verbose_name_plural = "Job Descriptions"

    def __str__(self):
        return f"{self.job_id} - {self.title} at {self.company} ({self.department})"

    def save(self, *args, **kwargs):
        if not self.job_id:
            self.job_id = generate_job_id()
        super().save(*args, **kwargs)

class Candidate(models.Model):
    """
    MVP model to store candidate information with proper candidate ID.
    Focuses on essential fields for hiring decisions.
    """
    # Unique Candidate ID for distinction (e.g., CAN-XXXXXX)
    candidate_id = models.CharField(max_length=10, unique=True, default=generate_candidate_id, editable=False)
    
    # Essential Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Location (Important for hiring decisions)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    
    # Professional Information (Essential for matching)
    current_title = models.CharField(max_length=255, blank=True, null=True)
    current_company = models.CharField(max_length=255, blank=True, null=True)
    total_experience_years = models.PositiveIntegerField(default=0, help_text="Total years of experience")
    
    # Education (Important for hiring)
    highest_education = models.CharField(
        max_length=50,
        choices=[
            ('high_school', 'High School'),
            ('associate', 'Associate Degree'),
            ('bachelor', 'Bachelor Degree'),
            ('master', 'Master Degree'),
            ('phd', 'PhD'),
        ],
        blank=True, null=True
    )
    degree_field = models.CharField(max_length=255, blank=True, null=True)
    
    # Skills (Essential for matching)
    skills = models.JSONField(default=list, blank=True, help_text="List of skills")
    
    # Status
    status = models.CharField(
        max_length=50,
        choices=[
            ('active', 'Active'),
            ('inactive', 'Inactive'),
        ],
        default='active'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Candidate"
        verbose_name_plural = "Candidates"

    def __str__(self):
        return f"{self.candidate_id} - {self.full_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def save(self, *args, **kwargs):
        if not self.candidate_id:
            self.candidate_id = generate_candidate_id()
        super().save(*args, **kwargs)

class Resume(models.Model):
    """
    MVP model to store uploaded resumes with essential parsing information.
    """
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='resumes')
    
    # File Information
    file = models.FileField(upload_to='resumes/', help_text="Upload resume file (PDF, DOCX, TXT)")
    file_name = models.CharField(max_length=255, blank=True, null=True)
    file_type = models.CharField(max_length=10, blank=True, null=True, help_text="File extension")
    
    # Parsed Content (Essential for matching)
    parsed_text = models.TextField(blank=True, null=True, help_text="Extracted text from resume")
    processed_text = models.TextField(blank=True, null=True, help_text="Preprocessed text for NLP")
    
    # Extracted Information (Essential for matching)
    extracted_skills = models.JSONField(default=list, blank=True, help_text="Skills extracted from resume")
    extracted_experience = models.JSONField(default=list, blank=True, help_text="Work experience extracted")
    extracted_education = models.JSONField(default=list, blank=True, help_text="Education extracted")
    
    # Processing Status
    processing_status = models.CharField(
        max_length=50,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    
    # Metadata
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Resume"
        verbose_name_plural = "Resumes"

    def __str__(self):
        return f"{self.candidate.full_name} - {self.file_name or 'Resume'}"

    def save(self, *args, **kwargs):
        if not self.file_name and self.file:
            self.file_name = self.file.name
        if not self.file_type and self.file:
            self.file_type = self.file.name.split('.')[-1].lower()
        super().save(*args, **kwargs)

class Match(models.Model):
    """
    MVP model to store match results with comprehensive scoring for hiring decisions.
    """
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE, related_name='matches')
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE, related_name='matches')
    
    # Overall Score (Essential for hiring decisions)
    overall_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Overall match score (0-100)"
    )
    
    # Detailed Scoring Breakdown (Essential for understanding match quality)
    skill_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Skill matching score")
    experience_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Experience matching score")
    technical_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Technical term matching score")
    semantic_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Semantic similarity score")
    education_score = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Education matching score")
    
    # Match Details (Essential for hiring decisions)
    matched_skills = models.JSONField(default=list, blank=True, help_text="Skills that matched")
    missing_skills = models.JSONField(default=list, blank=True, help_text="Skills that are missing")
    experience_gap = models.IntegerField(blank=True, null=True, help_text="Experience gap in years")
    
    # Hiring Status (Essential for hiring workflow)
    status = models.CharField(
        max_length=50,
        choices=[
            ('new', 'New'),
            ('reviewed', 'Reviewed'),
            ('shortlisted', 'Shortlisted'),
            ('rejected', 'Rejected'),
            ('interview_scheduled', 'Interview Scheduled'),
            ('interviewed', 'Interviewed'),
            ('hired', 'Hired'),
        ],
        default='new'
    )
    
    # Interview Process (Essential for hiring)
    is_invited_for_interview = models.BooleanField(default=False)
    interview_date = models.DateTimeField(blank=True, null=True)
    interview_notes = models.TextField(blank=True, null=True)
    
    # Hiring Notes (Essential for decision making)
    recruiter_notes = models.TextField(blank=True, null=True, help_text="Recruiter's notes")
    hiring_manager_notes = models.TextField(blank=True, null=True, help_text="Hiring manager's notes")
    
    # Timestamps
    matched_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('job_description', 'resume')
        ordering = ['-overall_score', '-matched_at']
        verbose_name = "Match"
        verbose_name_plural = "Matches"

    def __str__(self):
        return f"{self.job_description.title} - {self.resume.candidate.full_name} ({self.overall_score}%)"

    @property
    def score_percentage(self):
        return f"{self.overall_score:.2f}%"

    @property
    def is_high_match(self):
        return self.overall_score >= 80

    @property
    def is_medium_match(self):
        return 60 <= self.overall_score < 80

    @property
    def is_low_match(self):
        return self.overall_score < 60

class Application(models.Model):
    """
    Model to track candidate applications and their conversion from matches.
    This tracks the pipeline from matching to actual application.
    """
    # Unique Application ID
    application_id = models.CharField(max_length=10, unique=True, default=generate_application_id, editable=False)
    
    # Related Models
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='applications')
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='applications', blank=True, null=True)
    
    # Application Details
    cover_letter = models.TextField(blank=True, null=True, help_text="Cover letter content")
    expected_salary = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True, 
        help_text="Expected salary"
    )
    salary_currency = models.CharField(
        max_length=3, 
        default='USD', 
        choices=[
            ('USD', 'US Dollar'),
            ('EUR', 'Euro'),
            ('GBP', 'British Pound'),
            ('INR', 'Indian Rupee'),
        ]
    )
    
    # Application Status
    status = models.CharField(
        max_length=50,
        choices=[
            ('applied', 'Applied'),
            ('under_review', 'Under Review'),
            ('shortlisted', 'Shortlisted'),
            ('interview_scheduled', 'Interview Scheduled'),
            ('interviewed', 'Interviewed'),
            ('offer_made', 'Offer Made'),
            ('offer_accepted', 'Offer Accepted'),
            ('offer_declined', 'Offer Declined'),
            ('rejected', 'Rejected'),
            ('withdrawn', 'Withdrawn'),
        ],
        default='applied'
    )
    
    # Application Source
    source = models.CharField(
        max_length=50,
        choices=[
            ('ats_match', 'ATS Match'),
            ('direct_apply', 'Direct Application'),
            ('referral', 'Referral'),
            ('job_board', 'Job Board'),
            ('linkedin', 'LinkedIn'),
            ('other', 'Other'),
        ],
        default='ats_match',
        help_text="How the candidate found the job"
    )
    
    # Application Process
    is_shortlisted = models.BooleanField(default=False)
    is_interviewed = models.BooleanField(default=False)
    interview_rounds = models.PositiveIntegerField(default=0, help_text="Number of interview rounds completed")
    
    # Notes and Feedback
    recruiter_notes = models.TextField(blank=True, null=True)
    hiring_manager_notes = models.TextField(blank=True, null=True)
    candidate_notes = models.TextField(blank=True, null=True, help_text="Notes from candidate")
    
    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True)
    status_updated_at = models.DateTimeField(auto_now=True)
    shortlisted_at = models.DateTimeField(blank=True, null=True)
    interviewed_at = models.DateTimeField(blank=True, null=True)
    offer_made_at = models.DateTimeField(blank=True, null=True)
    offer_accepted_at = models.DateTimeField(blank=True, null=True)
    rejected_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ('job_description', 'candidate')
        ordering = ['-applied_at']
        verbose_name = "Application"
        verbose_name_plural = "Applications"

    def __str__(self):
        return f"{self.application_id} - {self.candidate.full_name} for {self.job_description.title}"

    def save(self, *args, **kwargs):
        if not self.application_id:
            self.application_id = generate_application_id()
        super().save(*args, **kwargs)

    @property
    def is_active(self):
        """Check if application is still active (not rejected/withdrawn/accepted)"""
        return self.status not in ['rejected', 'withdrawn', 'offer_accepted']

    @property
    def days_since_applied(self):
        """Calculate days since application"""
        return (timezone.now() - self.applied_at).days

    @property
    def conversion_from_match(self):
        """Check if this application came from an ATS match"""
        return self.source == 'ats_match' and self.match is not None