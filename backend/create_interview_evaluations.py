#!/usr/bin/env python
"""
Script to create sample competency evaluations for completed interviews
"""

import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from competency_hiring.models import CompetencyFramework, Competency, CompetencyEvaluation
from interview_management.models import InterviewSession

def create_sample_evaluations():
    """Create sample competency evaluations for the completed interview"""
    
    print("=== Creating Sample Interview Evaluations ===")
    
    # Get the completed interview session
    session = InterviewSession.objects.filter(status='scheduled').first()
    if not session:
        print("❌ No interview session found")
        return
    
    print(f"✅ Found session: {session.session_id}")
    print(f"   Candidate: {session.candidate.email}")
    print(f"   Job: {session.job_description.title}")
    print(f"   Overall Score: {session.overall_score}")
    
    # Get or create Python Developer framework
    framework, created = CompetencyFramework.objects.get_or_create(
        name="Python Developer",
        defaults={
            'description': 'Competency framework for Python Developer role',
            'version': '1.0'
        }
    )
    
    if created:
        print(f"✅ Created framework: {framework.name}")
    else:
        print(f"✅ Using existing framework: {framework.name}")
    
    # Sample competency evaluations
    sample_evaluations = [
        {
            'name': 'Python Programming',
            'score': 85,
            'level': 'proficient',
            'feedback': 'Strong understanding of Python syntax, data structures, and OOP concepts. Demonstrated good problem-solving skills with clean, readable code.',
            'strengths': 'Excellent grasp of Python fundamentals, good use of list comprehensions, and proper error handling.',
            'areas_for_improvement': 'Could benefit from more advanced Python features like decorators and context managers.'
        },
        {
            'name': 'Django Framework',
            'score': 78,
            'level': 'competent',
            'feedback': 'Good knowledge of Django models, views, and templates. Some gaps in advanced features like middleware and signals.',
            'strengths': 'Solid understanding of Django ORM, URL routing, and template system.',
            'areas_for_improvement': 'Needs more experience with Django REST framework and advanced Django features.'
        },
        {
            'name': 'Database Design',
            'score': 82,
            'level': 'proficient',
            'feedback': 'Solid understanding of relational databases, SQL queries, and database optimization techniques.',
            'strengths': 'Good knowledge of database normalization, indexing, and query optimization.',
            'areas_for_improvement': 'Could improve knowledge of NoSQL databases and advanced database concepts.'
        },
        {
            'name': 'API Development',
            'score': 90,
            'level': 'expert',
            'feedback': 'Excellent knowledge of REST APIs, authentication, and API design patterns. Very strong in this area.',
            'strengths': 'Outstanding API design skills, proper HTTP status codes, and comprehensive error handling.',
            'areas_for_improvement': 'Consider learning GraphQL for more complex API requirements.'
        },
        {
            'name': 'Testing',
            'score': 75,
            'level': 'competent',
            'feedback': 'Basic understanding of unit testing and test-driven development. Needs improvement in integration testing.',
            'strengths': 'Good knowledge of pytest and basic unit testing concepts.',
            'areas_for_improvement': 'Needs more experience with integration testing, mocking, and test coverage analysis.'
        },
        {
            'name': 'Problem Solving',
            'score': 88,
            'level': 'proficient',
            'feedback': 'Strong analytical thinking and problem-solving approach. Able to break down complex problems into manageable parts.',
            'strengths': 'Excellent logical reasoning, good use of algorithms and data structures.',
            'areas_for_improvement': 'Could improve in system design and scalability considerations.'
        }
    ]
    
    created_count = 0
    for eval_data in sample_evaluations:
        # Find or create competency
        competency, comp_created = Competency.objects.get_or_create(
            name=eval_data['name'],
            framework=framework,
            defaults={
                'weight': 5,
                'description': f'Assessment of {eval_data["name"]} skills for Python Developer role'
            }
        )
        
        if comp_created:
            print(f"✅ Created competency: {competency.name}")
        
        # Create evaluation (avoiding the problematic model reference)
        try:
            evaluation, eval_created = CompetencyEvaluation.objects.get_or_create(
                session=session,
                competency=competency,
                defaults={
                    'score': eval_data['score'],
                    'level': eval_data['level'],
                    'feedback': eval_data['feedback'],
                    'strengths': eval_data['strengths'],
                    'areas_for_improvement': eval_data['areas_for_improvement'],
                    'justification': f'Evaluation based on technical interview questions and coding assessment for {eval_data["name"]} competency.'
                }
            )
        except Exception as e:
            print(f"⚠️  Error creating evaluation for {eval_data['name']}: {e}")
            continue
        
        if eval_created:
            print(f"✅ Created evaluation for {eval_data['name']}: {eval_data['score']}% ({eval_data['level']})")
            created_count += 1
        else:
            print(f"⚠️  Evaluation already exists for {eval_data['name']}")
    
    print(f"\n=== Summary ===")
    print(f"✅ Created {created_count} new competency evaluations")
    print(f"✅ Total evaluations for session: {session.evaluations.count()}")
    
    # Calculate weighted average
    total_weighted_score = 0
    total_weight = 0
    
    for evaluation in session.evaluations.all():
        weight = evaluation.competency.weight
        total_weighted_score += evaluation.score * weight
        total_weight += weight
    
    if total_weight > 0:
        calculated_score = total_weighted_score / total_weight
        print(f"✅ Calculated overall score: {calculated_score:.2f}%")
        
        # Update session overall score
        session.overall_score = calculated_score
        session.save()
        print(f"✅ Updated session overall score to {calculated_score:.2f}%")

if __name__ == "__main__":
    create_sample_evaluations()
