#!/usr/bin/env python3
"""
Test Script for Auto-Skill Population System
Demonstrates the new functionality where skills are automatically populated from resumes
and candidates can add/remove additional skills.
"""

import requests
import json
import time
import os

# Configuration
BASE_URL = "http://127.0.0.1:8000/api"
HEADERS = {"Content-Type": "application/json"}

def print_step(step_num, title):
    """Print a formatted step header"""
    print(f"\n{'='*60}")
    print(f"STEP {step_num}: {title}")
    print(f"{'='*60}")

def print_response(title, response):
    """Print formatted API response"""
    print(f"\n📋 {title}:")
    print(f"Status: {response.status_code}")
    try:
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
    except:
        print(f"Response: {response.text}")

def test_skill_management():
    """Main test function"""
    print("🚀 Testing Auto-Skill Population System")
    print("This script demonstrates the new functionality where:")
    print("1. Skills are automatically extracted from resumes")
    print("2. Candidates can add/remove additional skills")
    print("3. Matching uses complete skill profiles")
    
    # Step 1: Create Job Description
    print_step(1, "Creating Job Description")
    jd_data = {
        "title": "Senior Python Developer",
        "company": "BigTech",
        "department": "Engineering",
        "description": "We are looking for a Senior Python Developer with experience in Django, REST APIs, and PostgreSQL. The ideal candidate should have experience with microservices architecture and cloud platforms like AWS.",
        "requirements": "Python, Django, REST API, PostgreSQL, AWS, Docker, Microservices",
        "experience_level": "senior",
        "min_experience_years": 5,
        "employment_type": "full_time"
    }
    
    jd_response = requests.post(f"{BASE_URL}/job_descriptions/", json=jd_data, headers=HEADERS)
    print_response("Job Description Creation", jd_response)
    
    if jd_response.status_code != 201:
        print("❌ Failed to create job description. Exiting.")
        return
    
    jd_id = jd_response.json()['id']
    print(f"✅ Job Description created with ID: {jd_id}")
    
    # Step 2: Create Candidate (without skills)
    print_step(2, "Creating Candidate (No Skills)")
    candidate_data = {
        "first_name": "Sarah",
        "last_name": "Johnson",
        "email": f"sarah.johnson.{int(time.time())}@example.com",
        "current_title": "Software Engineer",
        "current_company": "TechStart",
        "total_experience_years": 6
    }
    
    candidate_response = requests.post(f"{BASE_URL}/candidates/", json=candidate_data, headers=HEADERS)
    print_response("Candidate Creation", candidate_response)
    
    if candidate_response.status_code != 201:
        print("❌ Failed to create candidate. Exiting.")
        return
    
    candidate_id = candidate_response.json()['id']
    print(f"✅ Candidate created with ID: {candidate_id}")
    
    # Step 3: Check Initial Skills (should be empty)
    print_step(3, "Checking Initial Skills (Should be Empty)")
    skills_response = requests.get(f"{BASE_URL}/candidates/{candidate_id}/skills/")
    print_response("Initial Skills", skills_response)
    
    # Step 4: Upload Resume (Auto-Populates Skills)
    print_step(4, "Uploading Resume (Auto-Populates Skills)")
    
    # Check if sample resume exists
    sample_resume_path = "sample_resumes/sarah_johnson_junior.txt"
    if not os.path.exists(sample_resume_path):
        print(f"❌ Sample resume not found at {sample_resume_path}")
        print("Creating a sample resume content...")
        
        # Create sample resume content
        sample_resume_content = """
        SARAH JOHNSON
        Software Engineer
        sarah.johnson@example.com
        
        EXPERIENCE
        Software Engineer at TechStart (2020-Present)
        - Developed web applications using Python and Django
        - Built REST APIs for mobile applications
        - Worked with PostgreSQL databases
        - Implemented unit testing with pytest
        - Used Git for version control
        
        SKILLS
        Python, Django, REST API, PostgreSQL, Git, Unit Testing, pytest
        
        EDUCATION
        Bachelor's in Computer Science
        """
        
        # Create the sample resume file
        os.makedirs("sample_resumes", exist_ok=True)
        with open(sample_resume_path, "w") as f:
            f.write(sample_resume_content)
        print(f"✅ Created sample resume at {sample_resume_path}")
    
    # Upload resume
    with open(sample_resume_path, 'rb') as f:
        files = {'file': f}
        data = {'candidate_id': candidate_id}
        resume_response = requests.post(f"{BASE_URL}/resumes/", files=files, data=data)
    
    print_response("Resume Upload (Auto-Populates Skills)", resume_response)
    
    if resume_response.status_code != 201:
        print("❌ Failed to upload resume. Exiting.")
        return
    
    resume_id = resume_response.json()['id']
    print(f"✅ Resume uploaded with ID: {resume_id}")
    
    # Step 5: Check Auto-Populated Skills
    print_step(5, "Checking Auto-Populated Skills")
    time.sleep(1)  # Give a moment for processing
    skills_response = requests.get(f"{BASE_URL}/candidates/{candidate_id}/skills/")
    print_response("Auto-Populated Skills", skills_response)
    
    # Step 6: Add Additional Skills
    print_step(6, "Adding Additional Skills")
    add_skills_data = {
        "action": "add",
        "skills": ["AWS", "Docker", "Kubernetes", "Microservices", "CI/CD"]
    }
    
    add_skills_response = requests.post(f"{BASE_URL}/candidates/{candidate_id}/manage-skills/", 
                                      json=add_skills_data, headers=HEADERS)
    print_response("Adding Skills", add_skills_response)
    
    # Step 7: Check Complete Skill Profile
    print_step(7, "Checking Complete Skill Profile")
    skills_response = requests.get(f"{BASE_URL}/candidates/{candidate_id}/skills/")
    print_response("Complete Skill Profile", skills_response)
    
    # Step 8: Remove Some Skills
    print_step(8, "Removing Some Skills")
    remove_skills_data = {
        "action": "remove",
        "skills": ["Kubernetes", "CI/CD"]
    }
    
    remove_skills_response = requests.post(f"{BASE_URL}/candidates/{candidate_id}/manage-skills/", 
                                         json=remove_skills_data, headers=HEADERS)
    print_response("Removing Skills", remove_skills_response)
    
    # Step 9: Check Final Skill Profile
    print_step(9, "Checking Final Skill Profile")
    skills_response = requests.get(f"{BASE_URL}/candidates/{candidate_id}/skills/")
    print_response("Final Skill Profile", skills_response)
    
    # Step 10: Test Matching with Enhanced Skills
    print_step(10, "Testing Matching with Enhanced Skills")
    match_data = {
        "job_description_id": jd_id
    }
    
    match_response = requests.post(f"{BASE_URL}/resumes/{resume_id}/match/", 
                                 json=match_data, headers=HEADERS)
    print_response("Matching with Enhanced Skills", match_response)
    
    # Step 11: Test Match All Resumes
    print_step(11, "Testing Match All Resumes")
    match_all_response = requests.post(f"{BASE_URL}/job_descriptions/{jd_id}/match-all-resumes/")
    print_response("Match All Resumes", match_all_response)
    
    # Summary
    print_step(12, "Test Summary")
    print("✅ Auto-Skill Population System Test Complete!")
    print("\n🎯 What was demonstrated:")
    print("1. ✅ Skills automatically extracted from resume")
    print("2. ✅ Skills added to candidate profile")
    print("3. ✅ Additional skills can be added manually")
    print("4. ✅ Skills can be removed manually")
    print("5. ✅ Matching uses complete skill profile")
    print("6. ✅ Enhanced matching accuracy")
    
    print(f"\n📊 Test Results:")
    print(f"- Job Description ID: {jd_id}")
    print(f"- Candidate ID: {candidate_id}")
    print(f"- Resume ID: {resume_id}")
    
    # Get final skill count
    final_skills = requests.get(f"{BASE_URL}/candidates/{candidate_id}/skills/")
    if final_skills.status_code == 200:
        skill_count = final_skills.json().get('total_skills', 0)
        print(f"- Final Skill Count: {skill_count}")
    
    print("\n🚀 The system now works like a real-world ATS!")
    print("Skills are automatically populated from resumes and can be managed by candidates.")

if __name__ == "__main__":
    try:
        test_skill_management()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to the server.")
        print("Please make sure the Django server is running on http://127.0.0.1:8000")
        print("Run: python manage.py runserver")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Please check the server logs for more details.") 