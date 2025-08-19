#!/usr/bin/env python
"""
Debug script to analyze candidate matching for akhiltripathi.t1@gmail.com
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from resume_checker.models import Candidate, JobDescription
from candidate_ranking.models import CandidateRanking
from candidate_ranking.services import CandidateRankingService

def debug_candidate_matching():
    """Debug the matching for akhiltripathi.t1@gmail.com"""
    
    print("🔍 Debugging Candidate Matching for akhiltripathi.t1@gmail.com")
    print("=" * 60)
    
    # Find the candidate
    try:
        candidate = Candidate.objects.get(user__email='akhiltripathi.t1@gmail.com')
        print(f"✅ Found candidate: {candidate.name}")
        print(f"   Email: {candidate.user.email}")
        print(f"   Skills: {candidate.skills}")
        print(f"   Experience: {candidate.total_experience_years} years")
        print(f"   Education: {candidate.highest_education}")
        print(f"   Location: {candidate.city}, {candidate.state}")
        print()
    except Candidate.DoesNotExist:
        print("❌ Candidate not found!")
        return
    
    # Get all jobs
    jobs = JobDescription.objects.all()
    print(f"📋 Found {jobs.count()} jobs")
    print()
    
    # Analyze each job
    ranking_service = CandidateRankingService()
    
    for job in jobs:
        print(f"🎯 Job: {job.title} at {job.company}")
        print(f"   Required Experience: {job.min_experience_years} years")
        print(f"   Location: {job.location}")
        print(f"   Skills: {job.extracted_skills}")
        
        # Calculate scores manually
        skill_score = ranking_service._calculate_skill_score(job, candidate)
        experience_score = ranking_service._calculate_experience_score(job, candidate)
        education_score = ranking_service._calculate_education_score(job, candidate)
        location_score = ranking_service._calculate_location_score(job, candidate)
        
        # Get criteria weights
        criteria = ranking_service.criteria
        overall_score = (
            (skill_score['score'] * float(criteria.skill_weight) / 100) +
            (experience_score * float(criteria.experience_weight) / 100) +
            (education_score * float(criteria.education_weight) / 100) +
            (location_score * float(criteria.location_weight) / 100)
        )
        
        print(f"   📊 Scores:")
        print(f"      Skills: {skill_score['score']}% (weight: {criteria.skill_weight}%)")
        print(f"      Experience: {experience_score}% (weight: {criteria.experience_weight}%)")
        print(f"      Education: {education_score}% (weight: {criteria.education_weight}%)")
        print(f"      Location: {location_score}% (weight: {criteria.location_weight}%)")
        print(f"      Overall: {overall_score:.2f}%")
        
        if skill_score['matched_skills']:
            print(f"      ✅ Matched Skills: {skill_score['matched_skills']}")
        if skill_score['missing_skills']:
            print(f"      ❌ Missing Skills: {skill_score['missing_skills']}")
        
        # Check if ranking exists
        try:
            ranking = CandidateRanking.objects.get(job_description=job, candidate=candidate)
            print(f"      📈 Database Ranking: {ranking.overall_score}%")
        except CandidateRanking.DoesNotExist:
            print(f"      📈 Database Ranking: Not found")
        
        print()
    
    # Show ranking criteria
    print("⚙️ Ranking Criteria:")
    print(f"   Skill Weight: {criteria.skill_weight}%")
    print(f"   Experience Weight: {criteria.experience_weight}%")
    print(f"   Education Weight: {criteria.education_weight}%")
    print(f"   Location Weight: {criteria.location_weight}%")
    print()

if __name__ == "__main__":
    debug_candidate_matching()
