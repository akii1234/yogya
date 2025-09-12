#!/usr/bin/env python3
"""
E2E Testing Setup Script for Yogya Platform
Creates all necessary users, data, and relationships for comprehensive testing
Based on actual model structures from all apps
"""

import os
import sys
import django
from datetime import datetime, timedelta
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from user_management.models import User, HRProfile, CandidateProfile
from resume_checker.models import Candidate, JobDescription, Resume, Application, Match
from hiring_manager.models import HiringManager, JobPosting
from interviewer.models import Interviewer
from interview_management.models import InterviewSession, CompetencyEvaluation, InterviewFeedback, InterviewAnalytics, InterviewQuestion as SessionInterviewQuestion
from competency_hiring.models import CompetencyFramework, Competency, InterviewTemplate, InterviewQuestion as TemplateInterviewQuestion
from candidate_ranking.models import CandidateRanking, RankingBatch, RankingCriteria

User = get_user_model()

def create_test_users():
    """Create test users for all roles"""
    print("🔧 Creating test users...")
    
    users = {}
    
    # HR User
    hr_user, created = User.objects.get_or_create(
        email='hr@yogya.com',
        defaults={
            'username': 'hr@yogya.com',
            'first_name': 'HR',
            'last_name': 'Manager',
            'role': 'hr',
            'status': 'active',
            'is_active': True
        }
    )
    if created:
        hr_user.set_password('testpass123')
        hr_user.save()
        print(f"✅ Created HR user: {hr_user.email}")
    else:
        print(f"ℹ️ HR user already exists: {hr_user.email}")
    users['hr'] = hr_user
    
    # Interviewer User
    interviewer_user, created = User.objects.get_or_create(
        email='interviewer@yogya.com',
        defaults={
            'username': 'interviewer@yogya.com',
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
        print(f"ℹ️ Interviewer user already exists: {interviewer_user.email}")
    users['interviewer'] = interviewer_user
    
    # Candidate User
    candidate_user, created = User.objects.get_or_create(
        email='candidate@yogya.com',
        defaults={
            'username': 'candidate@yogya.com',
            'first_name': 'John',
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
        print(f"ℹ️ Candidate user already exists: {candidate_user.email}")
    users['candidate'] = candidate_user
    
    # Hiring Manager User
    hiring_manager_user, created = User.objects.get_or_create(
        email='hiring_manager@yogya.com',
        defaults={
            'username': 'hiring_manager@yogya.com',
            'first_name': 'Sarah',
            'last_name': 'HiringManager',
            'role': 'hiring_manager',
            'status': 'active',
            'is_active': True
        }
    )
    if created:
        hiring_manager_user.set_password('testpass123')
        hiring_manager_user.save()
        print(f"✅ Created Hiring Manager user: {hiring_manager_user.email}")
    else:
        print(f"ℹ️ Hiring Manager user already exists: {hiring_manager_user.email}")
    users['hiring_manager'] = hiring_manager_user
    
    return users

def create_test_profiles(users):
    """Create extended profiles for users"""
    print("🔧 Creating user profiles...")
    
    # HR Profile
    hr_profile, created = HRProfile.objects.get_or_create(
        user=users['hr'],
        defaults={
            'department': 'Human Resources',
            'position': 'Senior HR Manager',
            'employee_id': 'HR001',
            'can_create_jobs': True,
            'can_manage_candidates': True,
            'can_conduct_interviews': True,
            'can_view_analytics': True,
            'preferred_interview_types': ['technical', 'behavioral', 'mixed']
        }
    )
    if created:
        print(f"✅ Created HR profile for: {users['hr'].email}")
    else:
        print(f"ℹ️ HR profile already exists for: {users['hr'].email}")
    
    # Candidate Profile
    candidate_profile, created = CandidateProfile.objects.get_or_create(
        user=users['candidate'],
        defaults={
            'linkedin_url': 'https://linkedin.com/in/johncandidate',
            'github_url': 'https://github.com/johncandidate',
            'portfolio_url': 'https://johncandidate.dev',
            'preferred_job_types': ['full_time', 'remote'],
            'preferred_locations': ['San Francisco', 'New York', 'Remote'],
            'profile_visibility': 'recruiters_only'
        }
    )
    if created:
        print(f"✅ Created Candidate profile for: {users['candidate'].email}")
    else:
        print(f"ℹ️ Candidate profile already exists for: {users['candidate'].email}")

def create_test_candidate():
    """Create a test candidate"""
    print("🔧 Creating test candidate...")
    
    candidate, created = Candidate.objects.get_or_create(
        email='candidate@yogya.com',
        defaults={
            'first_name': 'John',
            'last_name': 'Candidate',
            'phone': '+1-555-0123',
            'current_title': 'Software Engineer',
            'current_company': 'BigTech',
            'total_experience_years': 3,
            'highest_education': 'bachelor',
            'degree_field': 'Computer Science',
            'city': 'San Francisco',
            'state': 'CA',
            'country': 'USA',
            'status': 'active',
            'skills': ['Python', 'Django', 'React', 'JavaScript', 'AWS', 'PostgreSQL', 'TypeScript', 'Node.js']
        }
    )
    
    if created:
        print(f"✅ Created candidate: {candidate.full_name}")
    else:
        print(f"ℹ️ Candidate already exists: {candidate.full_name}")
    
    return candidate

def create_test_jobs():
    """Create test job descriptions and postings"""
    print("🔧 Creating test jobs...")
    
    jobs = []
    
    # Python Developer Job
    python_job_desc, created = JobDescription.objects.get_or_create(
        title='Python Developer',
        defaults={
            'company': 'Innovation Labs',
            'department': 'Engineering',
            'location': 'San Francisco, CA',
            'description': 'We are looking for a skilled Python developer to join our team.',
            'requirements': 'Python, Django, React, AWS, 3+ years experience',
            'experience_level': 'mid',
            'min_experience_years': 3,
            'employment_type': 'full_time',
            'status': 'active',
            'extracted_skills': ['Python', 'Django', 'React', 'AWS', 'PostgreSQL']
        }
    )
    
    if created:
        print(f"✅ Created job description: {python_job_desc.title}")
    else:
        print(f"ℹ️ Job description already exists: {python_job_desc.title}")
    
    # Create Hiring Manager
    hiring_manager, created = HiringManager.objects.get_or_create(
        user=User.objects.get(email='hiring_manager@yogya.com'),
        defaults={
            'company': 'Innovation Labs',
            'department': 'Engineering',
            'title': 'Senior Hiring Manager',
            'phone': '+1-555-0100'
        }
    )
    
    # Create Job Posting
    python_job_posting, created = JobPosting.objects.get_or_create(
        job_description=python_job_desc,
        defaults={
            'hiring_manager': hiring_manager,
            'status': 'active',
            'priority': 'high',
            'target_hiring_date': datetime.now().date() + timedelta(days=30),
            'max_applications': 50
        }
    )
    
    if created:
        print(f"✅ Created job posting: {python_job_posting.job_description.title}")
    else:
        print(f"ℹ️ Job posting already exists: {python_job_posting.job_description.title}")
    
    jobs.append(python_job_posting)
    
    # Frontend Developer Job
    frontend_job_desc, created = JobDescription.objects.get_or_create(
        title='Frontend Developer',
        defaults={
            'company': 'BigTech',
            'department': 'Engineering',
            'location': 'New York, NY',
            'description': 'Join our frontend team to build amazing user experiences.',
            'requirements': 'React, TypeScript, CSS, 2+ years experience',
            'experience_level': 'mid',
            'min_experience_years': 2,
            'employment_type': 'full_time',
            'status': 'active',
            'extracted_skills': ['React', 'TypeScript', 'CSS', 'JavaScript', 'HTML']
        }
    )
    
    if created:
        print(f"✅ Created job description: {frontend_job_desc.title}")
    else:
        print(f"ℹ️ Job description already exists: {frontend_job_desc.title}")
    
    # Create Job Posting
    frontend_job_posting, created = JobPosting.objects.get_or_create(
        job_description=frontend_job_desc,
        defaults={
            'hiring_manager': hiring_manager,
            'status': 'active',
            'priority': 'medium',
            'target_hiring_date': datetime.now().date() + timedelta(days=45),
            'max_applications': 30
        }
    )
    
    if created:
        print(f"✅ Created job posting: {frontend_job_posting.job_description.title}")
    else:
        print(f"ℹ️ Job posting already exists: {frontend_job_posting.job_description.title}")
    
    jobs.append(frontend_job_posting)
    
    return jobs

def create_test_resume(candidate):
    """Create a test resume for the candidate"""
    print("🔧 Creating test resume...")
    
    resume, created = Resume.objects.get_or_create(
        candidate=candidate,
        defaults={
            'file_name': 'john_candidate_resume.pdf',
            'parsed_text': '''
John Candidate
Software Engineer
john.candidate@email.com | +1-555-0123 | San Francisco, CA

EXPERIENCE
Software Engineer | BigTech | 2021-Present
• Developed and maintained Python-based web applications using Django and React
• Implemented RESTful APIs and microservices architecture
• Worked with AWS services including EC2, S3, and RDS
• Collaborated with cross-functional teams using Agile methodologies

Junior Developer | BigTech | 2020-2021
• Built frontend components using React and TypeScript
• Participated in code reviews and technical discussions
• Contributed to database design and optimization

EDUCATION
Bachelor of Science in Computer Science | University of California | 2020
• GPA: 3.8/4.0
• Relevant coursework: Data Structures, Algorithms, Web Development

SKILLS
Programming Languages: Python, JavaScript, TypeScript, SQL
Frameworks & Libraries: Django, React, Node.js, Express
Cloud & DevOps: AWS, Docker, Git, CI/CD
Databases: PostgreSQL, MongoDB, Redis
Tools: VS Code, Postman, Jira, Slack

PROJECTS
E-commerce Platform | Full-stack web application with payment integration
Task Management App | React-based project management tool
API Gateway | Microservices architecture with load balancing
            ''',
            'processing_status': 'completed',
            'extracted_skills': ['Python', 'Django', 'React', 'JavaScript', 'AWS', 'PostgreSQL', 'TypeScript', 'Node.js'],
            'extracted_experience': [
                {
                    'title': 'Software Engineer',
                    'company': 'BigTech',
                    'duration': '2 years',
                    'skills': ['Python', 'Django', 'React', 'AWS']
                }
            ],
            'extracted_education': [
                {
                    'degree': 'Bachelor of Science',
                    'field': 'Computer Science',
                    'institution': 'University of California',
                    'year': '2020'
                }
            ]
        }
    )
    
    if created:
        print(f"✅ Created resume for: {candidate.full_name}")
    else:
        print(f"ℹ️ Resume already exists for: {candidate.full_name}")
    
    return resume

def create_test_interviewer_profile(users):
    """Create interviewer profile"""
    print("🔧 Creating interviewer profile...")
    
    interviewer_profile, created = Interviewer.objects.get_or_create(
        user=users['interviewer'],
        defaults={
            'company': 'Innovation Labs',
            'department': 'Engineering',
            'title': 'Senior Technical Interviewer',
            'phone': '+1-555-0200',
            'technical_skills': ['Python', 'JavaScript', 'System Design', 'Algorithms'],
            'interview_types': ['technical', 'behavioral', 'system_design'],
            'experience_years': 5,
            'ai_assistance_enabled': True,
            'ai_question_suggestions': True,
            'ai_response_analysis': True,
            'ai_followup_suggestions': True,
            'is_active': True,
            'max_interviews_per_week': 10
        }
    )
    
    if created:
        print(f"✅ Created interviewer profile for: {users['interviewer'].email}")
    else:
        print(f"ℹ️ Interviewer profile already exists for: {users['interviewer'].email}")
    
    return interviewer_profile

def create_test_applications(candidate, jobs):
    """Create test applications"""
    print("🔧 Creating test applications...")
    
    applications = []
    
    for job in jobs:
        # Create application
        application, created = Application.objects.get_or_create(
            job_description=job.job_description,
            candidate=candidate,
            defaults={
                'cover_letter': f'I am excited to apply for the {job.job_description.title} position at {job.job_description.company}.',
                'expected_salary': 95000.00,
                'salary_currency': 'USD',
                'status': 'shortlisted',
                'source': 'ats_match',
                'is_shortlisted': True,
                'shortlisted_at': datetime.now()
            }
        )
        
        if created:
            print(f"✅ Created application for: {job.job_description.title}")
        else:
            print(f"ℹ️ Application already exists for: {job.job_description.title}")
        
        applications.append(application)
    
    return applications

def create_test_matches(candidate, jobs, resume):
    """Create test matches"""
    print("🔧 Creating test matches...")
    
    matches = []
    
    for job in jobs:
        match, created = Match.objects.get_or_create(
            job_description=job.job_description,
            resume=resume,
            defaults={
                'overall_score': 82.5,
                'skill_score': 85.0,
                'experience_score': 80.0,
                'technical_score': 88.0,
                'semantic_score': 78.0,
                'education_score': 90.0,
                'matched_skills': ['Python', 'Django', 'React', 'AWS'],
                'missing_skills': ['Kubernetes', 'GraphQL'],
                # 'skill_gap_percentage': 15.0,  # Field not in current model
                'experience_gap': 0,
                'status': 'shortlisted',
                'is_invited_for_interview': True
            }
        )
        
        if created:
            print(f"✅ Created match for: {job.job_description.title}")
        else:
            print(f"ℹ️ Match already exists for: {job.job_description.title}")
        
        matches.append(match)
    
    return matches

def create_test_candidate_rankings(candidate, jobs, applications):
    """Create test candidate rankings"""
    print("🔧 Creating test candidate rankings...")
    
    rankings = []
    
    # Create ranking batch
    batch, created = RankingBatch.objects.get_or_create(
        job_description=jobs[0].job_description,
        defaults={
            'total_candidates': 10,
            'ranked_candidates': 8,
            'failed_rankings': 2,
            'status': 'completed',
            'completed_at': datetime.now(),
            'processing_time_seconds': 45,
            'created_by': User.objects.get(email='hr@yogya.com')
        }
    )
    
    if created:
        print(f"✅ Created ranking batch: {batch.batch_id}")
    else:
        print(f"ℹ️ Ranking batch already exists: {batch.batch_id}")
    
    # Create candidate ranking
    ranking, created = CandidateRanking.objects.get_or_create(
        candidate=candidate,
        job_description=jobs[0].job_description,
        defaults={
            'application': applications[0],
            'overall_score': 82.5,
            'skill_match_score': 85.0,
            'experience_match_score': 80.0,
            'education_match_score': 90.0,
            'location_match_score': 75.0,
            'rank_position': 1,
            'total_candidates': 10,
            'matched_skills': ['Python', 'Django', 'React', 'AWS'],
            'missing_skills': ['Kubernetes', 'GraphQL'],
            # 'skill_gap_percentage': 15.0,  # Field not in current model
            'experience_years': 3,
            'required_experience_years': 3,
            'experience_gap': 0,
            'status': 'active',
            'is_shortlisted': True
        }
    )
    
    if created:
        print(f"✅ Created candidate ranking: {ranking.ranking_id}")
    else:
        print(f"ℹ️ Candidate ranking already exists: {ranking.ranking_id}")
    
    rankings.append(ranking)
    
    return rankings

def create_test_interview_session(candidate, jobs, users):
    """Create a test interview session"""
    print("🔧 Creating test interview session...")
    
    session, created = InterviewSession.objects.get_or_create(
        candidate=candidate,
        job_description=jobs[0].job_description,
        defaults={
            'interviewer': users['interviewer'],
            'interview_type': 'technical',
            'interview_mode': 'video',
            'ai_enabled': True,
            'ai_mode': 'ai_assisted',
            'scheduled_date': datetime.now() + timedelta(hours=1),
            'duration_minutes': 60,
            'status': 'scheduled',
            'meeting_link': 'https://meet.google.com/test-interview-123',
            'meeting_instructions': 'Please join 5 minutes before the scheduled time. Have your portfolio ready.'
        }
    )
    
    if created:
        print(f"✅ Created interview session: {session.session_id}")
    else:
        print(f"ℹ️ Interview session already exists: {session.session_id}")
    
    return session

def create_test_competency_evaluations(session):
    """Create test competency evaluations"""
    print("🔧 Creating test competency evaluations...")
    
    competencies = [
        {
            'title': 'Python Programming',
            'description': 'Ability to write clean, efficient Python code',
            'score': 85.0,
            'weightage': 30.0,
            'strengths': 'Strong understanding of Python fundamentals and best practices.',
            'areas_for_improvement': 'Could improve on advanced Python features like decorators and generators.'
        },
        {
            'title': 'Problem Solving',
            'description': 'Analytical and problem-solving skills',
            'score': 78.0,
            'weightage': 25.0,
            'strengths': 'Good analytical skills and logical thinking.',
            'areas_for_improvement': 'Could improve on optimization techniques and time complexity analysis.'
        },
        {
            'title': 'Communication',
            'description': 'Clear and effective communication skills',
            'score': 92.0,
            'weightage': 20.0,
            'strengths': 'Excellent communication skills, clear and articulate.',
            'areas_for_improvement': 'Could provide more specific examples in responses.'
        },
        {
            'title': 'System Design',
            'description': 'Ability to design scalable systems',
            'score': 70.0,
            'weightage': 15.0,
            'strengths': 'Basic understanding of system design principles.',
            'areas_for_improvement': 'Needs more experience with large-scale distributed systems.'
        },
        {
            'title': 'Teamwork',
            'description': 'Collaboration and team working skills',
            'score': 88.0,
            'weightage': 10.0,
            'strengths': 'Great team player, collaborative approach to problem solving.',
            'areas_for_improvement': 'Could take more initiative in team projects.'
        }
    ]
    
    evaluations = []
    for comp in competencies:
        evaluation, created = CompetencyEvaluation.objects.get_or_create(
            session=session,
            competency_title=comp['title'],
            defaults={
                'competency_description': comp['description'],
                'evaluation_method': 'STAR',
                'score': comp['score'],
                'weightage': comp['weightage'],
                'strengths': comp['strengths'],
                'areas_for_improvement': comp['areas_for_improvement'],
                'detailed_feedback': f"Comprehensive evaluation of {comp['title']} competency.",
                'criteria_scores': {
                    'technical_knowledge': comp['score'] - 5,
                    'practical_application': comp['score'],
                    'communication': comp['score'] + 2
                }
            }
        )
        
        if created:
            print(f"✅ Created evaluation for: {comp['title']}")
        else:
            print(f"ℹ️ Evaluation already exists for: {comp['title']}")
        
        evaluations.append(evaluation)
    
    return evaluations

def create_test_interview_feedback(session):
    """Create test interview feedback"""
    print("🔧 Creating test interview feedback...")
    
    feedback, created = InterviewFeedback.objects.get_or_create(
        session=session,
        defaults={
            'overall_score': 82.5,
            'overall_recommendation': 'strong_hire',
            'interviewer_notes': 'Candidate shows great potential. Strong technical skills and good communication.',
            'ai_insights': 'AI analysis indicates strong technical competency with room for growth in system design.',
            'strengths_summary': 'Strong technical skills, excellent communication, good problem-solving approach.',
            'improvement_areas': 'Could benefit from more system design experience and optimization techniques.',
            'technical_score': 82.0,
            'cultural_fit_score': 88.0,
            'competency_scores': {
                'Python Programming': 85.0,
                'Problem Solving': 78.0,
                'Communication': 92.0,
                'System Design': 70.0,
                'Teamwork': 88.0
            },
            'next_steps': 'Proceed to final round interview with hiring manager.',
            'follow_up_required': False
        }
    )
    
    if created:
        print(f"✅ Created interview feedback for session: {session.session_id}")
    else:
        print(f"ℹ️ Interview feedback already exists for session: {session.session_id}")
    
    return feedback

def create_test_interview_questions(session):
    """Create test interview questions"""
    print("🔧 Creating test interview questions...")
    
    questions_data = [
        {
            'question_text': 'Explain the difference between a list and a tuple in Python.',
            'question_type': 'technical',
            'competency_title': 'Python Programming',
            'candidate_response': 'Lists are mutable and tuples are immutable. Lists use square brackets and tuples use parentheses.',
            'question_score': 85.0
        },
        {
            'question_text': 'Describe a time when you had to solve a complex problem.',
            'question_type': 'behavioral',
            'competency_title': 'Problem Solving',
            'candidate_response': 'I had to optimize a database query that was taking too long. I analyzed the execution plan and added proper indexes.',
            'question_score': 78.0
        },
        {
            'question_text': 'How would you design a URL shortening service?',
            'question_type': 'system_design',
            'competency_title': 'System Design',
            'candidate_response': 'I would use a distributed system with load balancers, a database for URL mappings, and a caching layer.',
            'question_score': 70.0
        }
    ]
    
    questions = []
    for q_data in questions_data:
        question, created = SessionInterviewQuestion.objects.get_or_create(
            session=session,
            question_text=q_data['question_text'],
            defaults={
                'question_type': q_data['question_type'],
                'competency_title': q_data['competency_title'],
                'candidate_response': q_data['candidate_response'],
                'question_score': q_data['question_score'],
                'question_feedback': f"Good response for {q_data['question_type']} question.",
                'answered_at': datetime.now()
            }
        )
        
        if created:
            print(f"✅ Created question: {q_data['question_text'][:50]}...")
        else:
            print(f"ℹ️ Question already exists: {q_data['question_text'][:50]}...")
        
        questions.append(question)
    
    return questions

def create_test_interview_analytics(session):
    """Create test interview analytics"""
    print("🔧 Creating test interview analytics...")
    
    analytics, created = InterviewAnalytics.objects.get_or_create(
        session=session,
        defaults={
            'total_questions_asked': 3,
            'average_response_time': 45.5,
            'completion_rate': 100.0,
            'strongest_competency': 'Communication',
            'weakest_competency': 'System Design',
            'competency_gaps': ['System Design', 'Advanced Algorithms'],
            'ai_suggestions_used': 2,
            'ai_follow_ups_generated': 1,
            'ai_effectiveness_score': 85.0,
            'interview_quality_score': 88.0,
            'bias_detection_score': 92.0,
            'time_spent_per_competency': {
                'Python Programming': 15,
                'Problem Solving': 20,
                'Communication': 10,
                'System Design': 10,
                'Teamwork': 5
            }
        }
    )
    
    if created:
        print(f"✅ Created interview analytics for session: {session.session_id}")
    else:
        print(f"ℹ️ Interview analytics already exists for session: {session.session_id}")
    
    return analytics

def create_competency_frameworks():
    """Create competency frameworks for different roles"""
    print("🔧 Creating competency frameworks...")
    
    frameworks = {}
    
    # Python Developer Framework
    python_framework, created = CompetencyFramework.objects.get_or_create(
        name='Python Developer',
        defaults={
            'description': 'Competency framework for Python developers at all levels',
            'technology': 'Python',
            'level': 'mid',
            'is_active': True
        }
    )
    if created:
        print(f"✅ Created Python Developer framework")
    frameworks['python'] = python_framework
    
    # Frontend Developer Framework
    frontend_framework, created = CompetencyFramework.objects.get_or_create(
        name='Frontend Developer',
        defaults={
            'description': 'Competency framework for frontend developers',
            'technology': 'Frontend',
            'level': 'mid',
            'is_active': True
        }
    )
    if created:
        print(f"✅ Created Frontend Developer framework")
    frameworks['frontend'] = frontend_framework
    
    # DevOps Engineer Framework
    devops_framework, created = CompetencyFramework.objects.get_or_create(
        name='DevOps Engineer',
        defaults={
            'description': 'Competency framework for DevOps engineers',
            'technology': 'DevOps',
            'level': 'mid',
            'is_active': True
        }
    )
    if created:
        print(f"✅ Created DevOps Engineer framework")
    frameworks['devops'] = devops_framework
    
    return frameworks

def create_competencies(frameworks):
    """Create core competencies with STAR/CAR methodology"""
    print("🔧 Creating competencies...")
    
    competencies = {}
    
    # Core competencies for all frameworks
    core_competencies = [
        {
            'title': 'Problem Solving',
            'description': 'Ability to analyze complex problems and develop effective solutions',
            'evaluation_method': 'STAR',
            'weightage': 20.0,
            'sample_question': 'Tell me about a time you debugged a critical production bug under pressure'
        },
        {
            'title': 'Communication',
            'description': 'Ability to clearly express ideas and technical concepts',
            'evaluation_method': 'STAR',
            'weightage': 15.0,
            'sample_question': 'Describe a time you had to explain a complex technical concept to non-technical stakeholders'
        },
        {
            'title': 'Collaboration',
            'description': 'Ability to work effectively in teams and resolve conflicts',
            'evaluation_method': 'STAR',
            'weightage': 15.0,
            'sample_question': 'Give an example of when you helped a struggling team member succeed'
        },
        {
            'title': 'Ownership',
            'description': 'Taking initiative and accountability for project delivery',
            'evaluation_method': 'STAR',
            'weightage': 20.0,
            'sample_question': 'Tell me about a project where you took initiative beyond your assigned responsibilities'
        },
        {
            'title': 'Learning Agility',
            'description': 'Ability to quickly learn new technologies and adapt to change',
            'evaluation_method': 'STAR',
            'weightage': 10.0,
            'sample_question': 'Describe a situation where you had to learn a new technology quickly to meet a deadline'
        },
        {
            'title': 'Technical Depth',
            'description': 'Deep understanding of technical concepts and architecture',
            'evaluation_method': 'STAR',
            'weightage': 20.0,
            'sample_question': 'Walk me through the most complex system you have designed or contributed to'
        }
    ]
    
    # Create competencies for each framework
    for framework_name, framework in frameworks.items():
        framework_competencies = []
        
        for comp_data in core_competencies:
            # Add framework-specific technical competencies
            if framework_name == 'python' and comp_data['title'] == 'Technical Depth':
                comp_data['description'] += ' with Python ecosystem, Django, Flask, and cloud technologies'
            elif framework_name == 'frontend' and comp_data['title'] == 'Technical Depth':
                comp_data['description'] += ' with React, TypeScript, modern CSS, and frontend architecture'
            elif framework_name == 'devops' and comp_data['title'] == 'Technical Depth':
                comp_data['description'] += ' with Docker, Kubernetes, AWS, and CI/CD pipelines'
            
            competency, created = Competency.objects.get_or_create(
                framework=framework,
                title=comp_data['title'],
                defaults={
                    'description': comp_data['description'],
                    'evaluation_method': comp_data['evaluation_method'],
                    'weightage': comp_data['weightage'],
                    'sample_question': comp_data['sample_question'],
                    'evaluation_criteria': [
                        'Clear situation description',
                        'Specific actions taken',
                        'Measurable results achieved',
                        'Learning and growth demonstrated'
                    ],
                    'tags': ['Core', 'High Priority', 'Engineering'],
                    'order': len(framework_competencies) + 1
                }
            )
            
            if created:
                print(f"✅ Created competency: {comp_data['title']} for {framework_name}")
            framework_competencies.append(competency)
        
        competencies[framework_name] = framework_competencies
    
    return competencies

def create_interview_templates(frameworks, competencies):
    """Create interview templates for each framework"""
    print("🔧 Creating interview templates...")
    
    templates = {}
    
    template_configs = [
        {
            'name': 'Quick Assessment',
            'description': '20-minute quick assessment for initial screening',
            'duration_minutes': 20
        },
        {
            'name': 'Technical Interview',
            'description': '45-minute technical interview focusing on technical competencies',
            'duration_minutes': 45
        },
        {
            'name': 'Behavioral Interview',
            'description': '30-minute behavioral interview using STAR methodology',
            'duration_minutes': 30
        },
        {
            'name': 'Comprehensive Interview',
            'description': '60-minute comprehensive interview covering all competencies',
            'duration_minutes': 60
        }
    ]
    
    for framework_name, framework in frameworks.items():
        framework_templates = []
        
        for template_config in template_configs:
            template, created = InterviewTemplate.objects.get_or_create(
                name=f"{template_config['name']} - {framework.name}",
                framework=framework,
                defaults={
                    'description': template_config['description'],
                    'duration_minutes': template_config['duration_minutes'],
                    'is_active': True
                }
            )
            
            if created:
                print(f"✅ Created template: {template.name}")
                
                # Create interview questions for this template
                framework_competencies = competencies[framework_name]
                for i, competency in enumerate(framework_competencies[:3]):  # Limit to 3 questions for demo
                    question, created = TemplateInterviewQuestion.objects.get_or_create(
                        template=template,
                        competency=competency,
                        order=i + 1,
                        defaults={
                            'question_text': competency.sample_question,
                            'question_type': 'behavioral',
                            'difficulty': 'medium',
                            'time_allocation': 5,
                            'evaluation_criteria': competency.evaluation_criteria,
                            'expected_answer_points': [
                                'Clear situation description',
                                'Specific actions taken',
                                'Measurable results achieved'
                            ]
                        }
                    )
                    
                    if created:
                        print(f"  ✅ Created question: {question.question_text[:50]}...")
            
            framework_templates.append(template)
        
        templates[framework_name] = framework_templates
    
    return templates

def main():
    """Main setup function"""
    print("🚀 Setting up COMPREHENSIVE E2E Testing Environment")
    print("=" * 60)
    
    try:
        # Create all test data
        users = create_test_users()
        create_test_profiles(users)
        candidate = create_test_candidate()
        frameworks = create_competency_frameworks()
        competencies = create_competencies(frameworks)
        templates = create_interview_templates(frameworks, competencies)
        jobs = create_test_jobs()
        resume = create_test_resume(candidate)
        interviewer_profile = create_test_interviewer_profile(users)
        applications = create_test_applications(candidate, jobs)
        matches = create_test_matches(candidate, jobs, resume)
        rankings = create_test_candidate_rankings(candidate, jobs, applications)
        session = create_test_interview_session(candidate, jobs, users)
        evaluations = create_test_competency_evaluations(session)
        feedback = create_test_interview_feedback(session)
        questions = create_test_interview_questions(session)
        analytics = create_test_interview_analytics(session)
        
        print("\n" + "=" * 50)
        print("✅ E2E Testing Setup Complete!")
        print("=" * 50)
        
        print("\n🔑 Test Credentials:")
        print("HR: hr@yogya.com / testpass123")
        print("Interviewer: interviewer@yogya.com / testpass123")
        print("Candidate: candidate@yogya.com / testpass123")
        print("Hiring Manager: hiring_manager@yogya.com / testpass123")
        
        print("\n📊 Test Data Created:")
        print(f"• Users: {len(users)}")
        print(f"• Competency Frameworks: {len(frameworks)}")
        print(f"• Competencies: {sum(len(comps) for comps in competencies.values())}")
        print(f"• Interview Templates: {sum(len(temps) for temps in templates.values())}")
        print(f"• Jobs: {len(jobs)}")
        print(f"• Applications: {len(applications)}")
        print(f"• Matches: {len(matches)}")
        print(f"• Rankings: {len(rankings)}")
        print(f"• Interview Session: {session.session_id}")
        print(f"• Competency Evaluations: {len(evaluations)}")
        print(f"• Interview Questions: {len(questions)}")
        print(f"• Interview Feedback: {feedback.id}")
        print(f"• Interview Analytics: {analytics.id}")
        
        print("\n🎯 Ready for COMPREHENSIVE E2E Testing!")
        print("You can now test the complete workflow:")
        print("1. HR Dashboard → Competency Management → Candidate Rankings")
        print("2. Interviewer Dashboard → Competency Questions Screen")
        print("3. Candidate Portal → Job Applications → Assessment")
        print("4. Complete interview flow with competency-based evaluation")
        print("5. AI Recommendation Engine with interview data")
        
        print("\n🏢 All data is BigTech branded for consistency!")
        
    except Exception as e:
        print(f"❌ Error during setup: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
