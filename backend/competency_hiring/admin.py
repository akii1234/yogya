from django.contrib import admin
from .models import (
    CompetencyFramework, Competency, InterviewTemplate, InterviewQuestion,
    InterviewSession, CompetencyEvaluation, AIInterviewSession, InterviewAnalytics
)


@admin.register(CompetencyFramework)
class CompetencyFrameworkAdmin(admin.ModelAdmin):
    list_display = ['name', 'technology', 'level', 'is_active', 'created_at']
    list_filter = ['technology', 'level', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'technology']
    ordering = ['name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'technology', 'level')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Competency)
class CompetencyAdmin(admin.ModelAdmin):
    list_display = ['name', 'framework', 'category', 'weight', 'order', 'is_active']
    list_filter = ['framework', 'category', 'weight', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'framework__name']
    ordering = ['framework', 'order', 'name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'framework', 'category')
        }),
        ('Configuration', {
            'fields': ('weight', 'order', 'is_active')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(InterviewTemplate)
class InterviewTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'framework', 'duration_minutes', 'is_active', 'created_at']
    list_filter = ['framework', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'framework__name']
    ordering = ['name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'framework')
        }),
        ('Configuration', {
            'fields': ('duration_minutes', 'is_active')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(InterviewQuestion)
class InterviewQuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'template', 'competency', 'question_type', 'difficulty', 'order']
    list_filter = ['template', 'competency', 'question_type', 'difficulty', 'is_active']
    search_fields = ['question_text', 'expected_answer', 'template__name', 'competency__name']
    ordering = ['template', 'order']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Question Details', {
            'fields': ('question_text', 'template', 'competency')
        }),
        ('Configuration', {
            'fields': ('question_type', 'difficulty', 'order', 'is_active')
        }),
        ('Expected Answer', {
            'fields': ('expected_answer',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(InterviewSession)
class InterviewSessionAdmin(admin.ModelAdmin):
    list_display = ['candidate', 'job_description', 'template', 'status', 'scheduled_at', 'overall_score']
    list_filter = ['status', 'template', 'scheduled_at', 'created_at']
    search_fields = ['candidate__name', 'job_description__title', 'interviewer_name']
    ordering = ['-scheduled_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Session Information', {
            'fields': ('candidate', 'job_description', 'template')
        }),
        ('Interviewer Details', {
            'fields': ('interviewer_name', 'interviewer_email')
        }),
        ('Schedule', {
            'fields': ('scheduled_at', 'duration_minutes')
        }),
        ('Status & Results', {
            'fields': ('status', 'overall_score', 'notes')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CompetencyEvaluation)
class CompetencyEvaluationAdmin(admin.ModelAdmin):
    list_display = ['session', 'competency', 'score', 'level', 'created_at']
    list_filter = ['level', 'competency__framework', 'created_at']
    search_fields = ['session__candidate__name', 'competency__name', 'feedback']
    ordering = ['session', 'competency__order']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Evaluation Details', {
            'fields': ('session', 'competency', 'score', 'level')
        }),
        ('Feedback', {
            'fields': ('feedback', 'strengths', 'areas_for_improvement')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AIInterviewSession)
class AIInterviewSessionAdmin(admin.ModelAdmin):
    list_display = ['session', 'llm_model', 'is_active', 'started_at', 'completed_at']
    list_filter = ['llm_model', 'is_active', 'started_at']
    search_fields = ['session__candidate__name', 'llm_model']
    ordering = ['-started_at']
    readonly_fields = ['id', 'started_at', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Session Information', {
            'fields': ('session', 'llm_model', 'is_active')
        }),
        ('Progress', {
            'fields': ('current_question_index', 'completed_at')
        }),
        ('Conversation History', {
            'fields': ('conversation_history',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'started_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(InterviewAnalytics)
class InterviewAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['session', 'total_questions_asked', 'total_time_spent', 'confidence_score', 'created_at']
    list_filter = ['created_at']
    search_fields = ['session__candidate__name', 'recommendations']
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Session Information', {
            'fields': ('session',)
        }),
        ('Metrics', {
            'fields': ('total_questions_asked', 'total_time_spent')
        }),
        ('Scores', {
            'fields': ('confidence_score', 'communication_score', 'problem_solving_score', 'technical_depth_score')
        }),
        ('Recommendations', {
            'fields': ('recommendations',)
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
