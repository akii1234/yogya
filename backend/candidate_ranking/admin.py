from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import CandidateRanking, RankingBatch, RankingCriteria


@admin.register(CandidateRanking)
class CandidateRankingAdmin(admin.ModelAdmin):
    list_display = [
        'ranking_id', 'candidate_name', 'job_title', 'rank_position', 
        'overall_score', 'is_shortlisted', 'is_rejected', 'status'
    ]
    list_filter = [
        'status', 'is_shortlisted', 'is_rejected',
        'created_at', 'last_ranked_at'
    ]
    search_fields = [
        'ranking_id', 'candidate__first_name', 'candidate__last_name', 
        'candidate__email', 'job_description__title', 'job_description__company'
    ]
    readonly_fields = [
        'ranking_id', 'overall_score', 'skill_match_score', 'experience_match_score',
        'education_match_score', 'location_match_score', 'rank_position', 
        'total_candidates', 'matched_skills', 'missing_skills', 'skill_gap_percentage',
        'experience_years', 'required_experience_years', 'experience_gap',
        'experience_status', 'created_at', 'updated_at', 'last_ranked_at'
    ]
    fieldsets = (
        ('Basic Information', {
            'fields': ('ranking_id', 'job_description', 'candidate', 'application')
        }),
        ('Ranking Details', {
            'fields': ('rank_position', 'total_candidates', 'status')
        }),
        ('Scores', {
            'fields': (
                'overall_score', 'skill_match_score', 'experience_match_score',
                'education_match_score', 'location_match_score'
            )
        }),
        ('Skill Analysis', {
            'fields': ('matched_skills', 'missing_skills', 'skill_gap_percentage')
        }),
        ('Experience Analysis', {
            'fields': (
                'experience_years', 'required_experience_years', 'experience_gap',
                'experience_status'
            )
        }),
        ('HR Actions', {
            'fields': ('is_shortlisted', 'is_rejected', 'hr_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_ranked_at'),
            'classes': ('collapse',)
        })
    )
    
    def candidate_name(self, obj):
        return obj.candidate.full_name
    candidate_name.short_description = 'Candidate'
    
    def job_title(self, obj):
        return obj.job_description.title
    job_title.short_description = 'Job Title'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'candidate', 'job_description', 'application'
        )


@admin.register(RankingBatch)
class RankingBatchAdmin(admin.ModelAdmin):
    list_display = [
        'batch_id', 'job_title', 'status', 'total_candidates', 
        'ranked_candidates', 'success_rate', 'processing_time', 'created_by'
    ]
    list_filter = ['status', 'started_at', 'completed_at']
    search_fields = [
        'batch_id', 'job_description__title', 'job_description__company',
        'created_by__email'
    ]
    readonly_fields = [
        'batch_id', 'total_candidates', 'ranked_candidates', 'failed_rankings',
        'success_rate', 'processing_time_seconds', 'started_at', 'completed_at',
        'error_message'
    ]
    fieldsets = (
        ('Batch Information', {
            'fields': ('batch_id', 'job_description', 'created_by')
        }),
        ('Processing Details', {
            'fields': (
                'status', 'total_candidates', 'ranked_candidates', 'failed_rankings',
                'success_rate', 'processing_time_seconds'
            )
        }),
        ('Timestamps', {
            'fields': ('started_at', 'completed_at')
        }),
        ('Error Information', {
            'fields': ('error_message',),
            'classes': ('collapse',)
        })
    )
    
    def job_title(self, obj):
        return obj.job_description.title
    job_title.short_description = 'Job Title'
    
    def processing_time(self, obj):
        if obj.processing_time_seconds:
            return f"{obj.processing_time_seconds}s"
        return "N/A"
    processing_time.short_description = 'Processing Time'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'job_description', 'created_by'
        )


@admin.register(RankingCriteria)
class RankingCriteriaAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'is_default', 'is_active', 'skill_weight', 'experience_weight',
        'education_weight', 'location_weight', 'total_weight'
    ]
    list_filter = ['is_default', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['total_weight', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'is_default', 'is_active')
        }),
        ('Scoring Weights', {
            'fields': (
                'skill_weight', 'experience_weight', 'education_weight', 'location_weight'
            ),
            'description': 'All weights must sum to 100%'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        # Ensure only one default criteria exists
        if obj.is_default:
            RankingCriteria.objects.filter(is_default=True).update(is_default=False)
        super().save_model(request, obj, form, change)
