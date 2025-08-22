#!/usr/bin/env python3
"""
Quick script to create a test interview room for video call testing
"""
import os
import django
import uuid

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from interview_management.models import InterviewSession, InterviewRoom
from user_management.models import User
from resume_checker.models import Candidate, JobDescription

def create_test_room():
    try:
        # Get the interviewer user
        interviewer = User.objects.get(email='interviewer@yogya.com')
        print(f"✅ Found interviewer: {interviewer.email}")
        
        # Create a test interview session
        from datetime import datetime, timedelta
        from django.utils import timezone
        
        # Get a candidate and job description
        candidate = Candidate.objects.first()
        if not candidate:
            print("❌ No candidate found")
            return None
            
        job_description = JobDescription.objects.first()
        if not job_description:
            print("❌ No job description found")
            return None
        
        interview_session = InterviewSession.objects.create(
            interviewer=interviewer,
            candidate=candidate,
            job_description=job_description,
            duration_minutes=30,
            status='scheduled',
            scheduled_date=timezone.now() + timedelta(hours=1)  # Schedule for 1 hour from now
        )
        print(f"✅ Created interview session: {interview_session.id}")
        
        # Create the room
        room_id = f"test_room_{uuid.uuid4().hex[:8]}"
        room = InterviewRoom.objects.create(
            room_id=room_id,
            interview=interview_session,
            is_active=True
        )
        print(f"✅ Created room: {room.room_id}")
        
        # Verify the room exists
        room_check = InterviewRoom.objects.filter(room_id=room.room_id, is_active=True).first()
        if room_check:
            print(f"✅ Room verified: {room_check.room_id}")
            print(f"✅ Interview ID: {room_check.interview.id}")
            print(f"\n🎯 Use this room ID for testing: {room.room_id}")
            return room.room_id
        else:
            print("❌ Room verification failed")
            return None
            
    except User.DoesNotExist:
        print("❌ Interviewer user not found")
        return None
    except Exception as e:
        print(f"❌ Error creating test room: {e}")
        return None

if __name__ == "__main__":
    print("🚀 Creating test interview room...")
    room_id = create_test_room()
    if room_id:
        print(f"\n🎉 Test room ready! Room ID: {room_id}")
        print("Use this room ID in both interviewer and candidate portals")
    else:
        print("❌ Failed to create test room")
