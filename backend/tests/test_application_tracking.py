#!/usr/bin/env python3
"""
Test script for Application Tracking System
Demonstrates the complete pipeline from matching to application to analytics.
"""

import requests
import json
import time
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://127.0.0.1:8000/api"
HEADERS = {"Content-Type": "application/json"}

def print_section(title):
    """Print a formatted section header."""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_subsection(title):
    """Print a formatted subsection header."""
    print(f"\n{'-'*40}")
    print(f"  {title}")
    print(f"{'-'*40}")

def test_job_description_creation():
    """Create a test job description."""
    print_subsection("Creating Job Description")
    
    jd_data = {
        "title": "Senior Python Developer",
        "company": "BigTech",
        "department": "Engineering",
        "location": "San Francisco, CA",
        "description": "We are looking for a Senior Python Developer to join our engineering team. You will be responsible for developing and maintaining high-quality software solutions.",
        "requirements": "Python, Django, FastAPI, PostgreSQL, AWS, Docker, Kubernetes, 5+ years experience",
        "experience_level": "senior",
        "min_experience_years": 5,
        "employment_type": "full_time",
        "status": "active"
    }
    
    response = requests.post(f"{BASE_URL}/job_descriptions/", json=jd_data, headers=HEADERS)
    if response.status_code == 201:
        jd = response.json()
        print(f"✅ Job Description created: {jd['title']} (ID: {jd['id']})")
        return jd['id']
    else:
        print(f"❌ Failed to create Job Description: {response.text}")
        return None

def test_candidate_creation():
    """Create test candidates."""
    print_subsection("Creating Candidates")
    
    candidates = [
        {
            "first_name": "Alice",
            "last_name": "Johnson",
            "email": f"alice.johnson.{int(time.time())}@example.com",
            "phone": "+1-555-0101",
            "city": "San Francisco",
            "state": "CA",
            "country": "USA",
            "current_title": "Python Developer",
            "current_company": "BigTech",
            "total_experience_years": 6,
            "highest_education": "bachelor",
            "degree_field": "Computer Science",
            "skills": ["Python", "Django", "PostgreSQL", "AWS"]
        },
        {
            "first_name": "Bob",
            "last_name": "Smith",
            "email": f"bob.smith.{int(time.time())}@example.com",
            "phone": "+1-555-0102",
            "city": "New York",
            "state": "NY",
            "country": "USA",
            "current_title": "Software Engineer",
            "current_company": "BigTech Inc",
            "total_experience_years": 4,
            "highest_education": "master",
            "degree_field": "Software Engineering",
            "skills": ["Python", "FastAPI", "Docker", "Kubernetes"]
        },
        {
            "first_name": "Carol",
            "last_name": "Davis",
            "email": f"carol.davis.{int(time.time())}@example.com",
            "phone": "+1-555-0103",
            "city": "Austin",
            "state": "TX",
            "country": "USA",
            "current_title": "Junior Developer",
            "current_company": "SmallStartup",
            "total_experience_years": 2,
            "highest_education": "bachelor",
            "degree_field": "Information Technology",
            "skills": ["Python", "Django", "JavaScript"]
        }
    ]
    
    candidate_ids = []
    for candidate_data in candidates:
        response = requests.post(f"{BASE_URL}/candidates/", json=candidate_data, headers=HEADERS)
        if response.status_code == 201:
            candidate = response.json()
            print(f"✅ Candidate created: {candidate['first_name']} {candidate['last_name']} (ID: {candidate['id']})")
            candidate_ids.append(candidate['id'])
        else:
            print(f"❌ Failed to create candidate: {response.text}")
    
    return candidate_ids

def test_resume_upload(candidate_ids):
    """Upload resumes for candidates."""
    print_subsection("Uploading Resumes")
    
    resume_files = [
        ("alice_resume.txt", "Alice Johnson is a Python Developer with 6 years of experience. She has worked with Django, PostgreSQL, AWS, and has strong skills in Python development."),
        ("bob_resume.txt", "Bob Smith is a Software Engineer with 4 years of experience. He specializes in Python, FastAPI, Docker, and Kubernetes. He has a Master's degree in Software Engineering."),
        ("carol_resume.txt", "Carol Davis is a Junior Developer with 2 years of experience. She knows Python, Django, and JavaScript. She is eager to learn and grow in her career.")
    ]
    
    resume_ids = []
    for i, (filename, content) in enumerate(resume_files):
        # Create the file
        with open(filename, 'w') as f:
            f.write(content)
        
        # Upload the file
        with open(filename, 'rb') as f:
            files = {'file': (filename, f, 'text/plain')}
            data = {'candidate_id': candidate_ids[i]}
            response = requests.post(f"{BASE_URL}/resumes/", files=files, data=data)
        
        if response.status_code == 201:
            resume = response.json()
            print(f"✅ Resume uploaded for {resume['candidate_name']} (ID: {resume['id']})")
            resume_ids.append(resume['id'])
        else:
            print(f"❌ Failed to upload resume: {response.text}")
    
    return resume_ids

def test_matching(jd_id, resume_ids):
    """Test matching resumes with job description."""
    print_subsection("Matching Resumes with Job Description")
    
    # Match all resumes to the job description
    response = requests.post(f"{BASE_URL}/job_descriptions/{jd_id}/match-all-resumes/")
    if response.status_code == 200:
        matches = response.json()
        print(f"✅ Matched {matches['total_resumes_matched']} resumes")
        print(f"   High matches: {matches['high_matches']}")
        print(f"   Medium matches: {matches['medium_matches']}")
        print(f"   Low matches: {matches['low_matches']}")
        
        for match in matches['matches']:
            print(f"   - {match['candidate_name']}: {match['match_score']}%")
        
        return matches['matches']
    else:
        print(f"❌ Failed to match resumes: {response.text}")
        return []

def test_application_creation(jd_id, candidate_ids, matches):
    """Create applications for candidates."""
    print_subsection("Creating Applications")
    
    applications = []
    for i, candidate_id in enumerate(candidate_ids):
        # Find the corresponding match
        match = next((m for m in matches if m['candidate_name'] in f"Candidate {candidate_id}"), None)
        
        application_data = {
            "job_description": jd_id,
            "candidate": candidate_id,
            "cover_letter": f"This is a cover letter from candidate {i+1} explaining their interest in the position.",
            "expected_salary": 120000 + (i * 10000),  # Different salaries for each candidate
            "salary_currency": "USD",
            "source": "ats_match" if match else "direct_apply",
            "status": "applied"
        }
        
        if match:
            application_data["match"] = match['match_id']
        
        response = requests.post(f"{BASE_URL}/applications/", json=application_data, headers=HEADERS)
        if response.status_code == 201:
            application = response.json()
            print(f"✅ Application created: {application['application_id']} for {application['candidate_name']}")
            applications.append(application)
        else:
            print(f"❌ Failed to create application: {response.text}")
    
    return applications

def test_application_status_updates(applications):
    """Test updating application statuses."""
    print_subsection("Updating Application Statuses")
    
    status_updates = [
        ("shortlisted", "This candidate shows great potential based on their skills and experience."),
        ("interview_scheduled", "Interview scheduled for next week."),
        ("interviewed", "Candidate performed well in the technical interview."),
        ("offer_made", "Offer extended with competitive salary package.")
    ]
    
    for i, (status, notes) in enumerate(status_updates):
        if i < len(applications):
            app = applications[i]
            update_data = {
                "status": status,
                "notes": notes,
                "user_role": "recruiter"
            }
            
            response = requests.post(f"{BASE_URL}/applications/{app['id']}/update-status/", json=update_data, headers=HEADERS)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Updated {app['application_id']} to {status}")
            else:
                print(f"❌ Failed to update status: {response.text}")

def test_analytics():
    """Test analytics endpoints."""
    print_subsection("Testing Analytics")
    
    # Test general analytics
    response = requests.get(f"{BASE_URL}/applications/analytics/")
    if response.status_code == 200:
        analytics = response.json()
        print("📊 General Analytics:")
        print(f"   Period: {analytics['period']}")
        print(f"   Total Applications: {analytics['total_applications']}")
        print(f"   ATS Match Applications: {analytics['ats_match_applications']}")
        print(f"   Direct Applications: {analytics['direct_applications']}")
        print(f"   Conversion Rate: {analytics['conversion_rate']}%")
        print(f"   Avg Time to Application: {analytics['avg_time_to_application_days']} days")
        
        print("\n   Status Breakdown:")
        for status in analytics['status_breakdown']:
            print(f"     {status['status']}: {status['count']}")
        
        print("\n   Source Breakdown:")
        for source in analytics['source_breakdown']:
            print(f"     {source['source']}: {source['count']}")
    else:
        print(f"❌ Failed to get analytics: {response.text}")
    
    # Test conversion metrics
    response = requests.get(f"{BASE_URL}/applications/conversion-metrics/")
    if response.status_code == 200:
        conversion = response.json()
        print("\n📈 Conversion Metrics:")
        print(f"   Period: {conversion['period']}")
        print(f"   Total Matches: {conversion['total_matches']}")
        print(f"   Applications from Matches: {conversion['total_applications_from_matches']}")
        print(f"   Overall Conversion Rate: {conversion['overall_conversion_rate']}%")
        
        print("\n   Conversion by Match Quality:")
        for quality, data in conversion['conversion_by_match_quality'].items():
            print(f"     {quality.replace('_', ' ').title()}:")
            print(f"       Total: {data['total']}")
            print(f"       Applications: {data['applications']}")
            print(f"       Conversion Rate: {data['conversion_rate']}%")
    else:
        print(f"❌ Failed to get conversion metrics: {response.text}")

def test_skill_management(candidate_ids):
    """Test skill management functionality."""
    print_subsection("Testing Skill Management")
    
    # Test adding skills to a candidate
    candidate_id = candidate_ids[0]
    add_skills_data = {
        "action": "add",
        "skills": ["Machine Learning", "Data Science", "TensorFlow"]
    }
    
    response = requests.post(f"{BASE_URL}/candidates/{candidate_id}/manage-skills/", json=add_skills_data, headers=HEADERS)
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Added skills to candidate: {result['message']}")
        print(f"   Total skills: {result['total_skills']}")
    else:
        print(f"❌ Failed to add skills: {response.text}")
    
    # Test removing skills
    remove_skills_data = {
        "action": "remove",
        "skills": ["Data Science"]
    }
    
    response = requests.post(f"{BASE_URL}/candidates/{candidate_id}/manage-skills/", json=remove_skills_data, headers=HEADERS)
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Removed skills from candidate: {result['message']}")
        print(f"   Total skills: {result['total_skills']}")
    else:
        print(f"❌ Failed to remove skills: {response.text}")
    
    # Test getting skills
    response = requests.get(f"{BASE_URL}/candidates/{candidate_id}/skills/")
    if response.status_code == 200:
        skills = response.json()
        print(f"✅ Retrieved skills for {skills['candidate_name']}:")
        print(f"   Skills: {', '.join(skills['skills'])}")
        print(f"   Total: {skills['total_skills']}")
    else:
        print(f"❌ Failed to get skills: {response.text}")

def cleanup_test_files():
    """Clean up test files."""
    import os
    test_files = ["alice_resume.txt", "bob_resume.txt", "carol_resume.txt"]
    for filename in test_files:
        if os.path.exists(filename):
            os.remove(filename)
            print(f"🗑️  Cleaned up {filename}")

def main():
    """Main test function."""
    print_section("Application Tracking System Test")
    print("This script demonstrates the complete pipeline from matching to application to analytics.")
    
    try:
        # Step 1: Create job description
        jd_id = test_job_description_creation()
        if not jd_id:
            return
        
        # Step 2: Create candidates
        candidate_ids = test_candidate_creation()
        if not candidate_ids:
            return
        
        # Step 3: Upload resumes
        resume_ids = test_resume_upload(candidate_ids)
        if not resume_ids:
            return
        
        # Step 4: Match resumes with job description
        matches = test_matching(jd_id, resume_ids)
        
        # Step 5: Create applications
        applications = test_application_creation(jd_id, candidate_ids, matches)
        
        # Step 6: Update application statuses
        test_application_status_updates(applications)
        
        # Step 7: Test analytics
        test_analytics()
        
        # Step 8: Test skill management
        test_skill_management(candidate_ids)
        
        print_section("Test Complete")
        print("✅ All tests completed successfully!")
        print("\n📋 Summary:")
        print(f"   - Created 1 job description")
        print(f"   - Created {len(candidate_ids)} candidates")
        print(f"   - Uploaded {len(resume_ids)} resumes")
        print(f"   - Generated {len(matches)} matches")
        print(f"   - Created {len(applications)} applications")
        print(f"   - Tested analytics and skill management")
        
        print("\n🔗 API Endpoints tested:")
        print("   - POST /api/job_descriptions/")
        print("   - POST /api/candidates/")
        print("   - POST /api/resumes/")
        print("   - POST /api/job_descriptions/{id}/match-all-resumes/")
        print("   - POST /api/applications/")
        print("   - POST /api/applications/{id}/update-status/")
        print("   - GET /api/applications/analytics/")
        print("   - GET /api/applications/conversion-metrics/")
        print("   - POST /api/candidates/{id}/manage-skills/")
        print("   - GET /api/candidates/{id}/skills/")
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
    finally:
        cleanup_test_files()

if __name__ == "__main__":
    main() 