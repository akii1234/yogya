from django.db import models
from django.conf import settings


class Interviewer(models.Model):
    """Interviewer profile linked to User"""
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='interviewer_profile')
    company = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    title = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    
    # Interviewer specialization
    technical_skills = models.JSONField(default=list, blank=True, help_text="Technical skills for technical interviews")
    interview_types = models.JSONField(default=list, blank=True, help_text="Types of interviews they can conduct")
    experience_years = models.PositiveIntegerField(default=0, help_text="Years of interviewing experience")
    
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
    
    # Questions
    questions = models.JSONField(default=list, blank=True, help_text="List of questions in the bank")
    
    is_public = models.BooleanField(default=False, help_text="Whether other interviewers can use this bank")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.category} ({self.difficulty_level})"

    class Meta:
        verbose_name = "Question Bank"
        verbose_name_plural = "Question Banks"


class Interview(models.Model):
    """Interview conducted by interviewer"""
    interviewer = models.ForeignKey(Interviewer, on_delete=models.CASCADE, related_name='conducted_interviews')
    candidate = models.ForeignKey('resume_checker.Candidate', on_delete=models.CASCADE, related_name='interviews')
    job_posting = models.ForeignKey('hiring_manager.JobPosting', on_delete=models.CASCADE, related_name='interviews')
    
    # Interview details
    interview_type = models.CharField(max_length=20, choices=[
        ('phone', 'Phone Screen'),
        ('video', 'Video Call'),
        ('onsite', 'On-site'),
        ('technical', 'Technical Assessment'),
        ('behavioral', 'Behavioral'),
        ('system_design', 'System Design')
    ])
    
    scheduled_date = models.DateTimeField()
    duration_minutes = models.IntegerField(default=60)
    actual_duration = models.IntegerField(null=True, blank=True, help_text="Actual duration in minutes")
    
    # Status
    status = models.CharField(max_length=20, choices=[
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show')
    ], default='scheduled')
    
    # Evaluation
    technical_score = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    communication_score = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    problem_solving_score = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    cultural_fit_score = models.IntegerField(choices=[(i, i) for i in range(1, 11)], null=True, blank=True)
    overall_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    
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
    
    # Notes
    notes = models.TextField(blank=True)
    questions_asked = models.JSONField(default=list, blank=True, help_text="Questions asked during interview")
    
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


class InterviewFeedback(models.Model):
    """Detailed feedback from interviewer"""
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
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Feedback for {self.interview}"

    class Meta:
        verbose_name = "Interview Feedback"
        verbose_name_plural = "Interview Feedbacks"
