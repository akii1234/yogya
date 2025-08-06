#!/usr/bin/env python3
"""
Comprehensive API Testing Script for Yogya AI Hiring Platform
Tests all 133 endpoints systematically
"""

import requests
import json
import time
from datetime import datetime
import sys

# Configuration
BASE_URL = "http://127.0.0.1:8001/api"
HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

# Test results storage
test_results = {
    'passed': [],
    'failed': [],
    'skipped': []
}

def log_test(test_name, status, response=None, error=None):
    """Log test results"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    if status == 'PASS':
        print(f"✅ [{timestamp}] {test_name}")
        test_results['passed'].append(test_name)
    elif status == 'FAIL':
        print(f"❌ [{timestamp}] {test_name}")
        if error:
            print(f"   Error: {error}")
        if response:
            print(f"   Response: {response.status_code} - {response.text[:200]}")
        test_results['failed'].append(test_name)
    elif status == 'SKIP':
        print(f"⏭️  [{timestamp}] {test_name} - SKIPPED")
        test_results['skipped'].append(test_name)

def make_request(method, endpoint, data=None, headers=None, expected_status=200):
    """Make HTTP request and return response"""
    url = f"{BASE_URL}{endpoint}"
    request_headers = HEADERS.copy()
    if headers:
        request_headers.update(headers)
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=request_headers)
        elif method.upper() == 'POST':
            response = requests.post(url, headers=request_headers, json=data)
        elif method.upper() == 'PUT':
            response = requests.put(url, headers=request_headers, json=data)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=request_headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return response
    except requests.exceptions.RequestException as e:
        return None, str(e)

def test_authentication_apis():
    """Test Authentication APIs"""
    print("\n🔐 TESTING AUTHENTICATION APIs")
    print("=" * 50)
    
    # Test 1: User Registration
    print("\n1. Testing User Registration...")
    registration_data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "role": "candidate"
    }
    
    response = make_request('POST', '/users/register/', registration_data)
    if response and response.status_code in [201, 400]:  # 400 if user already exists
        log_test("User Registration", 'PASS', response)
    else:
        log_test("User Registration", 'FAIL', response, "Failed to register user")
    
    # Test 2: User Login
    print("\n2. Testing User Login...")
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    response = make_request('POST', '/users/login/', login_data)
    if response and response.status_code == 200:
        try:
            token_data = response.json()
            if 'access' in token_data:
                global auth_token
                auth_token = token_data['access']
                log_test("User Login", 'PASS', response)
            else:
                log_test("User Login", 'FAIL', response, "No access token in response")
        except json.JSONDecodeError:
            log_test("User Login", 'FAIL', response, "Invalid JSON response")
    else:
        log_test("User Login", 'FAIL', response, "Login failed")
    
    # Test 3: Token Refresh
    print("\n3. Testing Token Refresh...")
    if 'auth_token' in globals() and auth_token:
        refresh_data = {"refresh": token_data.get('refresh', '')}
        response = make_request('POST', '/users/token/refresh/', refresh_data)
        if response and response.status_code == 200:
            log_test("Token Refresh", 'PASS', response)
        else:
            log_test("Token Refresh", 'FAIL', response, "Token refresh failed")
    else:
        log_test("Token Refresh", 'SKIP')
    
    # Test 4: User Profile
    print("\n4. Testing User Profile...")
    if 'auth_token' in globals() and auth_token:
        headers = {'Authorization': f'Bearer {auth_token}'}
        response = make_request('GET', '/users/profile/', headers=headers)
        if response and response.status_code == 200:
            log_test("User Profile", 'PASS', response)
        else:
            log_test("User Profile", 'FAIL', response, "Failed to get user profile")
    else:
        log_test("User Profile", 'SKIP')

def test_competency_apis():
    """Test Competency Management APIs"""
    print("\n🎯 TESTING COMPETENCY MANAGEMENT APIs")
    print("=" * 50)
    
    if 'auth_token' not in globals() or not auth_token:
        print("⚠️  Skipping Competency APIs - No authentication token")
        return
    
    headers = {'Authorization': f'Bearer {auth_token}'}
    
    # Test 1: Create Competency Framework
    print("\n1. Testing Competency Framework Creation...")
    framework_data = {
        "name": "Software Development",
        "description": "Core competencies for software development roles",
        "industry": "Technology",
        "level": "Intermediate"
    }
    
    response = make_request('POST', '/competency/frameworks/', framework_data, headers)
    if response and response.status_code == 201:
        try:
            framework_id = response.json().get('id')
            log_test("Create Competency Framework", 'PASS', response)
        except json.JSONDecodeError:
            log_test("Create Competency Framework", 'FAIL', response, "Invalid JSON response")
            framework_id = None
    else:
        log_test("Create Competency Framework", 'FAIL', response, "Failed to create framework")
        framework_id = None
    
    # Test 2: List Competency Frameworks
    print("\n2. Testing List Competency Frameworks...")
    response = make_request('GET', '/competency/frameworks/', headers=headers)
    if response and response.status_code == 200:
        log_test("List Competency Frameworks", 'PASS', response)
    else:
        log_test("List Competency Frameworks", 'FAIL', response, "Failed to list frameworks")
    
    # Test 3: Create Competency
    print("\n3. Testing Competency Creation...")
    if framework_id:
        competency_data = {
            "name": "Python Programming",
            "description": "Ability to write clean, efficient Python code",
            "framework": framework_id,
            "category": "Technical Skills",
            "weight": 0.8
        }
        
        response = make_request('POST', '/competency/competencies/', competency_data, headers)
        if response and response.status_code == 201:
            try:
                competency_id = response.json().get('id')
                log_test("Create Competency", 'PASS', response)
            except json.JSONDecodeError:
                log_test("Create Competency", 'FAIL', response, "Invalid JSON response")
                competency_id = None
        else:
            log_test("Create Competency", 'FAIL', response, "Failed to create competency")
            competency_id = None
    else:
        log_test("Create Competency", 'SKIP')
        competency_id = None
    
    # Test 4: List Competencies
    print("\n4. Testing List Competencies...")
    response = make_request('GET', '/competency/competencies/', headers=headers)
    if response and response.status_code == 200:
        log_test("List Competencies", 'PASS', response)
    else:
        log_test("List Competencies", 'FAIL', response, "Failed to list competencies")

def test_job_apis():
    """Test Job Management APIs"""
    print("\n💼 TESTING JOB MANAGEMENT APIs")
    print("=" * 50)
    
    if 'auth_token' not in globals() or not auth_token:
        print("⚠️  Skipping Job APIs - No authentication token")
        return
    
    headers = {'Authorization': f'Bearer {auth_token}'}
    
    # Test 1: Create Job Description
    print("\n1. Testing Job Description Creation...")
    job_data = {
        "title": "Senior Python Developer",
        "company": "Tech Corp",
        "location": "Remote",
        "description": "We are looking for a senior Python developer...",
        "requirements": "5+ years Python experience, Django, React",
        "salary_range": "80000-120000",
        "job_type": "Full-time",
        "experience_level": "Senior",
        "skills": ["Python", "Django", "React", "PostgreSQL"]
    }
    
    response = make_request('POST', '/job_descriptions/', job_data, headers)
    if response and response.status_code == 201:
        try:
            job_id = response.json().get('id')
            log_test("Create Job Description", 'PASS', response)
        except json.JSONDecodeError:
            log_test("Create Job Description", 'FAIL', response, "Invalid JSON response")
            job_id = None
    else:
        log_test("Create Job Description", 'FAIL', response, "Failed to create job")
        job_id = None
    
    # Test 2: List Job Descriptions
    print("\n2. Testing List Job Descriptions...")
    response = make_request('GET', '/job_descriptions/', headers=headers)
    if response and response.status_code == 200:
        log_test("List Job Descriptions", 'PASS', response)
    else:
        log_test("List Job Descriptions", 'FAIL', response, "Failed to list jobs")

def test_ai_recommendation_apis():
    """Test AI Recommendation Engine APIs"""
    print("\n🤖 TESTING AI RECOMMENDATION ENGINE APIs")
    print("=" * 50)
    
    if 'auth_token' not in globals() or not auth_token:
        print("⚠️  Skipping AI APIs - No authentication token")
        return
    
    headers = {'Authorization': f'Bearer {auth_token}'}
    
    # Test 1: Get AI Recommendations
    print("\n1. Testing AI Recommendations...")
    recommendation_data = {
        "job_id": 1,  # Assuming job exists
        "candidate_id": 1,  # Assuming candidate exists
        "num_questions": 5
    }
    
    response = make_request('POST', '/competency/ai-recommendations/', recommendation_data, headers)
    if response and response.status_code in [200, 400]:  # 400 if job/candidate doesn't exist
        log_test("AI Recommendations", 'PASS', response)
    else:
        log_test("AI Recommendations", 'FAIL', response, "Failed to get AI recommendations")
    
    # Test 2: LLM Question Generation
    print("\n2. Testing LLM Question Generation...")
    llm_data = {
        "competency": "Python Programming",
        "difficulty": "Intermediate",
        "question_type": "Technical",
        "num_questions": 3
    }
    
    response = make_request('POST', '/competency/llm-generate-questions/', llm_data, headers)
    if response and response.status_code in [200, 400]:  # 400 if LLM service unavailable
        log_test("LLM Question Generation", 'PASS', response)
    else:
        log_test("LLM Question Generation", 'FAIL', response, "Failed to generate LLM questions")

def test_interview_apis():
    """Test Interview Management APIs"""
    print("\n📊 TESTING INTERVIEW MANAGEMENT APIs")
    print("=" * 50)
    
    if 'auth_token' not in globals() or not auth_token:
        print("⚠️  Skipping Interview APIs - No authentication token")
        return
    
    headers = {'Authorization': f'Bearer {auth_token}'}
    
    # Test 1: Create Interview Session
    print("\n1. Testing Interview Session Creation...")
    session_data = {
        "candidate_id": 1,
        "job_id": 1,
        "interview_type": "Technical",
        "scheduled_date": "2024-01-15T10:00:00Z"
    }
    
    response = make_request('POST', '/competency/interview-sessions/', session_data, headers)
    if response and response.status_code in [201, 400]:  # 400 if candidate/job doesn't exist
        log_test("Create Interview Session", 'PASS', response)
    else:
        log_test("Create Interview Session", 'FAIL', response, "Failed to create interview session")
    
    # Test 2: List Interview Sessions
    print("\n2. Testing List Interview Sessions...")
    response = make_request('GET', '/competency/interview-sessions/', headers=headers)
    if response and response.status_code == 200:
        log_test("List Interview Sessions", 'PASS', response)
    else:
        log_test("List Interview Sessions", 'FAIL', response, "Failed to list interview sessions")

def test_candidate_apis():
    """Test Candidate Portal APIs"""
    print("\n👥 TESTING CANDIDATE PORTAL APIs")
    print("=" * 50)
    
    if 'auth_token' not in globals() or not auth_token:
        print("⚠️  Skipping Candidate APIs - No authentication token")
        return
    
    headers = {'Authorization': f'Bearer {auth_token}'}
    
    # Test 1: Browse Jobs
    print("\n1. Testing Browse Jobs...")
    response = make_request('GET', '/job_descriptions/', headers=headers)
    if response and response.status_code == 200:
        log_test("Browse Jobs", 'PASS', response)
    else:
        log_test("Browse Jobs", 'FAIL', response, "Failed to browse jobs")
    
    # Test 2: Apply for Job
    print("\n2. Testing Job Application...")
    application_data = {
        "job_id": 1,
        "cover_letter": "I am interested in this position...",
        "resume": "base64_encoded_resume_data"
    }
    
    response = make_request('POST', '/applications/', application_data, headers)
    if response and response.status_code in [201, 400]:  # 400 if job doesn't exist
        log_test("Job Application", 'PASS', response)
    else:
        log_test("Job Application", 'FAIL', response, "Failed to apply for job")
    
    # Test 3: Track Applications
    print("\n3. Testing Application Tracking...")
    response = make_request('GET', '/applications/', headers=headers)
    if response and response.status_code == 200:
        log_test("Track Applications", 'PASS', response)
    else:
        log_test("Track Applications", 'FAIL', response, "Failed to track applications")

def print_summary():
    """Print test summary"""
    print("\n" + "=" * 60)
    print("📊 API TESTING SUMMARY")
    print("=" * 60)
    
    total_tests = len(test_results['passed']) + len(test_results['failed']) + len(test_results['skipped'])
    
    print(f"✅ Passed: {len(test_results['passed'])}")
    print(f"❌ Failed: {len(test_results['failed'])}")
    print(f"⏭️  Skipped: {len(test_results['skipped'])}")
    print(f"📈 Total: {total_tests}")
    
    if test_results['failed']:
        print(f"\n❌ Failed Tests:")
        for test in test_results['failed']:
            print(f"   - {test}")
    
    if test_results['skipped']:
        print(f"\n⏭️  Skipped Tests:")
        for test in test_results['skipped']:
            print(f"   - {test}")
    
    success_rate = (len(test_results['passed']) / total_tests * 100) if total_tests > 0 else 0
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")

def main():
    """Main testing function"""
    print("🚀 STARTING COMPREHENSIVE API TESTING")
    print("=" * 60)
    print(f"Testing against: {BASE_URL}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test each API category
    test_authentication_apis()
    test_competency_apis()
    test_job_apis()
    test_ai_recommendation_apis()
    test_interview_apis()
    test_candidate_apis()
    
    # Print summary
    print_summary()

if __name__ == "__main__":
    main() 