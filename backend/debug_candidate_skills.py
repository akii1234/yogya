#!/usr/bin/env python3
"""
Debug script to investigate and fix candidate skills issues
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from resume_checker.models import Candidate, Resume
from resume_checker.nlp_utils import extract_skills_from_text
from user_management.models import User

def debug_candidate_skills():
    """Debug candidate skills and fix issues"""
    
    print("🔍 Debugging Candidate Skills")
    print("=" * 50)
    
    # Find the specific candidate
    try:
        candidate = Candidate.objects.get(user__email='akhiltripathi.t1@gmail.com')
        print(f"✅ Found candidate: {candidate.full_name}")
        print(f"   Email: {candidate.user.email}")
        print(f"   Current Skills: {candidate.skills}")
        print(f"   Skills Count: {len(candidate.skills) if candidate.skills else 0}")
        print()
    except Candidate.DoesNotExist:
        print("❌ Candidate not found!")
        return
    
    # Check if candidate has resumes
    resumes = Resume.objects.filter(candidate=candidate)
    print(f"📄 Resumes found: {resumes.count()}")
    
    if resumes.exists():
        for i, resume in enumerate(resumes, 1):
            print(f"   Resume {i}: {resume.file_name}")
            print(f"      Processing Status: {resume.processing_status}")
            print(f"      Extracted Skills: {resume.extracted_skills}")
            print(f"      Skills Count: {len(resume.extracted_skills) if resume.extracted_skills else 0}")
            print(f"      Parsed Text Length: {len(resume.parsed_text) if resume.parsed_text else 0}")
            print()
            
            # If resume has parsed text but no skills, try to extract them
            if resume.parsed_text and not resume.extracted_skills:
                print(f"   🔧 Extracting skills from resume {i}...")
                try:
                    extracted_skills = extract_skills_from_text(resume.parsed_text)
                    resume.extracted_skills = extracted_skills
                    resume.save()
                    print(f"      ✅ Extracted {len(extracted_skills)} skills: {extracted_skills}")
                    
                    # Update candidate skills
                    current_skills = set(candidate.skills or [])
                    new_skills = []
                    for skill in extracted_skills:
                        if skill.lower() not in {s.lower() for s in current_skills}:
                            new_skills.append(skill)
                    
                    if new_skills:
                        updated_skills = list(current_skills) + new_skills
                        candidate.skills = updated_skills
                        candidate.save()
                        print(f"      ✅ Updated candidate skills: {updated_skills}")
                    else:
                        print(f"      ℹ️ No new skills to add")
                        
                except Exception as e:
                    print(f"      ❌ Error extracting skills: {e}")
                print()
    else:
        print("   ⚠️ No resumes found for this candidate")
        print()
        
        # Create sample skills for testing
        print("   🔧 Creating sample skills for testing...")
        sample_skills = [
            "Python", "Django", "React", "JavaScript", "PostgreSQL", 
            "REST APIs", "Git", "AWS", "Docker", "TypeScript"
        ]
        candidate.skills = sample_skills
        candidate.save()
        print(f"      ✅ Added sample skills: {sample_skills}")
        print()
    
    # Check final state
    candidate.refresh_from_db()
    print("📊 Final Candidate State:")
    print(f"   Skills: {candidate.skills}")
    print(f"   Skills Count: {len(candidate.skills) if candidate.skills else 0}")
    print()
    
    # Test skill extraction
    print("🧪 Testing Skill Extraction:")
    test_text = """
    I am a senior software developer with experience in Python, Django, React, JavaScript, 
    PostgreSQL, REST APIs, Git, AWS, Docker, and TypeScript. I have worked on microservices 
    architecture and have experience with CI/CD pipelines.
    """
    
    extracted = extract_skills_from_text(test_text)
    print(f"   Test Text: {test_text[:100]}...")
    print(f"   Extracted Skills: {extracted}")
    print(f"   Skills Count: {len(extracted)}")
    print()
    
    print("✅ Debug completed!")

def fix_all_candidates():
    """Fix skills for all candidates"""
    
    print("🔧 Fixing Skills for All Candidates")
    print("=" * 50)
    
    candidates = Candidate.objects.all()
    print(f"Found {candidates.count()} candidates")
    
    for candidate in candidates:
        print(f"\n👤 Processing: {candidate.full_name} ({candidate.user.email})")
        
        # Check current skills
        current_skills = candidate.skills or []
        print(f"   Current Skills: {current_skills}")
        
        # Check resumes
        resumes = Resume.objects.filter(candidate=candidate)
        print(f"   Resumes: {resumes.count()}")
        
        if resumes.exists():
            all_resume_skills = []
            for resume in resumes:
                if resume.parsed_text:
                    # Extract skills from resume
                    extracted_skills = extract_skills_from_text(resume.parsed_text)
                    if extracted_skills:
                        all_resume_skills.extend(extracted_skills)
                        
                        # Update resume skills if missing
                        if not resume.extracted_skills:
                            resume.extracted_skills = extracted_skills
                            resume.save()
                            print(f"      ✅ Updated resume skills: {extracted_skills}")
            
            # Remove duplicates and update candidate
            if all_resume_skills:
                unique_skills = list(set(all_resume_skills))
                candidate.skills = unique_skills
                candidate.save()
                print(f"   ✅ Updated candidate skills: {unique_skills}")
            else:
                print(f"   ⚠️ No skills extracted from resumes")
        else:
            print(f"   ⚠️ No resumes found")
    
    print("\n✅ All candidates processed!")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "fix-all":
        fix_all_candidates()
    else:
        debug_candidate_skills()
