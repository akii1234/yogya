#!/usr/bin/env python3
"""
Test script for Competency Hiring API endpoints
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000/api/competency"

def test_frameworks():
    """Test competency frameworks endpoints"""
    print("🔧 Testing Competency Frameworks...")
    
    # Get all frameworks
    response = requests.get(f"{BASE_URL}/frameworks/")
    print(f"GET /frameworks/: {response.status_code}")
    if response.status_code == 200:
        frameworks = response.json()
        print(f"✅ Found {len(frameworks.get('results', []))} frameworks")
        return frameworks.get('results', [])
    else:
        print(f"❌ Failed: {response.text}")
        return []

def test_competencies():
    """Test competencies endpoints"""
    print("\n🎯 Testing Competencies...")
    
    # Get all competencies
    response = requests.get(f"{BASE_URL}/competencies/")
    print(f"GET /competencies/: {response.status_code}")
    if response.status_code == 200:
        competencies = response.json()
        print(f"✅ Found {len(competencies.get('results', []))} competencies")
        return competencies.get('results', [])
    else:
        print(f"❌ Failed: {response.text}")
        return []

def test_templates():
    """Test interview templates endpoints"""
    print("\n📋 Testing Interview Templates...")
    
    # Get all templates
    response = requests.get(f"{BASE_URL}/templates/")
    print(f"GET /templates/: {response.status_code}")
    if response.status_code == 200:
        templates = response.json()
        print(f"✅ Found {len(templates.get('results', []))} templates")
        return templates.get('results', [])
    else:
        print(f"❌ Failed: {response.text}")
        return []

def test_questions():
    """Test interview questions endpoints"""
    print("\n❓ Testing Interview Questions...")
    
    # Get all questions
    response = requests.get(f"{BASE_URL}/questions/")
    print(f"GET /questions/: {response.status_code}")
    if response.status_code == 200:
        questions = response.json()
        print(f"✅ Found {len(questions.get('results', []))} questions")
        return questions.get('results', [])
    else:
        print(f"❌ Failed: {response.text}")
        return []

def test_sessions():
    """Test interview sessions endpoints"""
    print("\n📅 Testing Interview Sessions...")
    
    # Get all sessions
    response = requests.get(f"{BASE_URL}/sessions/")
    print(f"GET /sessions/: {response.status_code}")
    if response.status_code == 200:
        sessions = response.json()
        print(f"✅ Found {len(sessions.get('results', []))} sessions")
        return sessions.get('results', [])
    else:
        print(f"❌ Failed: {response.text}")
        return []

def test_analytics():
    """Test analytics endpoints"""
    print("\n📊 Testing Analytics...")
    
    # Get dashboard stats
    response = requests.get(f"{BASE_URL}/analytics/dashboard_stats/")
    print(f"GET /analytics/dashboard_stats/: {response.status_code}")
    if response.status_code == 200:
        stats = response.json()
        print(f"✅ Dashboard stats: {stats}")
        return stats
    else:
        print(f"❌ Failed: {response.text}")
        return {}

def test_framework_recommendation():
    """Test framework recommendation endpoint"""
    print("\n🤖 Testing Framework Recommendation...")
    
    # First, get a job description ID from the existing ATS system
    jd_response = requests.get("http://127.0.0.1:8000/api/job_descriptions/")
    if jd_response.status_code == 200:
        job_descriptions = jd_response.json()
        if job_descriptions.get('results'):
            job_id = job_descriptions['results'][0]['id']
            
            # Test framework recommendation
            recommendation_data = {
                "job_description_id": job_id
            }
            
            response = requests.post(
                f"{BASE_URL}/recommend-framework/",
                json=recommendation_data
            )
            print(f"POST /recommend-framework/: {response.status_code}")
            if response.status_code == 200:
                recommendation = response.json()
                print(f"✅ Recommendation: {recommendation}")
                return recommendation
            else:
                print(f"❌ Failed: {response.text}")
        else:
            print("⚠️ No job descriptions found to test recommendation")
    else:
        print("⚠️ Could not fetch job descriptions")
    
    return {}

def test_specific_framework():
    """Test specific framework endpoints"""
    print("\n🔍 Testing Specific Framework...")
    
    # Get frameworks first
    frameworks_response = requests.get(f"{BASE_URL}/frameworks/")
    if frameworks_response.status_code == 200:
        frameworks = frameworks_response.json()
        if frameworks.get('results'):
            framework_id = frameworks['results'][0]['id']
            
            # Get competencies for specific framework
            response = requests.get(f"{BASE_URL}/frameworks/{framework_id}/competencies/")
            print(f"GET /frameworks/{framework_id}/competencies/: {response.status_code}")
            if response.status_code == 200:
                competencies = response.json()
                print(f"✅ Found {len(competencies)} competencies for framework")
            else:
                print(f"❌ Failed: {response.text}")

def test_specific_template():
    """Test specific template endpoints"""
    print("\n📝 Testing Specific Template...")
    
    # Get templates first
    templates_response = requests.get(f"{BASE_URL}/templates/")
    if templates_response.status_code == 200:
        templates = templates_response.json()
        if templates.get('results'):
            template_id = templates['results'][0]['id']
            
            # Get questions for specific template
            response = requests.get(f"{BASE_URL}/templates/{template_id}/questions/")
            print(f"GET /templates/{template_id}/questions/: {response.status_code}")
            if response.status_code == 200:
                questions = response.json()
                print(f"✅ Found {len(questions)} questions for template")
            else:
                print(f"❌ Failed: {response.text}")

def main():
    """Run all tests"""
    print("🚀 Starting Competency Hiring API Tests")
    print("=" * 50)
    
    try:
        # Test basic endpoints
        frameworks = test_frameworks()
        competencies = test_competencies()
        templates = test_templates()
        questions = test_questions()
        sessions = test_sessions()
        analytics = test_analytics()
        
        # Test specific endpoints
        test_specific_framework()
        test_specific_template()
        
        # Test recommendation
        recommendation = test_framework_recommendation()
        
        print("\n" + "=" * 50)
        print("🎉 Competency Hiring API Tests Completed!")
        print("\n📋 Summary:")
        print(f"✅ Frameworks: {len(frameworks)}")
        print(f"✅ Competencies: {len(competencies)}")
        print(f"✅ Templates: {len(templates)}")
        print(f"✅ Questions: {len(questions)}")
        print(f"✅ Sessions: {len(sessions)}")
        print(f"✅ Analytics: {'Working' if analytics else 'Failed'}")
        print(f"✅ Recommendation: {'Working' if recommendation else 'Failed'}")
        
        print("\n🚀 Next Steps:")
        print("1. Test creating interview sessions")
        print("2. Test AI interview functionality")
        print("3. Test competency evaluations")
        print("4. Integrate with existing ATS system")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the Django server is running on http://127.0.0.1:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main() 