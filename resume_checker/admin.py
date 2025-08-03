# hiring_app/admin.py
from django.contrib import admin
from .models import JobDescription, Candidate, Resume, Match

# Register your models here with custom admin classes for better management.

@admin.register(JobDescription)
class JobDescriptionAdmin(admin.ModelAdmin):
    """
    Admin configuration for the JobDescription model.
    Displays key fields, enables search, and sets read-only fields.
    """
    list_display = ('title', 'uploaded_at') # Fields to display in the list view
    search_fields = ('title', 'description') # Fields to enable search by
    readonly_fields = ('processed_text', 'uploaded_at') # Fields that cannot be edited directly in admin

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Candidate model.
    Displays key fields and enables search.
    """
    list_display = ('name', 'email', 'phone') # Fields to display
    search_fields = ('name', 'email', 'phone') # Fields to search by

@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Resume model.
    Displays related candidate, file info, and parsed text.
    """
    list_display = ('candidate', 'file', 'uploaded_at') # Fields to display
    search_fields = ('candidate__name', 'parsed_text') # Search by candidate name or parsed text
    list_filter = ('uploaded_at',) # Enable filtering by upload date
    readonly_fields = ('parsed_text', 'uploaded_at') # Parsed text and upload date are read-only

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Match model.
    Displays match details, score, and interview status.
    Includes custom methods for calculated fields in the list view.
    """
    # Fields to display in the list view, including custom methods
    list_display = ('job_description', 'resume_candidate_name', 'score',
                    'is_match_above_60', 'is_invited_for_interview', 'matched_at')
    
    # Enable filtering by job description, invitation status, and match date
    list_filter = ('job_description', 'is_invited_for_interview', 'matched_at')
    
    # Fields to enable search by (through related models using double underscore)
    search_fields = ('job_description__title', 'resume__candidate__name', 'score')
    
    # Fields that are set automatically and should not be editable in admin
    readonly_fields = ('matched_at',)

    # Custom method to display the candidate's name from the related Resume object
    def resume_candidate_name(self, obj):
        return obj.resume.candidate.name
    resume_candidate_name.short_description = 'Candidate Name' # Sets the column header in admin

    # Custom method to visually indicate if the match score is 60% or higher
    def is_match_above_60(self, obj):
        return obj.score >= 0.60
    is_match_above_60.boolean = True # Displays a nice checkmark or X icon in admin
    is_match_above_60.short_description = 'Match >= 60%' # Sets the column header in admin