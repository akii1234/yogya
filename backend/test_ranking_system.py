#!/usr/bin/env python
"""
Test script for the Candidate Ranking System.
This script creates sample data and tests the ranking functionality.
"""

import os
import sys
import django
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from candidate_ranking.services import CandidateRankingService
from candidate_ranking.models import RankingCriteria
from resume_checker.models import JobDescription, Candidate
from user_management.models import User


def create_sample_data():
    """Create sample job and candidates for testing"""
    print("🔧 Creating sample data...")
    
    # Create a sample job
    job, created = JobDescription.objects.get_or_create(
        job_id="JOB-TEST01",
        defaults={
            'title': 'Senior Python Developer',
            'company': 'TechCorp Inc.',
            'department': 'Engineering',
            'location': 'San Francisco, CA',
            'description': '''
            We are looking for a Senior Python Developer to join our team.
            Requirements:
            - Python programming
            - Django framework
            - SQL databases
            - REST APIs
            - Git version control
            - Agile methodologies
            ''',
            'requirements': '''
            - 5+ years of Python development experience
            - Experience with Django, Flask, or similar frameworks
            - Knowledge of SQL and database design
            - Experience with RESTful APIs
            - Familiarity with Git and version control
            - Bachelor's degree in Computer Science or related field
            ''',
            'experience_level': 'senior',
            'min_experience_years': 5,
            'employment_type': 'full_time',
            'status': 'active',
            'extracted_skills': ['python', 'django', 'sql', 'rest apis', 'git', 'agile']
        }
    )
    
    if created:
        print(f"✅ Created job: {job.title}")
    else:
        print(f"📋 Using existing job: {job.title}")
    
    # Create sample candidates
    candidates_data = [
        {
            'candidate_id': 'CAN-TEST01',
            'first_name': 'Alice',
            'last_name': 'Johnson',
            'email': 'alice.johnson@email.com',
            'city': 'San Francisco',
            'state': 'CA',
            'country': 'USA',
            'current_title': 'Senior Python Developer',
            'current_company': 'TechStart Inc.',
            'total_experience_years': 7,
            'highest_education': 'master',
            'degree_field': 'Computer Science',
            'skills': ['python', 'django', 'sql', 'rest apis', 'git', 'agile', 'aws', 'docker']
        },
        {
            'candidate_id': 'CAN-TEST02',
            'first_name': 'Bob',
            'last_name': 'Smith',
            'email': 'bob.smith@email.com',
            'city': 'Oakland',
            'state': 'CA',
            'country': 'USA',
            'current_title': 'Python Developer',
            'current_company': 'CodeCorp',
            'total_experience_years': 4,
            'highest_education': 'bachelor',
            'degree_field': 'Software Engineering',
            'skills': ['python', 'flask', 'sql', 'git', 'javascript']
        },
        {
            'candidate_id': 'CAN-TEST03',
            'first_name': 'Carol',
            'last_name': 'Davis',
            'email': 'carol.davis@email.com',
            'city': 'Seattle',
            'state': 'WA',
            'country': 'USA',
            'current_title': 'Full Stack Developer',
            'current_company': 'WebTech',
            'total_experience_years': 6,
            'highest_education': 'bachelor',
            'degree_field': 'Computer Science',
            'skills': ['python', 'django', 'javascript', 'react', 'sql', 'git', 'agile']
        },
        {
            'candidate_id': 'CAN-TEST04',
            'first_name': 'David',
            'last_name': 'Wilson',
            'email': 'david.wilson@email.com',
            'city': 'Austin',
            'state': 'TX',
            'country': 'USA',
            'current_title': 'Junior Developer',
            'current_company': 'StartupXYZ',
            'total_experience_years': 2,
            'highest_education': 'bachelor',
            'degree_field': 'Information Technology',
            'skills': ['python', 'git', 'html', 'css']
        }
    ]
    
    candidates = []
    for data in candidates_data:
        candidate, created = Candidate.objects.get_or_create(
            candidate_id=data['candidate_id'],
            defaults=data
        )
        candidates.append(candidate)
        if created:
            print(f"✅ Created candidate: {candidate.full_name}")
        else:
            print(f"👤 Using existing candidate: {candidate.full_name}")
    
    return job, candidates


def test_ranking_system():
    """Test the ranking system with sample data"""
    print("\n🚀 Testing Candidate Ranking System...")
    
    # Create sample data
    job, candidates = create_sample_data()
    
    # Initialize ranking service
    ranking_service = CandidateRankingService()
    
    print(f"\n📊 Ranking {len(candidates)} candidates for job: {job.title}")
    
    # Perform ranking
    try:
        batch = ranking_service.rank_candidates_for_job(
            job_description=job,
            candidates=candidates,
            created_by=None  # No user for testing
        )
        
        print(f"✅ Ranking completed successfully!")
        print(f"📈 Batch ID: {batch.batch_id}")
        print(f"📊 Total candidates: {batch.total_candidates}")
        print(f"✅ Ranked candidates: {batch.ranked_candidates}")
        print(f"❌ Failed rankings: {batch.failed_rankings}")
        print(f"⏱️ Processing time: {batch.processing_time_seconds} seconds")
        
        # Get top candidates
        top_candidates = ranking_service.get_top_candidates(job, limit=10)
        
        print(f"\n🏆 Top {len(top_candidates)} Candidates:")
        print("-" * 80)
        for i, ranking in enumerate(top_candidates, 1):
            print(f"{i:2d}. {ranking.candidate.full_name}")
            print(f"    📧 Email: {ranking.candidate.email}")
            print(f"    🏆 Rank: #{ranking.rank_position}")
            print(f"    📊 Overall Score: {ranking.overall_score}%")
            print(f"    💼 Experience: {ranking.experience_years} years")
            print(f"    🎯 Experience Gap: {ranking.experience_gap} years ({ranking.experience_status})")
            print(f"    ✅ Matched Skills: {', '.join(ranking.matched_skills[:5])}")
            if ranking.missing_skills:
                print(f"    ❌ Missing Skills: {', '.join(ranking.missing_skills[:3])}")
            print(f"    📍 Location: {ranking.candidate.city}, {ranking.candidate.state}")
            print()
        
        # Test analytics
        print("📈 Ranking Analytics:")
        print("-" * 40)
        if top_candidates:
            high_matches = sum(1 for r in top_candidates if r.is_high_match)
            medium_matches = sum(1 for r in top_candidates if r.is_medium_match)
            low_matches = sum(1 for r in top_candidates if r.is_low_match)
            
            print(f"High matches (≥80%): {high_matches}")
            print(f"Medium matches (60-79%): {medium_matches}")
            print(f"Low matches (<60%): {low_matches}")
            
            avg_score = sum(r.overall_score for r in top_candidates) / len(top_candidates)
            print(f"Average score: {avg_score:.2f}%")
        else:
            print("No candidates were successfully ranked.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during ranking: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_ranking_criteria():
    """Test ranking criteria functionality"""
    print("\n⚙️ Testing Ranking Criteria...")
    
    # Check if default criteria exists
    try:
        default_criteria = RankingCriteria.objects.get(is_default=True)
        print(f"✅ Default criteria found: {default_criteria.name}")
        print(f"   Skill weight: {default_criteria.skill_weight}%")
        print(f"   Experience weight: {default_criteria.experience_weight}%")
        print(f"   Education weight: {default_criteria.education_weight}%")
        print(f"   Location weight: {default_criteria.location_weight}%")
        print(f"   Total weight: {default_criteria.total_weight}%")
    except RankingCriteria.DoesNotExist:
        print("❌ No default criteria found")
        return False
    
    return True


if __name__ == "__main__":
    print("🎯 Candidate Ranking System Test")
    print("=" * 50)
    
    # Test ranking criteria
    criteria_ok = test_ranking_criteria()
    
    if criteria_ok:
        # Test ranking system
        ranking_ok = test_ranking_system()
        
        if ranking_ok:
            print("\n🎉 All tests passed! The ranking system is working correctly.")
        else:
            print("\n❌ Ranking system test failed.")
            sys.exit(1)
    else:
        print("\n❌ Ranking criteria test failed.")
        sys.exit(1) 