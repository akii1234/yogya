from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    InterviewSession, 
    CompetencyEvaluation, 
    InterviewFeedback, 
    InterviewQuestion, 
    InterviewAnalytics
)


@admin.register(InterviewSession)
class InterviewSessionAdmin(admin.ModelAdmin):
    list_display = [
        'session_id', 'candidate_name', 'interviewer_name', 'job_title', 
        'interview_type', 'status', 'scheduled_date', 'duration_actual', 'overall_score'
    ]
    list_filter = [
        'status', 'interview_type', 'interview_mode', 'ai_enabled', 'ai_mode', 
        'scheduled_date', 'created_at'
    ]
    search_fields = [
        'session_id', 'candidate__name', 'candidate__email', 
        'interviewer__first_name', 'interviewer__last_name', 'interviewer__email',
        'job_description__title', 'job_description__company'
    ]
    readonly_fields = [
        'session_id', 'created_at', 'updated_at', 'duration_actual', 
        'is_completed', 'overall_score'
    ]
    fieldsets = (
        ('Session Information', {
            'fields': ('session_id', 'status', 'created_at', 'updated_at')
        }),
        ('Participants', {
            'fields': ('candidate', 'interviewer', 'job_description')
        }),
        ('Interview Configuration', {
            'fields': ('interview_type', 'interview_mode', 'ai_enabled', 'ai_mode')
        }),
        ('Schedule', {
            'fields': ('scheduled_date', 'actual_start_time', 'actual_end_time', 'duration_minutes', 'duration_actual')
        }),
        ('Meeting Details', {
            'fields': ('meeting_link', 'meeting_instructions')
        }),
        ('Session Data', {
            'fields': ('notes', 'recording_url', 'transcription', 'is_completed', 'overall_score')
        }),
    )
    
    def candidate_name(self, obj):
        return obj.candidate.name if obj.candidate else '-'
    candidate_name.short_description = 'Candidate'
    
    def interviewer_name(self, obj):
        return f"{obj.interviewer.first_name} {obj.interviewer.last_name}" if obj.interviewer else '-'
    interviewer_name.short_description = 'Interviewer'
    
    def job_title(self, obj):
        return obj.job_description.title if obj.job_description else '-'
    job_title.short_description = 'Job'
    
    def duration_actual(self, obj):
        duration = obj.duration_actual
        if duration:
            return f"{duration} min"
        return '-'
    duration_actual.short_description = 'Actual Duration'
    
    def overall_score(self, obj):
        score = obj.overall_score
        if score:
            return f"{score}%"
        return '-'
    overall_score.short_description = 'Overall Score'


@admin.register(CompetencyEvaluation)
class CompetencyEvaluationAdmin(admin.ModelAdmin):
    list_display = [
        'competency_title', 'session_id', 'candidate_name', 'score', 
        'performance_level', 'evaluation_method', 'weightage', 'weighted_score'
    ]
    list_filter = [
        'performance_level', 'evaluation_method', 'competency_title', 
        'created_at', 'updated_at'
    ]
    search_fields = [
        'competency_title', 'session__session_id', 'session__candidate__name',
        'session__candidate__email'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'weighted_score'
    ]
    fieldsets = (
        ('Evaluation Information', {
            'fields': ('session', 'competency_title', 'competency_description', 'evaluation_method')
        }),
        ('Scoring', {
            'fields': ('score', 'weightage', 'performance_level', 'weighted_score')
        }),
        ('STAR/CAR Observations', {
            'fields': ('star_observations', 'car_observations'),
            'classes': ('collapse',)
        }),
        ('Feedback', {
            'fields': ('strengths', 'areas_for_improvement', 'detailed_feedback')
        }),
        ('Criteria Assessment', {
            'fields': ('criteria_scores', 'criteria_feedback'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def session_id(self, obj):
        return obj.session.session_id if obj.session else '-'
    session_id.short_description = 'Session ID'
    
    def candidate_name(self, obj):
        return obj.session.candidate.name if obj.session and obj.session.candidate else '-'
    candidate_name.short_description = 'Candidate'
    
    def weighted_score(self, obj):
        return f"{obj.weighted_score:.2f}"
    weighted_score.short_description = 'Weighted Score'


@admin.register(InterviewFeedback)
class InterviewFeedbackAdmin(admin.ModelAdmin):
    list_display = [
        'session_id', 'candidate_name', 'job_title', 'overall_score', 
        'overall_recommendation', 'is_positive', 'needs_follow_up', 'created_at'
    ]
    list_filter = [
        'overall_recommendation', 'follow_up_required', 'created_at', 'updated_at'
    ]
    search_fields = [
        'session__session_id', 'session__candidate__name', 'session__candidate__email',
        'session__job_description__title', 'session__job_description__company'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'is_positive', 'needs_follow_up'
    ]
    fieldsets = (
        ('Session Information', {
            'fields': ('session', 'created_at', 'updated_at')
        }),
        ('Overall Assessment', {
            'fields': ('overall_score', 'overall_recommendation', 'is_positive', 'needs_follow_up')
        }),
        ('Detailed Feedback', {
            'fields': ('interviewer_notes', 'ai_insights', 'strengths_summary', 'improvement_areas')
        }),
        ('STAR/CAR Summary', {
            'fields': ('star_summary', 'car_summary'),
            'classes': ('collapse',)
        }),
        ('Competency Breakdown', {
            'fields': ('competency_scores', 'competency_feedback'),
            'classes': ('collapse',)
        }),
        ('Cultural & Technical Assessment', {
            'fields': ('cultural_fit_score', 'values_alignment', 'technical_score', 'technical_feedback'),
            'classes': ('collapse',)
        }),
        ('Next Steps', {
            'fields': ('next_steps', 'follow_up_required', 'follow_up_notes')
        }),
    )
    
    def session_id(self, obj):
        return obj.session.session_id if obj.session else '-'
    session_id.short_description = 'Session ID'
    
    def candidate_name(self, obj):
        return obj.session.candidate.name if obj.session and obj.session.candidate else '-'
    candidate_name.short_description = 'Candidate'
    
    def job_title(self, obj):
        return obj.session.job_description.title if obj.session and obj.session.job_description else '-'
    job_title.short_description = 'Job'
    
    def is_positive(self, obj):
        return obj.is_positive
    is_positive.boolean = True
    is_positive.short_description = 'Positive'
    
    def needs_follow_up(self, obj):
        return obj.needs_follow_up
    needs_follow_up.boolean = True
    needs_follow_up.short_description = 'Follow-up Required'


@admin.register(InterviewQuestion)
class InterviewQuestionAdmin(admin.ModelAdmin):
    list_display = [
        'question_preview', 'session_id', 'candidate_name', 'question_type', 
        'competency_title', 'has_response', 'question_score', 'asked_at'
    ]
    list_filter = [
        'question_type', 'competency_title', 'asked_at', 'answered_at'
    ]
    search_fields = [
        'question_text', 'session__session_id', 'session__candidate__name',
        'candidate_response'
    ]
    readonly_fields = [
        'asked_at', 'answered_at'
    ]
    fieldsets = (
        ('Question Information', {
            'fields': ('session', 'question_text', 'question_type', 'competency_title')
        }),
        ('Question Structure', {
            'fields': ('star_structure', 'car_structure'),
            'classes': ('collapse',)
        }),
        ('Candidate Response', {
            'fields': ('candidate_response', 'response_duration_seconds', 'answered_at')
        }),
        ('AI Assistance', {
            'fields': ('ai_suggestions', 'ai_follow_up_questions'),
            'classes': ('collapse',)
        }),
        ('Evaluation', {
            'fields': ('question_score', 'question_feedback')
        }),
        ('Timing', {
            'fields': ('asked_at',),
            'classes': ('collapse',)
        }),
    )
    
    def question_preview(self, obj):
        return obj.question_text[:50] + '...' if len(obj.question_text) > 50 else obj.question_text
    question_preview.short_description = 'Question'
    
    def session_id(self, obj):
        return obj.session.session_id if obj.session else '-'
    session_id.short_description = 'Session ID'
    
    def candidate_name(self, obj):
        return obj.session.candidate.name if obj.session and obj.session.candidate else '-'
    candidate_name.short_description = 'Candidate'
    
    def has_response(self, obj):
        return bool(obj.candidate_response)
    has_response.boolean = True
    has_response.short_description = 'Has Response'


@admin.register(InterviewAnalytics)
class InterviewAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'session_id', 'candidate_name', 'total_questions_asked', 
        'average_response_time', 'completion_rate', 'strongest_competency', 
        'weakest_competency', 'ai_suggestions_used'
    ]
    list_filter = [
        'created_at', 'updated_at'
    ]
    search_fields = [
        'session__session_id', 'session__candidate__name', 'session__candidate__email',
        'strongest_competency', 'weakest_competency'
    ]
    readonly_fields = [
        'created_at', 'updated_at'
    ]
    fieldsets = (
        ('Session Information', {
            'fields': ('session', 'created_at', 'updated_at')
        }),
        ('Performance Metrics', {
            'fields': ('total_questions_asked', 'average_response_time', 'completion_rate')
        }),
        ('Competency Analysis', {
            'fields': ('strongest_competency', 'weakest_competency', 'competency_gaps')
        }),
        ('AI Usage Analytics', {
            'fields': ('ai_suggestions_used', 'ai_follow_ups_generated', 'ai_effectiveness_score')
        }),
        ('Quality Metrics', {
            'fields': ('interview_quality_score', 'bias_detection_score')
        }),
        ('Detailed Analytics', {
            'fields': ('time_spent_per_competency', 'question_effectiveness', 'candidate_engagement_metrics'),
            'classes': ('collapse',)
        }),
    )
    
    def session_id(self, obj):
        return obj.session.session_id if obj.session else '-'
    session_id.short_description = 'Session ID'
    
    def candidate_name(self, obj):
        return obj.session.candidate.name if obj.session and obj.session.candidate else '-'
    candidate_name.short_description = 'Candidate'
    
    def average_response_time(self, obj):
        if obj.average_response_time:
            return f"{obj.average_response_time} sec"
        return '-'
    average_response_time.short_description = 'Avg Response Time'
    
    def completion_rate(self, obj):
        if obj.completion_rate:
            return f"{obj.completion_rate}%"
        return '-'
    completion_rate.short_description = 'Completion Rate'


# Custom admin site configuration
admin.site.site_header = "Yogya Interview Management"
admin.site.site_title = "Yogya Admin"
admin.site.index_title = "Interview Management Administration"
