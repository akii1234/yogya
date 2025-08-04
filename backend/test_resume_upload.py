#!/usr/bin/env python3
"""
Test script for Resume Upload Functionality
"""

import requests
import json
import os

BASE_URL = "http://localhost:8001/api"

def test_resume_upload():
    """Test resume upload functionality"""
    print("📄 Testing Resume Upload Functionality\n")
    print("=" * 50)
    
    # Test getting resumes for candidate
    print("🔍 Testing Get Resumes API:")
    response = requests.get(f"{BASE_URL}/candidate-portal/my-resumes/?candidate_id=1")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Found {data['total_count']} resumes")
        for resume in data['resumes']:
            print(f"   - {resume['file_name']} ({resume['file_type']})")
            print(f"     Uploaded: {resume['uploaded_at']}")
            print(f"     Skills extracted: {len(resume['extracted_skills'])}")
    else:
        print(f"❌ Failed: {response.status_code}")
    
    print("\n" + "=" * 50)
    print("📝 Resume Upload Test Instructions:")
    print("1. Go to the Candidate Portal in the frontend")
    print("2. Navigate to 'My Profile' tab")
    print("3. Scroll down to 'Resume/CV Management' section")
    print("4. Click 'Choose File' and select a resume (PDF, DOCX, DOC, TXT)")
    print("5. Click 'Upload Resume'")
    print("6. Check that skills are automatically extracted and added to profile")
    print("7. Verify that match scores improve for relevant jobs")
    
    print("\n" + "=" * 50)
    print("🎯 Expected Benefits:")
    print("✅ Automatic skill extraction from resume")
    print("✅ Skills added to candidate profile")
    print("✅ Improved match scores for jobs")
    print("✅ Better job recommendations")
    print("✅ Professional resume management")

def test_resume_upload_api():
    """Test the resume upload API directly"""
    print("\n🔍 Testing Resume Upload API:")
    
    # Create a simple test file
    test_content = """
    JOHN DOE
    Senior React Developer
    
    EXPERIENCE:
    - 5 years of React development
    - JavaScript, TypeScript, Node.js
    - Python, Django, PostgreSQL
    - AWS, Git, REST APIs
    
    EDUCATION:
    - Bachelor's in Computer Science
    
    SKILLS:
    - React, JavaScript, TypeScript
    - Node.js, Python, Django
    - PostgreSQL, AWS, Git
    """
    
    # Create test file
    test_file_path = "test_resume.txt"
    with open(test_file_path, "w") as f:
        f.write(test_content)
    
    try:
        # Test upload
        with open(test_file_path, "rb") as f:
            files = {'resume_file': f}
            data = {'candidate_id': 1}
            
            response = requests.post(
                f"{BASE_URL}/candidate-portal/upload-resume/",
                files=files,
                data=data
            )
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Resume uploaded successfully!")
            print(f"   File: {result['resume']['file_name']}")
            print(f"   Skills extracted: {result['resume']['extracted_skills']}")
            print(f"   Skills added to profile: {result['skills_added_to_profile']}")
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"   Response: {response.text}")
    
    except Exception as e:
        print(f"❌ Error during upload test: {e}")
    
    finally:
        # Clean up test file
        if os.path.exists(test_file_path):
            os.remove(test_file_path)

def main():
    """Run all tests"""
    test_resume_upload()
    test_resume_upload_api()
    print("\n" + "=" * 50)
    print("✅ Resume Upload Testing Complete!")

if __name__ == "__main__":
    main() 