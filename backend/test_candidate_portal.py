#!/usr/bin/env python3
"""
Test script for Candidate Portal APIs
"""

import requests
import json

BASE_URL = "http://localhost:8001/api"

def test_browse_jobs():
    """Test job browsing API"""
    print("🔍 Testing Browse Jobs API...")
    
    response = requests.get(f"{BASE_URL}/candidate-portal/browse-jobs/")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Found {data['total_count']} jobs")
        for job in data['jobs']:
            print(f"   - {job['title']} at {job['company']}")
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        return False

def test_candidate_profile():
    """Test candidate profile API"""
    print("\n👤 Testing Candidate Profile API...")
    
    response = requests.get(f"{BASE_URL}/candidate-portal/candidate-profile/?candidate_id=1")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Profile for {data['first_name']} {data['last_name']}")
        print(f"   - Email: {data['email']}")
        print(f"   - Experience: {data['total_experience_years']} years")
        print(f"   - Skills: {', '.join(data['skills'])}")
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        return False

def test_apply_job():
    """Test job application API"""
    print("\n📝 Testing Job Application API...")
    
    application_data = {
        "job_id": 5,
        "candidate_id": 1,
        "cover_letter": "I am very interested in this position and believe my skills match perfectly.",
        "expected_salary": 85000,
        "source": "direct_apply"
    }
    
    response = requests.post(
        f"{BASE_URL}/candidate-portal/apply-job/",
        json=application_data,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Success! Application submitted with ID: {data['application']['application_id']}")
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def test_my_applications():
    """Test my applications API"""
    print("\n📋 Testing My Applications API...")
    
    response = requests.get(f"{BASE_URL}/candidate-portal/my-applications/?candidate_id=1")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Found {data['total_count']} applications")
        for app in data['applications']:
            print(f"   - {app['jobTitle']} at {app['company']} (Status: {app['status']})")
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        return False

def test_update_profile():
    """Test profile update API"""
    print("\n✏️ Testing Profile Update API...")
    
    update_data = {
        "candidate_id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "phone": "+1 (555) 123-4567",
        "city": "San Francisco",
        "state": "CA",
        "country": "USA",
        "current_title": "Senior React Developer",
        "current_company": "TechCorp Inc.",
        "total_experience_years": 5,
        "highest_education": "bachelor",
        "degree_field": "Computer Science",
        "skills": ["React", "JavaScript", "TypeScript", "Node.js", "Python", "Django"]
    }
    
    response = requests.put(
        f"{BASE_URL}/candidate-portal/update-profile/",
        json=update_data,
        headers={'Content-Type': 'application/json'}
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Profile updated for {data['profile']['first_name']} {data['profile']['last_name']}")
        return True
    else:
        print(f"❌ Failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing Candidate Portal APIs\n")
    print("=" * 50)
    
    tests = [
        test_browse_jobs,
        test_candidate_profile,
        test_apply_job,
        test_my_applications,
        test_update_profile
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Candidate Portal APIs are working correctly.")
    else:
        print("⚠️ Some tests failed. Please check the API implementation.")

if __name__ == "__main__":
    main() 