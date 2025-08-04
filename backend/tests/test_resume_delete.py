#!/usr/bin/env python3
"""
Test script for resume delete functionality
"""

import requests
import json

BASE_URL = "http://localhost:8001/api"

def test_delete_resume():
    """Test deleting a resume"""
    print("🧪 Testing Resume Delete Functionality")
    print("=" * 50)
    
    # Test data
    candidate_id = 1
    resume_id = 1  # Assuming resume with ID 1 exists
    
    # First, let's see what resumes the candidate has
    print(f"📋 Getting resumes for candidate {candidate_id}...")
    try:
        response = requests.get(f"{BASE_URL}/candidate-portal/my-resumes/?candidate_id={candidate_id}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Found {data.get('total_count', 0)} resumes")
            for resume in data.get('resumes', []):
                print(f"   - ID: {resume['id']}, Name: {resume['file_name']}, Uploaded: {resume['uploaded_at']}")
        else:
            print(f"❌ Failed to get resumes: {response.status_code}")
            print(f"Response: {response.text}")
            return
    except Exception as e:
        print(f"❌ Error getting resumes: {e}")
        return
    
    # Now test deleting a resume
    print(f"\n🗑️  Testing delete resume {resume_id}...")
    try:
        delete_data = {
            'resume_id': resume_id,
            'candidate_id': candidate_id
        }
        
        response = requests.delete(f"{BASE_URL}/candidate-portal/delete-resume/", json=delete_data)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Resume deleted successfully!")
            print(f"   Deleted: {data.get('deleted_resume', {}).get('file_name', 'Unknown')}")
            print(f"   Message: {data.get('message', '')}")
        else:
            print(f"❌ Failed to delete resume: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error deleting resume: {e}")
    
    # Verify the resume was deleted
    print(f"\n🔍 Verifying resume was deleted...")
    try:
        response = requests.get(f"{BASE_URL}/candidate-portal/my-resumes/?candidate_id={candidate_id}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ After deletion: {data.get('total_count', 0)} resumes remaining")
            for resume in data.get('resumes', []):
                print(f"   - ID: {resume['id']}, Name: {resume['file_name']}, Uploaded: {resume['uploaded_at']}")
        else:
            print(f"❌ Failed to verify deletion: {response.status_code}")
    except Exception as e:
        print(f"❌ Error verifying deletion: {e}")

if __name__ == "__main__":
    test_delete_resume() 