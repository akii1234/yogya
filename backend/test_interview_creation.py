#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from interview_management.models import InterviewSession
from interview_management.serializers import InterviewSessionSerializer
from resume_checker.models import Candidate, JobDescription
from user_management.models import User
from django.utils import timezone
import uuid

def test_interview_creation():
    try:
        print("Testing interview session creation...")
        
        # Get the objects
        candidate = Candidate.objects.get(id=2)
        print(f"Found candidate: {candidate.email}")
        
        job = JobDescription.objects.get(id=307)
        print(f"Found job: {job.title}")
        
        interviewer = User.objects.get(id=uuid.UUID('37bf815b-fe0c-4266-8cf7-f45a0dbd8f8a'))
        print(f"Found interviewer: {interviewer.email}")
        
        # Test date parsing
        scheduled_date = "2025-01-20 10:00:00"
        print(f"Testing date: {scheduled_date}")
        
        # Create the session
        session = InterviewSession.objects.create(
            candidate=candidate,
            job_description=job,
            interviewer=interviewer,
            scheduled_date=scheduled_date,
            interview_type='mixed',
            interview_mode='video',
            ai_enabled=True,
            ai_mode='ai_assisted',
            duration_minutes=60,
            meeting_link=None,
            notes='',
            status='scheduled'
        )
        
        print(f"✅ Successfully created interview session: {session.session_id}")
        
        # Test serializer
        print("\nTesting serializer...")
        serializer = InterviewSessionSerializer(session)
        print(f"✅ Serializer data: {serializer.data}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_interview_creation()
