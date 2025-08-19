#!/usr/bin/env python3
"""
Check job description skills for Backend Developer position
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from resume_checker.models import JobDescription, Application

def check_job_skills():
    """Check skills required for Backend Developer position"""
    
    print("🔍 Checking Job Description Skills")
    print("=" * 50)
    
    # Find all Backend Developer jobs at BigTech
    try:
        jobs = JobDescription.objects.filter(title='Backend Developer', company='BigTech')
        print(f"Found {jobs.count()} Backend Developer jobs at BigTech:")
        print()
        
        for i, job in enumerate(jobs, 1):
            print(f"Job {i}:")
            print(f"   ID: {job.id}")
            print(f"   Title: {job.title}")
            print(f"   Company: {job.company}")
            print(f"   Location: {job.location}")
            print(f"   Experience Required: {job.min_experience_years} years")
            print(f"   Experience Level: {job.experience_level}")
            print(f"   Extracted Skills: {job.extracted_skills}")
            print(f"   Skills Count: {len(job.extracted_skills) if job.extracted_skills else 0}")
            print()
            
            # Check if candidate has applied to this specific job
            try:
                application = Application.objects.filter(
                    job_description=job,
                    candidate__email='akhiltripathi.t1@gmail.com'
                ).first()
                if application:
                    print(f"   ✅ CANDIDATE APPLIED TO THIS JOB!")
                    print(f"   Applied Date: {application.applied_at}")
                    print(f"   Status: {application.status}")
                    print()
                    print("📄 Full Job Description:")
                    print(f"   Description: {job.description}")
                    print(f"   Requirements: {job.requirements if job.requirements else 'None'}")
                    print()
                    break
            except Exception as e:
                print(f"   Error checking application: {e}")
            print("-" * 50)
            print()
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_job_skills()
