from django.urls import path
from . import views
from . import webrtc_views

app_name = 'interview_management'

urlpatterns = [
    # Interview Session Management
    path('sessions/', views.get_interview_sessions, name='get_interview_sessions'),
    path('sessions/create/', views.create_interview_session, name='create_interview_session'),
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
    
    # WebRTC Interview Room URLs
    path('webrtc/create-room/', webrtc_views.create_interview_room, name='create_interview_room'),
    path('webrtc/join-room/', webrtc_views.join_interview_room, name='join_interview_room'),
    path('webrtc/leave-room/', webrtc_views.leave_interview_room, name='leave_interview_room'),
    path('webrtc/send-signal/', webrtc_views.send_webrtc_signal, name='send_webrtc_signal'),
    path('webrtc/send-message/', webrtc_views.send_chat_message, name='send_chat_message'),
    path('webrtc/participants/<str:room_id>/', webrtc_views.get_room_participants, name='get_room_participants'),
    path('webrtc/messages/<str:room_id>/', webrtc_views.get_room_messages, name='get_room_messages'),
    path('webrtc/start-recording/', webrtc_views.start_room_recording, name='start_room_recording'),
    path('webrtc/stop-recording/', webrtc_views.stop_room_recording, name='stop_room_recording'),
]
