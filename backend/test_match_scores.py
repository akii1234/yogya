#!/usr/bin/env python3
"""
Test script for Match Score Calculation
"""

import requests
import json

BASE_URL = "http://localhost:8001/api"

def test_match_score_calculation():
    """Test match score calculation for different candidates"""
    print("🎯 Testing Match Score Calculation\n")
    print("=" * 50)
    
    # Test with candidate ID 1 (existing candidate)
    print("🔍 Testing with Candidate ID 1:")
    response = requests.get(f"{BASE_URL}/candidate-portal/browse-jobs/?candidate_id=1")
    
    if response.status_code == 200:
        data = response.json()
        for job in data['jobs']:
            print(f"   Job: {job['title']} at {job['company']}")
            print(f"   Match Score: {job['match_score']}%")
            print(f"   Match Level: {job['match_level']}")
            print(f"   Required Skills: {', '.join(job['extracted_skills'][:5])}...")
            print()
    else:
        print(f"❌ Failed: {response.status_code}")
    
    # Test without candidate ID (should return jobs without match scores)
    print("🔍 Testing without Candidate ID:")
    response = requests.get(f"{BASE_URL}/candidate-portal/browse-jobs/")
    
    if response.status_code == 200:
        data = response.json()
        for job in data['jobs']:
            print(f"   Job: {job['title']} at {job['company']}")
            print(f"   Match Score: {job.get('match_score', 'Not calculated')}")
            print(f"   Match Level: {job.get('match_level', 'Not calculated')}")
            print()
    else:
        print(f"❌ Failed: {response.status_code}")
    
    # Test with non-existent candidate ID
    print("🔍 Testing with Non-existent Candidate ID:")
    response = requests.get(f"{BASE_URL}/candidate-portal/browse-jobs/?candidate_id=999")
    
    if response.status_code == 200:
        data = response.json()
        for job in data['jobs']:
            print(f"   Job: {job['title']} at {job['company']}")
            print(f"   Match Score: {job.get('match_score', 'Not calculated')}")
            print(f"   Match Level: {job.get('match_level', 'Not calculated')}")
            print()
    else:
        print(f"❌ Failed: {response.status_code}")

def test_match_score_breakdown():
    """Test to understand match score calculation breakdown"""
    print("🔍 Testing Match Score Breakdown:")
    
    # Get candidate profile to understand the calculation
    response = requests.get(f"{BASE_URL}/candidate-portal/candidate-profile/?candidate_id=1")
    
    if response.status_code == 200:
        candidate = response.json()
        print(f"   Candidate: {candidate['first_name']} {candidate['last_name']}")
        print(f"   Experience: {candidate['total_experience_years']} years")
        print(f"   Skills: {', '.join(candidate['skills'])}")
        print(f"   Education: {candidate.get('highest_education', 'Not specified')}")
        print()
        
        # Get job details
        response = requests.get(f"{BASE_URL}/candidate-portal/browse-jobs/?candidate_id=1")
        if response.status_code == 200:
            data = response.json()
            for job in data['jobs']:
                print(f"   Job: {job['title']}")
                print(f"   Required Experience: {job['min_experience_years']} years")
                print(f"   Job Skills: {', '.join(job['extracted_skills'][:5])}...")
                print(f"   Experience Level: {job['experience_level']}")
                print(f"   Final Match Score: {job['match_score']}% ({job['match_level']})")
                print()
    else:
        print(f"❌ Failed to get candidate profile: {response.status_code}")

def main():
    """Run all tests"""
    test_match_score_calculation()
    print("=" * 50)
    test_match_score_breakdown()
    print("=" * 50)
    print("✅ Match Score Testing Complete!")

if __name__ == "__main__":
    main() 