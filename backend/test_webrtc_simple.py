#!/usr/bin/env python3
"""
Simple WebRTC Test Script
"""

import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from interview_management.webrtc_service import webrtc_service
from interview_management.models import InterviewSession, InterviewRoom, RoomParticipant
from user_management.models import User
from resume_checker.models import Candidate, JobDescription

def test_webrtc_service():
    """Test WebRTC service directly"""
    print("🧪 Testing WebRTC Service Directly")
    print("=" * 50)
    
    try:
        # Get test data
        interviewer = User.objects.get(email='interviewer@yogya.com')
        candidate = Candidate.objects.first()
        job = JobDescription.objects.first()
        interview = InterviewSession.objects.first()
        
        print(f"✅ Found test data:")
        print(f"  - Interviewer: {interviewer.email}")
        print(f"  - Candidate: {candidate.full_name}")
        print(f"  - Job: {job.title}")
        print(f"  - Interview: {interview.session_id}")
        
        # Test creating a room
        print(f"\n🏠 Testing room creation...")
        room_config = {
            'recording_enabled': True,
            'screen_sharing_enabled': True,
            'chat_enabled': True
        }
        
        room = webrtc_service.create_room(str(interview.id), room_config)
        print(f"✅ Room created: {room.room_id}")
        
        # Test joining room
        print(f"\n👤 Testing room joining...")
        participant = webrtc_service.join_room(
            room_id=room.room_id,
            user_id=interviewer.id,
            participant_type='interviewer'
        )
        print(f"✅ Interviewer joined: {participant.user.email}")
        
        # Test candidate joining
        candidate_user = User.objects.get(email='akhiltripathi.t1@gmail.com')
        candidate_participant = webrtc_service.join_room(
            room_id=room.room_id,
            user_id=candidate_user.id,
            participant_type='candidate'
        )
        print(f"✅ Candidate joined: {candidate_participant.user.email}")
        
        # Test getting participants
        print(f"\n👥 Testing participant list...")
        participants = webrtc_service.get_room_participants(room.room_id)
        print(f"✅ Participants in room: {len(participants)}")
        for p in participants:
            print(f"  - {p.get('user_name', p.get('user_email', 'Unknown'))} ({p.get('participant_type', 'unknown')})")
        
        # Test leaving room
        print(f"\n🚪 Testing room leaving...")
        success = webrtc_service.leave_room(room.room_id, interviewer.id)
        print(f"✅ Interviewer left: {success}")
        
        success = webrtc_service.leave_room(room.room_id, candidate_user.id)
        print(f"✅ Candidate left: {success}")
        
        print(f"\n✅ All WebRTC service tests passed!")
        print(f"\n📋 Room ID for frontend testing: {room.room_id}")
        
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_webrtc_service()
