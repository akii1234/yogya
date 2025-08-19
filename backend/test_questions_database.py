#!/usr/bin/env python3
"""
Test script to check the questions database
"""

import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from resume_checker.models import Candidate, JobDescription
from resume_checker.enhanced_coding_questions import enhanced_coding_questions_manager

def test_questions_database():
    """Test the questions database"""
    
    print("🔍 Testing Questions Database")
    print("=" * 50)
    
    # 1. Check if questions database is loaded
    print(f"✅ Questions DB loaded: {enhanced_coding_questions_manager.questions_db is not None}")
    
    if enhanced_coding_questions_manager.questions_db:
        metadata = enhanced_coding_questions_manager.questions_db.get('metadata', {})
        print(f"📊 Metadata: {metadata}")
        
        questions = enhanced_coding_questions_manager.questions_db.get('questions', {})
        print(f"📚 Questions sections: {list(questions.keys())}")
        
        # Count total questions
        total_questions = 0
        for tech, levels in questions.items():
            for level, question_list in levels.items():
                total_questions += len(question_list)
                print(f"   {tech} - {level}: {len(question_list)} questions")
        
        print(f"🎯 Total questions in database: {total_questions}")
    
    # 2. Test question generation
    print(f"\n🧪 Testing Question Generation...")
    
    # Get candidate
    try:
        candidate = Candidate.objects.get(email='akhiltripathi.t1@gmail.com')
        print(f"✅ Found candidate: {candidate.full_name}")
        print(f"   Skills: {candidate.skills}")
    except Candidate.DoesNotExist:
        print("❌ Candidate not found!")
        return
    
    # Get a job
    try:
        job = JobDescription.objects.first()
        if job:
            print(f"✅ Found job: {job.title} at {job.company}")
            print(f"   Job skills: {job.extracted_skills}")
        else:
            print("❌ No jobs found!")
            return
    except Exception as e:
        print(f"❌ Error finding job: {e}")
        return
    
    # Test question generation
    try:
        candidate_skills = candidate.skills or []
        candidate_experience = candidate.total_experience_years or 0
        job_skills = job.extracted_skills or []
        job_description = f"{job.description} {job.requirements or ''}"
        
        print(f"\n🔧 Generating questions with:")
        print(f"   Candidate skills: {candidate_skills}")
        print(f"   Candidate experience: {candidate_experience}")
        print(f"   Job skills: {job_skills}")
        print(f"   Job description length: {len(job_description)}")
        
        # Generate questions
        result = enhanced_coding_questions_manager.generate_personalized_questions(
            candidate_skills, candidate_experience, job_skills, job_description
        )
        
        print(f"\n✅ Generated result:")
        print(f"   Total questions: {result.get('total_questions', 0)}")
        print(f"   Questions: {len(result.get('questions', []))}")
        print(f"   Technologies: {result.get('technologies', [])}")
        print(f"   Experience level: {result.get('experience_level', 'unknown')}")
        
        # Show first few questions
        questions = result.get('questions', [])
        for i, q in enumerate(questions[:3], 1):
            print(f"   {i}. {q.get('title', 'No title')} ({q.get('difficulty', 'unknown')})")
        
        if len(questions) > 3:
            print(f"   ... and {len(questions) - 3} more questions")
            
    except Exception as e:
        print(f"❌ Error generating questions: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_questions_database()
