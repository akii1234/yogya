#!/usr/bin/env python3
"""
Script to check candidate rankings in the database
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from resume_checker.models import Candidate, JobDescription, Application
from candidate_ranking.models import CandidateRanking, RankingBatch

def check_candidate_rankings():
    """Check the status of candidate rankings"""
    
    print("🔍 Checking Candidate Rankings")
    print("=" * 50)
    
    # 1. Check candidates
    candidates = Candidate.objects.all()
    print(f"📋 Total candidates: {candidates.count()}")
    for candidate in candidates:
        print(f"   - {candidate.full_name} ({candidate.email}) - ID: {candidate.candidate_id}")
    
    # 2. Check job descriptions
    jobs = JobDescription.objects.all()
    print(f"\n💼 Total jobs: {jobs.count()}")
    for job in jobs:
        print(f"   - {job.title} at {job.company} - ID: {job.job_id}")
    
    # 3. Check applications
    applications = Application.objects.all()
    print(f"\n📝 Total applications: {applications.count()}")
    for app in applications:
        print(f"   - {app.candidate.full_name} applied to {app.job_description.title}")
    
    # 4. Check candidate rankings
    rankings = CandidateRanking.objects.all()
    print(f"\n🏆 Total candidate rankings: {rankings.count()}")
    
    if rankings.exists():
        for ranking in rankings:
            print(f"   - {ranking.candidate.full_name} ranked #{ranking.rank_position} for {ranking.job_description.title}")
            print(f"     Score: {ranking.overall_score}% | Status: {ranking.status}")
    else:
        print("   ❌ No candidate rankings found!")
        print("   This is why the candidate ranking page is empty.")
    
    # 5. Check ranking batches
    batches = RankingBatch.objects.all()
    print(f"\n📦 Ranking batches: {batches.count()}")
    for batch in batches:
        print(f"   - Batch {batch.batch_id}: {batch.job_description.title} ({batch.status})")
    
    # 6. Check if rankings need to be generated
    print(f"\n🎯 Analysis:")
    if rankings.count() == 0:
        print("   ❌ No rankings exist - they need to be generated")
        if applications.count() > 0:
            print("   ✅ Applications exist - rankings can be generated")
            print("   💡 Solution: Use the ranking API to generate rankings")
        else:
            print("   ❌ No applications exist - need applications first")
    else:
        print("   ✅ Rankings exist - check if they're being displayed correctly")
    
    print("\n" + "=" * 50)
    print("🎯 Next Steps:")
    if rankings.count() == 0:
        print("1. Generate candidate rankings using the ranking API")
        print("2. Check if the frontend is calling the correct API endpoint")
        print("3. Verify the ranking data is being displayed properly")
    else:
        print("1. Check if the frontend is calling the correct API endpoint")
        print("2. Verify the ranking data is being displayed properly")
        print("3. Check for any JavaScript errors in the browser console")

if __name__ == "__main__":
    check_candidate_rankings()
