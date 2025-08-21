#!/usr/bin/env python3
"""
Create a new interview room for testing
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from interview_management.webrtc_service import webrtc_service
from interview_management.models import InterviewSession

def create_test_room():
    """Create a new test room"""
    try:
        # Get the first interview session
        interview = InterviewSession.objects.first()
        
        if not interview:
            print("❌ No interview sessions found. Please create one first.")
            return
        
        # Create room
        room_config = {
            'recording_enabled': True,
            'screen_sharing_enabled': True,
            'chat_enabled': True
        }
        
        room = webrtc_service.create_room(str(interview.id), room_config)
        
        print("✅ New test room created!")
        print(f"📋 Room ID: {room.room_id}")
        print(f"📋 Interview: {interview.session_id}")
        print(f"📋 Job: {interview.job_description.title}")
        print(f"📋 Candidate: {interview.candidate.full_name}")
        
        print(f"\n🎥 To test video call:")
        print(f"1. Go to http://localhost:5173")
        print(f"2. Login as interviewer: interviewer@yogya.com")
        print(f"3. Go to 'AI Assistant'")
        print(f"4. Enter room ID: {room.room_id}")
        print(f"5. Click 'Start Video Call'")
        
    except Exception as e:
        print(f"❌ Error creating room: {e}")

if __name__ == "__main__":
    create_test_room()
