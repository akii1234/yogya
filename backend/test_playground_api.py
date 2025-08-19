#!/usr/bin/env python3
"""
Test script to debug Playground API calls
"""

import os
import sys
import django
import requests
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from resume_checker.models import Candidate, JobDescription, Application

def test_playground_api():
    """Test the Playground API endpoint"""
    
    print("🔍 Testing Playground API")
    print("=" * 50)
    
    # 1. Check if candidate exists
    try:
        candidate = Candidate.objects.get(email='akhiltripathi.t1@gmail.com')
        print(f"✅ Found candidate: {candidate.full_name}")
        print(f"   Email: {candidate.email}")
        print(f"   Skills: {candidate.skills}")
        print(f"   Skills Count: {len(candidate.skills) if candidate.skills else 0}")
    except Candidate.DoesNotExist:
        print("❌ Candidate not found!")
        return
    except Exception as e:
        print(f"❌ Error finding candidate: {e}")
        return
    
    # 2. Check if candidate has applied to any jobs
    applications = Application.objects.filter(candidate=candidate)
    print(f"\n📋 Applications found: {applications.count()}")
    
    if applications.exists():
        for app in applications:
            print(f"   - {app.job_description.title} at {app.job_description.company}")
            print(f"     Job ID: {app.job_description.id}")
            print(f"     Applied: {app.applied_at}")
            print(f"     Status: {app.status}")
    else:
        print("   ⚠️ No applications found!")
        print("   This is why Playground shows 'No Questions Available'")
        print("   The Playground requires applied jobs to generate questions")
        return
    
    # 3. Test the enhanced coding questions endpoint directly
    print(f"\n🧪 Testing Enhanced Coding Questions API...")
    
    # Get the first applied job
    first_job = applications.first().job_description
    
    # Test the API endpoint
    try:
        # Simulate the API call
        from resume_checker.views import JobDescriptionViewSet
        from rest_framework.test import APIRequestFactory
        from django.contrib.auth.models import User
        
        # Create a mock request
        factory = APIRequestFactory()
        
        # Find the user
        try:
            user = User.objects.get(email='akhiltripathi.t1@gmail.com')
        except User.DoesNotExist:
            print("❌ User not found in auth system")
            return
        
        # Create request data
        request_data = {'job_id': first_job.id}
        
        # Create the request
        request = factory.post('/candidate-portal/enhanced-coding-questions/', 
                             data=json.dumps(request_data), 
                             content_type='application/json')
        request.user = user
        
        # Call the view
        viewset = JobDescriptionViewSet()
        response = viewset.enhanced_coding_questions(request)
        
        print(f"✅ API Response Status: {response.status_code}")
        print(f"✅ Response Data: {response.data}")
        
        # Check if questions are in the response
        if 'enhanced_questions' in response.data:
            questions = response.data['enhanced_questions']
            if 'questions' in questions:
                question_count = len(questions['questions'])
                print(f"✅ Questions found: {question_count}")
                for i, q in enumerate(questions['questions'][:3], 1):
                    print(f"   {i}. {q.get('title', 'No title')} ({q.get('difficulty', 'unknown')})")
            else:
                print("❌ No 'questions' field in response")
        else:
            print("❌ No 'enhanced_questions' field in response")
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 50)
    print("🎯 Summary:")
    print("1. Check if candidate has applied to jobs")
    print("2. Check if the API endpoint returns questions")
    print("3. Check if frontend is calling the right endpoint")

if __name__ == "__main__":
    test_playground_api()
