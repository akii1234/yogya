#!/usr/bin/env python3
"""
Quick script to check candidate skills
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from resume_checker.models import Candidate

def check_candidate_skills():
    """Check skills for akhiltripathi.t1@gmail.com"""
    
    print("🔍 Checking Candidate Skills")
    print("=" * 40)
    
    try:
        candidate = Candidate.objects.get(email='akhiltripathi.t1@gmail.com')
        print(f"✅ Found candidate: {candidate.full_name}")
        print(f"   Email: {candidate.email}")
        print(f"   Skills: {candidate.skills}")
        print(f"   Skills Count: {len(candidate.skills) if candidate.skills else 0}")
        print(f"   Skills Type: {type(candidate.skills)}")
        
        if candidate.skills:
            print(f"   First 5 Skills: {candidate.skills[:5]}")
            print(f"   Last 5 Skills: {candidate.skills[-5:]}")
        else:
            print("   ⚠️ No skills found!")
            
    except Candidate.DoesNotExist:
        print("❌ Candidate not found!")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_candidate_skills()
