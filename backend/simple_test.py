#!/usr/bin/env python
"""
Simple test to check imports
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

try:
    print("Testing imports...")
    
    # Test model imports
    from interview_management.models import (
        InterviewSession, 
        CompetencyEvaluation, 
        InterviewFeedback, 
        InterviewQuestion, 
        InterviewAnalytics,
        InterviewRoom,
        RoomParticipant,
        ChatMessage,
        InterviewRecording
    )
    print("✅ All models imported successfully")
    
    # Test serializer imports
    from interview_management.serializers import (
        InterviewSessionSerializer,
        CompetencyEvaluationSerializer,
        InterviewFeedbackSerializer,
        InterviewQuestionSerializer,
        InterviewAnalyticsSerializer
    )
    print("✅ All serializers imported successfully")
    
    # Test views imports
    from interview_management.views import get_interview_sessions
    print("✅ Views imported successfully")
    
    # Test WebRTC imports
    from interview_management.webrtc_service import webrtc_service
    print("✅ WebRTC service imported successfully")
    
    print("🎉 All imports working!")
    
except Exception as e:
    print(f"❌ Import error: {e}")
    import traceback
    traceback.print_exc() 