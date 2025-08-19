#!/usr/bin/env python3
"""
Check uploaded jobs and their extracted skills
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from resume_checker.models import JobDescription

def check_uploaded_jobs():
    """Check all uploaded jobs and their extracted skills"""
    
    print("🔍 Checking Uploaded Jobs")
    print("=" * 50)
    
    # Get all jobs
    jobs = JobDescription.objects.all().order_by('-created_at')
    print(f"📊 Total jobs in database: {jobs.count()}")
    print()
    
    if jobs.count() == 0:
        print("❌ No jobs found in database!")
        return
    
    # Check each job
    for i, job in enumerate(jobs, 1):
        print(f"Job {i}: {job.title} at {job.company}")
        print(f"   ID: {job.id}")
        print(f"   Location: {job.location}")
        print(f"   Experience Required: {job.min_experience_years} years")
        print(f"   Experience Level: {job.experience_level}")
        print(f"   Created: {job.created_at}")
        print(f"   Updated: {job.updated_at}")
        print()
        
        print("📋 Skills Analysis:")
        print(f"   Extracted Skills: {job.extracted_skills}")
        print(f"   Skills Count: {len(job.extracted_skills) if job.extracted_skills else 0}")
        print()
        
        print("📄 Job Content:")
        print(f"   Description Length: {len(job.description) if job.description else 0} chars")
        print(f"   Requirements Length: {len(job.requirements) if job.requirements else 0} chars")
        print(f"   Processed Text Length: {len(job.processed_text) if job.processed_text else 0} chars")
        print()
        
        if job.description:
            print(f"   Description Preview: {job.description[:100]}...")
        if job.requirements:
            print(f"   Requirements Preview: {job.requirements[:100]}...")
        print()
        
        print("-" * 60)
        print()

if __name__ == "__main__":
    check_uploaded_jobs()
