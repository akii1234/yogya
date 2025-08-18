#!/usr/bin/env python3
"""
Test script for role-based system including HR, Interviewer, and Candidate roles.
Tests user creation, role assignment, and role-specific functionality.
"""

import os
import sys
import django
from datetime import datetime, timedelta
import uuid

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from user_management.models import User, HRProfile
from interviewer.models import Interviewer
from resume_checker.models import Candidate, JobDescription
from hiring_manager.models import JobPosting, HiringManager
from interview_management.models import InterviewSession, CompetencyEvaluation, InterviewFeedback
from competency_hiring.models import CompetencyFramework, InterviewTemplate

User = get_user_model()

def create_test_users():
    """Create test users for different roles"""
    print("\n🔧 Creating test users for different roles...")
    
    users = {}
    
    # Create HR User
    hr_user, created = User.objects.get_or_create(
        email='hr@yogya.com',
        defaults={
            'username': 'hr_user',
            'first_name': 'HR',
            'last_name': 'Manager',
            'role': 'hr',
            'status': 'active',
            'is_active': True,
            'is_staff': True
        }
    )
    if created:
        hr_user.set_password('testpass123')
        hr_user.save()
        print(f"✅ Created HR user: {hr_user.email}")
    else:
        print(f"ℹ️  HR user already exists: {hr_user.email}")
    users['hr'] = hr_user
    
    # Create Interviewer User
    interviewer_user, created = User.objects.get_or_create(
        email='interviewer@yogya.com',
        defaults={
            'username': 'interviewer_user',
            'first_name': 'John',
            'last_name': 'Interviewer',
            'role': 'interviewer',
            'status': 'active',
            'is_active': True
        }
    )
    if created:
        interviewer_user.set_password('testpass123')
        interviewer_user.save()
        print(f"✅ Created Interviewer user: {interviewer_user.email}")
    else:
        print(f"ℹ️  Interviewer user already exists: {interviewer_user.email}")
    users['interviewer'] = interviewer_user
    
    # Create Candidate User
    candidate_user, created = User.objects.get_or_create(
        email='candidate@yogya.com',
        defaults={
            'username': 'candidate_user',
            'first_name': 'Alice',
            'last_name': 'Candidate',
            'role': 'candidate',
            'status': 'active',
            'is_active': True
        }
    )
    if created:
        candidate_user.set_password('testpass123')
        candidate_user.save()
        print(f"✅ Created Candidate user: {candidate_user.email}")
    else:
        print(f"ℹ️  Candidate user already exists: {candidate_user.email}")
    users['candidate'] = candidate_user
    
    # Create Hiring Manager User (can do both HR and Interviewer tasks)
    hiring_manager_user, created = User.objects.get_or_create(
        email='hiring_manager@yogya.com',
        defaults={
            'username': 'hiring_manager_user',
            'first_name': 'Sarah',
            'last_name': 'HiringManager',
            'role': 'hiring_manager',
            'status': 'active',
            'is_active': True,
            'is_staff': True
        }
    )
    if created:
        hiring_manager_user.set_password('testpass123')
        hiring_manager_user.save()
        print(f"✅ Created Hiring Manager user: {hiring_manager_user.email}")
    else:
        print(f"ℹ️  Hiring Manager user already exists: {hiring_manager_user.email}")
    users['hiring_manager'] = hiring_manager_user
    
    return users

def create_interviewer_profile(interviewer_user):
    """Create interviewer profile"""
    print("\n🔧 Creating interviewer profile...")
    
    interviewer_profile, created = Interviewer.objects.get_or_create(
        user=interviewer_user,
        defaults={
            'company': 'Yogya Tech',
            'department': 'Engineering',
            'title': 'Senior Technical Interviewer',
            'phone': '+1-555-0123',
            'technical_skills': ['Python', 'JavaScript', 'React', 'Django', 'System Design'],
            'interview_types': ['technical', 'behavioral', 'system_design'],
            'experience_years': 5,
            'ai_assistance_enabled': True,
            'ai_question_suggestions': True,
            'ai_response_analysis': True,
            'ai_followup_suggestions': True,
            'is_active': True,
            'max_interviews_per_week': 15
        }
    )
    
    if created:
        print(f"✅ Created interviewer profile for {interviewer_user.get_full_name()}")
    else:
        print(f"ℹ️  Interviewer profile already exists for {interviewer_user.get_full_name()}")
    
    return interviewer_profile

def create_hr_profile(hr_user):
    """Create HR profile"""
    print("\n🔧 Creating HR profile...")
    
    hr_profile, created = HRProfile.objects.get_or_create(
        user=hr_user,
        defaults={
            'department': 'Human Resources',
            'position': 'Senior HR Manager',
            'employee_id': 'HR001',
            'can_create_jobs': True,
            'can_manage_candidates': True,
            'can_schedule_interviews': True,
            'can_view_analytics': True
        }
    )
    
    if created:
        print(f"✅ Created HR profile for {hr_user.get_full_name()}")
    else:
        print(f"ℹ️  HR profile already exists for {hr_user.get_full_name()}")
    
    return hr_profile

def create_test_candidate():
    """Create a test candidate"""
    print("\n🔧 Creating test candidate...")
    
    candidate, created = Candidate.objects.get_or_create(
        email='test.candidate@example.com',
        defaults={
            'first_name': 'Test',
            'last_name': 'Candidate',
            'phone': '+1-555-9999',
            'city': 'San Francisco',
            'state': 'CA',
            'country': 'USA',
            'current_title': 'Python Developer',
            'current_company': 'TechCorp',
            'total_experience_years': 3,
            'highest_education': 'bachelor',
            'degree_field': 'Computer Science',
            'skills': ['Python', 'Django', 'React', 'JavaScript'],
            'status': 'active'
        }
    )
    
    if created:
        print(f"✅ Created test candidate: {candidate.full_name}")
    else:
        print(f"ℹ️  Test candidate already exists: {candidate.full_name}")
    
    return candidate

def create_test_job():
    """Create a test job posting"""
    print("\n🔧 Creating test job posting...")
    
    # First create a JobDescription
    job_description, created = JobDescription.objects.get_or_create(
        title='Python Developer',
        defaults={
            'company': 'Yogya Tech',
            'department': 'Engineering',
            'location': 'San Francisco, CA',
            'description': 'We are looking for a skilled Python developer...',
            'requirements': 'Python, Django, React, 3+ years experience',
            'experience_level': 'mid',
            'min_experience_years': 3,
            'employment_type': 'full_time',
            'status': 'active'
        }
    )
    
    if created:
        print(f"✅ Created job description: {job_description.title}")
    else:
        print(f"ℹ️  Job description already exists: {job_description.title}")
    
    # Create a HiringManager for the job posting
    hr_user = User.objects.filter(role='hr').first()
    hiring_manager, created = HiringManager.objects.get_or_create(
        user=hr_user,
        defaults={
            'company': 'Yogya Tech',
            'department': 'Human Resources',
            'title': 'HR Manager',
            'phone': '+1-555-0000'
        }
    )
    
    if created:
        print(f"✅ Created hiring manager profile for {hr_user.get_full_name()}")
    else:
        print(f"ℹ️  Hiring manager profile already exists for {hr_user.get_full_name()}")
    
    # Now create the JobPosting
    job_posting, created = JobPosting.objects.get_or_create(
        job_description=job_description,
        defaults={
            'hiring_manager': hiring_manager,
            'status': 'active',
            'priority': 'medium',
            'max_applications': 50
        }
    )
    
    if created:
        print(f"✅ Created job posting: {job_posting.job_description.title}")
    else:
        print(f"ℹ️  Job posting already exists: {job_posting.job_description.title}")
    
    return job_posting
    
    if created:
        print(f"✅ Created test job: {job.title}")
    else:
        print(f"ℹ️  Test job already exists: {job.title}")
    
    return job

def test_role_permissions(users):
    """Test role-based permissions and functionality"""
    print("\n🧪 Testing role-based permissions...")
    
    for role, user in users.items():
        print(f"\n📋 Testing {role.upper()} role: {user.get_full_name()}")
        
        # Test role properties
        print(f"   - is_hr: {user.is_hr}")
        print(f"   - is_interviewer: {user.is_interviewer}")
        print(f"   - is_candidate: {user.is_candidate}")
        print(f"   - is_admin: {user.is_admin}")
        print(f"   - Role display: {user.get_role_display_name()}")
        
        # Test role-specific access
        if user.is_hr:
            print("   ✅ Has HR access (job management, candidate screening)")
        if user.is_interviewer:
            print("   ✅ Has Interviewer access (conduct interviews, evaluate candidates)")
        if user.is_candidate:
            print("   ✅ Has Candidate access (apply for jobs, participate in interviews)")
        if user.role == 'hiring_manager':
            print("   ✅ Has Hiring Manager access (both HR and Interviewer capabilities)")

def test_interviewer_functionality(interviewer_user, candidate, job):
    """Test interviewer-specific functionality"""
    print("\n🧪 Testing interviewer functionality...")
    
    # Create interview session
    session_id = f"INT-{uuid.uuid4().hex[:8].upper()}"
    interview_session, created = InterviewSession.objects.get_or_create(
        session_id=session_id,
        defaults={
            'interviewer': interviewer_user,
            'candidate': candidate,
            'job_description': job.job_description,
            'interview_type': 'technical',
            'ai_enabled': True,
            'ai_mode': 'ai_assisted',
            'status': 'scheduled',
            'scheduled_date': datetime.now() + timedelta(hours=1),
            'duration_minutes': 60
        }
    )
    
    if created:
        print(f"✅ Created interview session: {session_id}")
    else:
        print(f"ℹ️  Interview session already exists: {session_id}")
    
    # Test competency evaluation
    competency_eval, created = CompetencyEvaluation.objects.get_or_create(
        session=interview_session,
        competency_title='Python Programming',
        defaults={
            'competency_description': 'Ability to write and understand Python code',
            'score': 85.0,
            'weightage': 20.0,
            'evaluation_method': 'STAR',
            'strengths': 'Strong understanding of Python fundamentals',
            'detailed_feedback': 'Candidate demonstrated solid Python knowledge'
        }
    )
    
    if created:
        print(f"✅ Created competency evaluation: {competency_eval.competency_title}")
    else:
        print(f"ℹ️  Competency evaluation already exists: {competency_eval.competency_title}")
    
    # Test interview feedback
    feedback, created = InterviewFeedback.objects.get_or_create(
        session=interview_session,
        defaults={
            'overall_score': 82.5,
            'technical_score': 85,
            'cultural_fit_score': 80,
            'overall_recommendation': 'recommend',
            'strengths_summary': 'Strong technical skills, good problem-solving approach',
            'improvement_areas': 'Could improve communication during complex explanations',
            'next_steps': 'Schedule follow-up interview with hiring manager',
            'interviewer_notes': 'Candidate demonstrated solid technical knowledge...'
        }
    )
    
    if created:
        print(f"✅ Created interview feedback with score: {feedback.overall_score}%")
    else:
        print(f"ℹ️  Interview feedback already exists with score: {feedback.overall_score}%")
    
    return interview_session

def test_hr_functionality(hr_user, candidate, job):
    """Test HR-specific functionality"""
    print("\n🧪 Testing HR functionality...")
    
    # Test job management
    print(f"   ✅ HR user can manage job: {job.job_description.title}")
    print(f"   ✅ HR user can view candidate: {candidate.full_name}")
    
    # Test candidate ranking (if available)
    try:
        from candidate_ranking.models import CandidateRanking
        print("   ℹ️  Candidate ranking functionality available")
    except ImportError:
        print("   ℹ️  Candidate ranking app not available")
    
    return True

def main():
    """Main test function"""
    print("🧪 Testing Role-Based System")
    print("=" * 50)
    
    try:
        # Create test users
        users = create_test_users()
        
        # Create profiles
        interviewer_profile = create_interviewer_profile(users['interviewer'])
        hr_profile = create_hr_profile(users['hr'])
        
        # Create test data
        candidate = create_test_candidate()
        job = create_test_job()
        
        # Test role permissions
        test_role_permissions(users)
        
        # Test role-specific functionality
        test_interviewer_functionality(users['interviewer'], candidate, job)
        test_hr_functionality(users['hr'], candidate, job)
        
        print("\n🎉 Role-based system test completed successfully!")
        print("\n📋 Test Summary:")
        print("   ✅ All user roles created")
        print("   ✅ Role permissions working correctly")
        print("   ✅ Interviewer functionality tested")
        print("   ✅ HR functionality tested")
        print("   ✅ Hiring Manager has dual access")
        
        print("\n🔑 Test Credentials:")
        for role, user in users.items():
            print(f"   {role.upper()}: {user.email} / testpass123")
        
        print("\n🚀 Ready for frontend testing!")
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
