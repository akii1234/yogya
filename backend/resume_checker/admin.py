# hiring_app/admin.py
from django.contrib import admin
from .models import JobDescription, Candidate, Resume, Match, Application

# Register your models here with custom admin classes for better management.

@admin.register(JobDescription)
class JobDescriptionAdmin(admin.ModelAdmin):
    """
    Admin configuration for the JobDescription model.
    Displays key fields, enables search, and sets read-only fields.
    """
    list_display = ['job_id', 'title', 'company', 'department', 'experience_level', 'status', 'posted_date']
    list_filter = ['status', 'experience_level', 'employment_type', 'company', 'department']
    search_fields = ['title', 'company', 'department', 'description']
    readonly_fields = ['job_id', 'created_at', 'updated_at']
    ordering = ['-posted_date']

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Candidate model.
    Displays key fields and enables search.
    """
    list_display = ['candidate_id', 'first_name', 'last_name', 'email', 'current_title', 'total_experience_years', 'status']
    list_filter = ['status', 'highest_education', 'total_experience_years']
    search_fields = ['first_name', 'last_name', 'email', 'current_title', 'current_company']
    readonly_fields = ['candidate_id', 'created_at', 'updated_at']
    ordering = ['-created_at']

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Resume model.
    Displays related candidate, file info, and parsed text.
    """
    list_display = ['id', 'candidate', 'file_name', 'file_type', 'processing_status', 'uploaded_at']
    list_filter = ['processing_status', 'file_type', 'uploaded_at']
    search_fields = ['candidate__first_name', 'candidate__last_name', 'file_name']
    readonly_fields = ['uploaded_at', 'processed_at']
    ordering = ['-uploaded_at']

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Match model.
    Displays match details, score, and interview status.
    Includes custom methods for calculated fields in the list view.
    """
    # Fields to display in the list view, including custom methods
    list_display = ['id', 'job_description', 'resume', 'overall_score', 'status', 'matched_at']
    
    # Enable filtering by job description, invitation status, and match date
    list_filter = ['status', 'overall_score', 'matched_at']
    
    # Fields to enable search by (through related models using double underscore)
    search_fields = ['job_description__title', 'resume__candidate__first_name', 'resume__candidate__last_name']
    
    # Fields that are set automatically and should not be editable in admin
    readonly_fields = ['matched_at', 'updated_at']
    ordering = ['-overall_score']

    # Custom method to display the candidate's name from the related Resume object
    def resume_candidate_name(self, obj):
        return obj.resume.candidate.full_name
    resume_candidate_name.short_description = 'Candidate Name' # Sets the column header in admin

    # Custom method to visually indicate if the match score is 60% or higher
    def is_match_above_60(self, obj):
        return obj.overall_score >= 60
    is_match_above_60.boolean = True # Displays a nice checkmark or X icon in admin
    is_match_above_60.short_description = 'Match >= 60%' # Sets the column header in admin

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['application_id', 'candidate', 'job_description', 'status', 'source', 'applied_at', 'is_active']
    list_filter = ['status', 'source', 'is_shortlisted', 'is_interviewed', 'applied_at']
    search_fields = ['application_id', 'candidate__first_name', 'candidate__last_name', 'job_description__title']
    readonly_fields = ['application_id', 'applied_at', 'status_updated_at']
    ordering = ['-applied_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('application_id', 'candidate', 'job_description', 'match')
        }),
        ('Application Details', {
            'fields': ('cover_letter', 'expected_salary', 'salary_currency', 'source')
        }),
        ('Status & Process', {
            'fields': ('status', 'is_shortlisted', 'is_interviewed', 'interview_rounds')
        }),
        ('Notes', {
            'fields': ('recruiter_notes', 'hiring_manager_notes', 'candidate_notes'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('applied_at', 'status_updated_at', 'shortlisted_at', 'interviewed_at', 'offer_made_at', 'offer_accepted_at', 'rejected_at'),
            'classes': ('collapse',)
        }),
    )