#!/usr/bin/env python3
"""
Fix missing extracted skills for all jobs
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from resume_checker.models import JobDescription
from resume_checker.nlp_utils import extract_skills_from_text, preprocess_text

def fix_job_skills():
    """Fix missing extracted skills for all jobs"""
    
    print("🔧 Fixing Missing Job Skills")
    print("=" * 50)
    
    # Get all jobs
    jobs = JobDescription.objects.all()
    print(f"📊 Found {jobs.count()} jobs to process")
    print()
    
    fixed_count = 0
    
    for job in jobs:
        print(f"🔍 Processing: {job.title} at {job.company}")
        
        # Check if skills are missing
        if not job.extracted_skills:
            print(f"   ⚠️ No skills found, extracting...")
            
            # Combine description and requirements
            combined_text = f"{job.description} {job.requirements or ''}"
            print(f"   📄 Combined text length: {len(combined_text)} chars")
            
            # Preprocess text
            processed_text = preprocess_text(combined_text)
            job.processed_text = processed_text
            print(f"   🔄 Processed text length: {len(processed_text)} chars")
            
            # Extract skills
            extracted_skills = extract_skills_from_text(combined_text)
            job.extracted_skills = extracted_skills
            print(f"   ✅ Extracted {len(extracted_skills)} skills: {extracted_skills}")
            
            # Save the job
            job.save()
            fixed_count += 1
            
        else:
            print(f"   ✅ Skills already present: {len(job.extracted_skills)} skills")
        
        print()
    
    print("=" * 50)
    print(f"🎉 Fixed {fixed_count} jobs with missing skills")
    print("✅ All jobs now have extracted skills!")

if __name__ == "__main__":
    fix_job_skills()
