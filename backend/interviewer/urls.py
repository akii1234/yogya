from django.urls import path
from . import views

app_name = 'interviewer'

urlpatterns = [
    # ============================================================================
    # INTERVIEW PREPARATION & AI ASSISTANCE
    # ============================================================================
    path('prepare-interview/', views.prepare_interview_with_ai, name='prepare_interview_with_ai'),
    path('analyze-response/', views.analyze_candidate_response, name='analyze_candidate_response'),
    path('generate-followup/', views.generate_followup_questions, name='generate_followup_questions'),
    
    # ============================================================================
    # INTERVIEW SESSION MANAGEMENT
    # ============================================================================
    path('create-session/', views.create_interview_session, name='create_interview_session'),
    path('end-session/', views.end_interview_session, name='end_interview_session'),
    path('session/<str:session_id>/', views.get_interview_session, name='get_interview_session'),
    path('session/<str:session_id>/phase/', views.update_session_phase, name='update_session_phase'),
    
    # ============================================================================
    # INTERVIEWER MANAGEMENT
    # ============================================================================
    path('interviewer/<str:interviewer_id>/profile/', views.get_interviewer_profile, name='get_interviewer_profile'),
    path('interviewer/<str:interviewer_id>/preferences/', views.update_interviewer_ai_preferences, name='update_interviewer_ai_preferences'),
    path('interviewer/<str:interviewer_id>/schedule/', views.get_interviewer_schedule, name='get_interviewer_schedule'),
    
    # ============================================================================
    # INTERVIEW MANAGEMENT
    # ============================================================================
    path('interview/<str:interview_id>/', views.get_interview_details, name='get_interview_details'),
    path('interview/<str:interview_id>/evaluation/', views.update_interview_evaluation, name='update_interview_evaluation'),
    path('interview/<str:interview_id>/override/', views.override_ai_recommendation, name='override_ai_recommendation'),
    
    # ============================================================================
    # AI ASSISTANT MANAGEMENT
    # ============================================================================
    path('ai-assistants/', views.get_ai_assistants, name='get_ai_assistants'),
    path('ai-assistants/create/', views.create_ai_assistant, name='create_ai_assistant'),
    
    # ============================================================================
    # ANALYTICS & REPORTING
    # ============================================================================
    path('interviewer/<str:interviewer_id>/analytics/', views.get_interviewer_analytics, name='get_interviewer_analytics'),
    path('analytics/', views.get_interview_analytics, name='get_interview_analytics'),
] 