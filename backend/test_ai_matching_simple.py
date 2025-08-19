#!/usr/bin/env python3
"""
Simple test script for AI-enhanced resume matching
Tests the system without requiring database setup
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from candidate_ranking.ai_matching_service import ai_matching_service

def test_ai_matching_simple():
    """Test the AI matching service with simple data"""
    
    print("🤖 Testing AI-Enhanced Resume Matching (Simple)")
    print("=" * 50)
    
    # Test data
    test_job_description = """
    Senior Python Developer
    
    We are looking for a Senior Python Developer to join our team. 
    You will be responsible for building scalable web applications using Python, Django, and modern technologies.
    
    Requirements:
    - Strong experience with Python and Django
    - Knowledge of REST APIs and database design
    - Experience with cloud platforms (AWS)
    - Understanding of CI/CD pipelines
    """
    
    test_job_requirements = """
    - 3+ years of experience in Python development
    - Python, Django, REST APIs, PostgreSQL, AWS
    - Git, Agile methodologies
    """
    
    test_candidate_skills = [
        "Python", "Django", "PostgreSQL", "REST APIs", "Git", "AWS"
    ]
    
    test_candidate_experience = "4 years of Python development experience"
    test_candidate_education = "Bachelor's degree in Computer Science"
    
    print("📋 Test Data:")
    print(f"Job Description: {test_job_description[:100]}...")
    print(f"Candidate Skills: {test_candidate_skills}")
    print(f"Candidate Experience: {test_candidate_experience}")
    print(f"Candidate Education: {test_candidate_education}")
    print()
    
    # Test AI matching
    print("🔍 Testing AI Matching...")
    try:
        ai_result = ai_matching_service.calculate_ai_skill_match(
            job_description=test_job_description,
            job_requirements=test_job_requirements,
            candidate_skills=test_candidate_skills,
            candidate_experience=test_candidate_experience,
            candidate_education=test_candidate_education
        )
        
        print("✅ AI Matching Results:")
        print(f"   Overall Score: {ai_result['overall_score']}%")
        print(f"   AI Used: {ai_result['ai_used']}")
        print(f"   Matched Skills: {ai_result['skill_analysis']['matched_skills']}")
        print(f"   Related Skills: {ai_result['skill_analysis']['related_skills']}")
        print(f"   Missing Critical: {ai_result['skill_analysis']['missing_critical_skills']}")
        print(f"   Missing Nice-to-Have: {ai_result['skill_analysis']['missing_nice_to_have_skills']}")
        print(f"   Experience Match: {ai_result['experience_match']['score']}%")
        print(f"   Education Match: {ai_result['education_match']['score']}%")
        print(f"   Reasoning: {ai_result['detailed_reasoning'][:200]}...")
        print(f"   Recommendations: {ai_result['recommendations']}")
        print()
        
        if ai_result['ai_used']:
            print("🎉 AI matching is working correctly!")
        else:
            print("⚠️ AI not available, using fallback matching")
        
    except Exception as e:
        print(f"❌ AI Matching failed: {e}")
        print("   This might be due to missing API key or network issues")
        print()
    
    # Test fallback matching
    print("🔄 Testing Fallback Matching...")
    try:
        fallback_result = ai_matching_service._fallback_skill_match(
            job_description=test_job_description,
            job_requirements=test_job_requirements,
            candidate_skills=test_candidate_skills
        )
        
        print("✅ Fallback Matching Results:")
        print(f"   Overall Score: {fallback_result['overall_score']}%")
        print(f"   Matched Skills: {fallback_result['skill_analysis']['matched_skills']}")
        print(f"   Missing Skills: {fallback_result['skill_analysis']['missing_critical_skills']}")
        print()
        
    except Exception as e:
        print(f"❌ Fallback matching failed: {e}")
        print()
    
    print("🎯 System Status:")
    print(f"   AI Available: {ai_matching_service.ai_available}")
    print(f"   Gemini Client: {'Available' if ai_matching_service.gemini_client else 'Not Available'}")
    print()
    
    if ai_matching_service.ai_available:
        print("🚀 AI-enhanced matching is ready!")
    else:
        print("⚠️ AI not available - check GEMINI_API_KEY environment variable")
        print("   Fallback matching will be used instead")
    
    print()
    print("✅ Test completed!")

if __name__ == "__main__":
    test_ai_matching_simple()
