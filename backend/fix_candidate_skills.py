#!/usr/bin/env python3
"""
Quick script to fix candidate skills for testing
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from resume_checker.models import Candidate

def fix_candidate_skills():
    """Add skills to the candidate for testing"""
    
    print("🔧 Fixing Candidate Skills")
    print("=" * 40)
    
    try:
        # Find the candidate
        candidate = Candidate.objects.get(user__email='akhiltripathi.t1@gmail.com')
        print(f"✅ Found candidate: {candidate.full_name}")
        
        # Add comprehensive skills
        skills = [
            "Python", "Django", "React", "JavaScript", "TypeScript", 
            "PostgreSQL", "MySQL", "MongoDB", "REST APIs", "GraphQL",
            "Git", "GitHub", "AWS", "Docker", "Kubernetes", "Jenkins",
            "CI/CD", "Agile", "Scrum", "Microservices", "System Design",
            "Machine Learning", "Data Science", "SQL", "NoSQL", "Redis",
            "Elasticsearch", "Terraform", "Ansible", "Linux", "Shell Scripting"
        ]
        
        # Update candidate skills
        candidate.skills = skills
        candidate.save()
        
        print(f"✅ Added {len(skills)} skills to candidate")
        print(f"   Skills: {skills}")
        print()
        
        # Verify the update
        candidate.refresh_from_db()
        print("📊 Updated Candidate State:")
        print(f"   Skills Count: {len(candidate.skills)}")
        print(f"   First 10 Skills: {candidate.skills[:10]}")
        print()
        
        print("🎉 Skills fixed! The candidate should now show proper skill analysis.")
        
    except Candidate.DoesNotExist:
        print("❌ Candidate not found!")
        print("   Make sure the candidate exists with email: akhiltripathi.t1@gmail.com")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    fix_candidate_skills()
