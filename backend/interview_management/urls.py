from django.urls import path
from . import views

app_name = 'interview_management'

urlpatterns = [
    # Interview Session Management
    path('sessions/', views.get_interview_sessions, name='get_interview_sessions'),
    path('sessions/<str:session_id>/', views.get_interview_session_detail, name='get_interview_session_detail'),
    path('sessions/start/', views.start_interview, name='start_interview'),
    path('sessions/end/', views.end_interview, name='end_interview'),
    
    # Competency Scoring API
    path('sessions/<str:session_id>/competency-scores/', views.get_competency_evaluations, name='get_competency_evaluations'),
    path('sessions/<str:session_id>/competency-scores/submit/', views.submit_competency_score, name='submit_competency_score'),
    
    # Interview Feedback API
    path('sessions/<str:session_id>/feedback/', views.get_interview_feedback, name='get_interview_feedback'),
    path('sessions/<str:session_id>/feedback/submit/', views.submit_interview_feedback, name='submit_interview_feedback'),
    
    # Interview Questions API
    path('sessions/<str:session_id>/questions/ask/', views.ask_question, name='ask_question'),
    path('questions/<uuid:question_id>/response/', views.submit_response, name='submit_response'),
    
    # Competency Questions Screen API
    path('sessions/<str:session_id>/competency-questions/', views.get_competency_questions_screen, name='get_competency_questions_screen'),
    path('sessions/<str:session_id>/mark-answered/', views.mark_question_answered, name='mark_question_answered'),
    path('sessions/<str:session_id>/score-competency/', views.score_competency_live, name='score_competency_live'),
    path('sessions/<str:session_id>/add-followup/', views.add_follow_up_question, name='add_follow_up_question'),
    path('sessions/<str:session_id>/progress/', views.get_interview_progress, name='get_interview_progress'),
    
    # Analytics API
    path('analytics/', views.get_interview_analytics, name='get_interview_analytics'),
]
