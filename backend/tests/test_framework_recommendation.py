#!/usr/bin/env python3
"""
Test script for Framework Recommendation functionality
"""

import requests
import json

BASE_URL = "http://127.0.0.1:8000/api"
COMPETENCY_URL = "http://127.0.0.1:8000/api/competency"

def create_test_job_description():
    """Create a test job description for Python developer"""
    print("🔧 Creating test job description...")
    
    job_data = {
        "title": "Senior Python Developer",
        "company": "BigTech",
        "department": "Engineering",
        "location": "Remote",
        "description": "We are looking for a Senior Python Developer with expertise in Django, Flask, and web development. The ideal candidate should have strong knowledge of Python fundamentals, object-oriented programming, exception handling, and functional programming concepts.",
        "requirements": "5+ years of Python development experience, Django/Flask frameworks, REST APIs, database design, testing and debugging skills, Git version control",
        "experience_level": "senior",
        "min_experience_years": 5,
        "employment_type": "full_time",
        "status": "active"
    }
    
    response = requests.post(f"{BASE_URL}/job_descriptions/", json=job_data)
    print(f"POST /job_descriptions/: {response.status_code}")
    
    if response.status_code == 201:
        job = response.json()
        print(f"✅ Job description created: {job['title']} (ID: {job['id']})")
        return job
    else:
        print(f"❌ Failed to create job description: {response.text}")
        return None

def test_framework_recommendation(job_id):
    """Test framework recommendation for the job description"""
    print(f"\n🤖 Testing framework recommendation for job ID: {job_id}")
    
    recommendation_data = {
        "job_description_id": job_id
    }
    
    response = requests.post(
        f"{COMPETENCY_URL}/recommend-framework/",
        json=recommendation_data
    )
    print(f"POST /recommend-framework/: {response.status_code}")
    
    if response.status_code == 200:
        recommendation = response.json()
        print("✅ Framework recommendation successful!")
        print(f"   Confidence Score: {recommendation['confidence_score']}%")
        print(f"   Recommended Framework: {recommendation['recommended_framework']['name']}")
        print(f"   Technology: {recommendation['recommended_framework']['technology']}")
        print(f"   Level: {recommendation['recommended_framework']['level']}")
        print(f"   Matching Competencies: {len(recommendation['matching_competencies'])}")
        
        if recommendation['matching_competencies']:
            print("   Competencies found:")
            for comp in recommendation['matching_competencies']:
                print(f"     - {comp}")
        
        return recommendation
    else:
        print(f"❌ Framework recommendation failed: {response.text}")
        return None

def test_interview_session_creation(job_id, framework_id):
    """Test creating an interview session"""
    print(f"\n📅 Testing interview session creation...")
    
    # First, get a candidate
    candidates_response = requests.get(f"{BASE_URL}/candidates/")
    if candidates_response.status_code == 200:
        candidates = candidates_response.json()
        if candidates.get('results'):
            candidate_id = candidates['results'][0]['id']
        else:
            print("⚠️ No candidates found, creating one...")
            candidate_data = {
                "first_name": "Test",
                "last_name": "Candidate",
                "email": "test@example.com",
                "phone": "+1234567890",
                "total_experience_years": 3,
                "skills": ["Python", "Django", "REST APIs"]
            }
            candidate_response = requests.post(f"{BASE_URL}/candidates/", json=candidate_data)
            if candidate_response.status_code == 201:
                candidate_id = candidate_response.json()['id']
            else:
                print(f"❌ Failed to create candidate: {candidate_response.text}")
                return None
    else:
        print(f"❌ Failed to get candidates: {candidates_response.text}")
        return None
    
    # Get a template for the framework
    templates_response = requests.get(f"{COMPETENCY_URL}/templates/?framework={framework_id}")
    if templates_response.status_code == 200:
        templates = templates_response.json()
        if templates.get('results'):
            template_id = templates['results'][0]['id']
        else:
            print("⚠️ No templates found for this framework")
            return None
    else:
        print(f"❌ Failed to get templates: {templates_response.text}")
        return None
    
    # Create interview session
    session_data = {
        "candidate": candidate_id,
        "job_description": job_id,
        "template": template_id,
        "interviewer_name": "AI Interviewer",
        "interviewer_email": "ai@yogya.com",
        "scheduled_at": "2024-01-15T10:00:00Z",
        "duration_minutes": 60
    }
    
    response = requests.post(f"{COMPETENCY_URL}/sessions/", json=session_data)
    print(f"POST /sessions/: {response.status_code}")
    
    if response.status_code == 201:
        session = response.json()
        print(f"✅ Interview session created successfully!")
        print(f"   Candidate ID: {session.get('candidate', 'N/A')}")
        print(f"   Job Description ID: {session.get('job_description', 'N/A')}")
        print(f"   Template ID: {session.get('template', 'N/A')}")
        print(f"   Scheduled At: {session.get('scheduled_at', 'N/A')}")
        return session
    else:
        print(f"❌ Failed to create interview session: {response.text}")
        return None

def main():
    """Run all tests"""
    print("🚀 Starting Framework Recommendation Tests")
    print("=" * 50)
    
    try:
        # Create test job description
        job = create_test_job_description()
        if not job:
            print("❌ Cannot proceed without job description")
            return
        
        # Test framework recommendation
        recommendation = test_framework_recommendation(job['id'])
        if not recommendation:
            print("❌ Cannot proceed without framework recommendation")
            return
        
        # Test interview session creation
        framework_id = recommendation['recommended_framework']['id']
        session = test_interview_session_creation(job['id'], framework_id)
        
        print("\n" + "=" * 50)
        print("🎉 Framework Recommendation Tests Completed!")
        print("\n📋 Summary:")
        print(f"✅ Job Description: {job['title']}")
        print(f"✅ Framework Recommendation: {recommendation['recommended_framework']['name']}")
        print(f"✅ Confidence Score: {recommendation['confidence_score']}%")
        print(f"✅ Interview Session: {'Created' if session else 'Failed'}")
        
        print("\n🚀 Next Steps:")
        print("1. Test AI interview functionality")
        print("2. Test competency evaluations")
        print("3. Build frontend interface")
        print("4. Integrate with production LLM")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the Django server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main() 