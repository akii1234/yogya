#!/usr/bin/env python3
"""
Script to generate missing candidate rankings for all existing applications
This restores the automatic ranking feature that was working before
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from resume_checker.models import Candidate, JobDescription, Application
from candidate_ranking.models import CandidateRanking, RankingBatch
from candidate_ranking.services import CandidateRankingService
from django.db import transaction

def generate_missing_rankings():
    """Generate rankings for all jobs that have applications but no rankings"""
    
    print("🚀 Generating Missing Candidate Rankings")
    print("=" * 50)
    
    # Get all jobs that have applications
    jobs_with_applications = JobDescription.objects.filter(
        applications__isnull=False
    ).distinct()
    
    print(f"📋 Found {jobs_with_applications.count()} jobs with applications")
    
    total_rankings_generated = 0
    
    for job in jobs_with_applications:
        print(f"\n💼 Processing job: {job.title} at {job.company}")
        
        # Get all candidates who applied to this job
        applications = Application.objects.filter(job_description=job)
        candidates = [app.candidate for app in applications]
        
        print(f"   📝 Found {len(candidates)} applications")
        
        # Check if rankings already exist for this job
        existing_rankings = CandidateRanking.objects.filter(job_description=job)
        
        if existing_rankings.exists():
            print(f"   ✅ Rankings already exist ({existing_rankings.count()} rankings)")
            continue
        
        # Generate rankings for this job
        try:
            ranking_service = CandidateRankingService()
            
            with transaction.atomic():
                # Generate rankings
                batch = ranking_service.rank_candidates_for_job(
                    job_description=job,
                    candidates=candidates,
                    created_by=None  # System generated
                )
                
                print(f"   🎯 Generated {batch.ranked_candidates} rankings")
                print(f"   📊 Batch ID: {batch.batch_id}")
                
                # Get the generated rankings
                rankings = CandidateRanking.objects.filter(job_description=job)
                
                for ranking in rankings:
                    print(f"      - {ranking.candidate.full_name}: {ranking.overall_score}% (Rank #{ranking.rank_position})")
                
                total_rankings_generated += batch.ranked_candidates
                
        except Exception as e:
            print(f"   ❌ Error generating rankings for {job.title}: {e}")
            continue
    
    print(f"\n" + "=" * 50)
    print(f"🎉 SUMMARY")
    print(f"📊 Total rankings generated: {total_rankings_generated}")
    print(f"✅ All missing rankings have been generated!")
    print(f"\n💡 Now you can:")
    print(f"   1. Go to HR Portal → Candidate Rankings")
    print(f"   2. Select any job from the dropdown")
    print(f"   3. Click 'Refresh Rankings'")
    print(f"   4. See the ranked candidates!")
    
    return total_rankings_generated

def verify_rankings():
    """Verify that rankings were generated correctly"""
    
    print(f"\n🔍 Verifying Rankings")
    print("-" * 30)
    
    # Check total rankings
    total_rankings = CandidateRanking.objects.count()
    print(f"📊 Total rankings in database: {total_rankings}")
    
    # Check rankings by job
    jobs_with_rankings = JobDescription.objects.filter(
        candidate_rankings__isnull=False
    ).distinct()
    
    print(f"💼 Jobs with rankings: {jobs_with_rankings.count()}")
    
    for job in jobs_with_rankings:
        rankings = CandidateRanking.objects.filter(job_description=job)
        print(f"   - {job.title}: {rankings.count()} rankings")
        
        # Show top 3 candidates
        top_rankings = rankings.order_by('rank_position')[:3]
        for ranking in top_rankings:
            print(f"     #{ranking.rank_position}: {ranking.candidate.full_name} ({ranking.overall_score}%)")

if __name__ == "__main__":
    print("🎯 Candidate Ranking Generation Script")
    print("This will generate rankings for all existing applications")
    print("=" * 60)
    
    # Generate rankings
    generated_count = generate_missing_rankings()
    
    # Verify results
    verify_rankings()
    
    print(f"\n✅ Script completed successfully!")
    print(f"🎉 Your candidate ranking feature is now restored!")
