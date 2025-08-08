from django.db import models
from django.conf import settings
from resume_checker.models import JobDescription, Candidate, Application


class HiringManager(models.Model):
    """Hiring Manager profile linked to User"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='hiring_manager_profile')
    company = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.company}"


class JobPosting(models.Model):
    """Job posting created by hiring manager"""
    hiring_manager = models.ForeignKey(HiringManager, on_delete=models.CASCADE, related_name='job_postings')
    job_description = models.OneToOneField(JobDescription, on_delete=models.CASCADE, related_name='hiring_manager_posting')
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('closed', 'Closed'),
        ('filled', 'Filled')
    ], default='draft')
    priority = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent')
    ], default='medium')
    target_hiring_date = models.DateField(null=True, blank=True)
    max_applications = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.job_description.title} - {self.status}"


class CandidateEvaluation(models.Model):
    """Hiring manager's evaluation of candidates"""
    hiring_manager = models.ForeignKey(HiringManager, on_delete=models.CASCADE, related_name='evaluations')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='hiring_manager_evaluations')
    job_posting = models.ForeignKey(JobPosting, on_delete=models.CASCADE, related_name='candidate_evaluations')
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='hiring_manager_evaluation')
    
    # Evaluation scores
    technical_score = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    experience_score = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    cultural_fit_score = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    overall_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    
    # Decision
    decision = models.CharField(max_length=20, choices=[
        ('pending', 'Pending Review'),
        ('shortlisted', 'Shortlisted'),
        ('interview', 'Schedule Interview'),
        ('rejected', 'Rejected'),
        ('hired', 'Hired')
    ], default='pending')
    
    # Notes
    notes = models.TextField(blank=True)
    strengths = models.TextField(blank=True)
    concerns = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.candidate.user.get_full_name()} - {self.job_posting.job_description.title}"

    def save(self, *args, **kwargs):
        # Calculate overall score if all individual scores are provided
        if all([self.technical_score, self.experience_score, self.cultural_fit_score]):
            self.overall_score = (self.technical_score + self.experience_score + self.cultural_fit_score) / 3
        super().save(*args, **kwargs)


class InterviewSchedule(models.Model):
    """Interview scheduling by hiring manager"""
    hiring_manager = models.ForeignKey(HiringManager, on_delete=models.CASCADE, related_name='scheduled_interviews')
    candidate_evaluation = models.OneToOneField(CandidateEvaluation, on_delete=models.CASCADE, related_name='interview_schedule')
    
    interview_type = models.CharField(max_length=20, choices=[
        ('phone', 'Phone Screen'),
        ('video', 'Video Call'),
        ('onsite', 'On-site'),
        ('technical', 'Technical Assessment')
    ])
    
    scheduled_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    interviewer = models.ForeignKey('interviewer.Interviewer', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_interviews')
    
    status = models.CharField(max_length=20, choices=[
        ('scheduled', 'Scheduled'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rescheduled', 'Rescheduled')
    ], default='scheduled')
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.candidate_evaluation.candidate.user.get_full_name()} - {self.interview_type}"


class HiringDecision(models.Model):
    """Final hiring decision by hiring manager"""
    hiring_manager = models.ForeignKey(HiringManager, on_delete=models.CASCADE, related_name='hiring_decisions')
    candidate_evaluation = models.OneToOneField(CandidateEvaluation, on_delete=models.CASCADE, related_name='hiring_decision')
    
    decision = models.CharField(max_length=20, choices=[
        ('offer', 'Make Offer'),
        ('reject', 'Reject'),
        ('hold', 'Put on Hold'),
        ('refer', 'Refer to Another Role')
    ])
    
    offer_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    offer_currency = models.CharField(max_length=3, default='USD')
    offer_notes = models.TextField(blank=True)
    
    rejection_reason = models.TextField(blank=True)
    feedback_for_candidate = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.candidate_evaluation.candidate.user.get_full_name()} - {self.decision}"
