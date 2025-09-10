#!/usr/bin/env python
"""
Simple script to add competency evaluations to the completed interview
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

def add_evaluations():
    """Add competency evaluations to the completed interview"""
    
    print("=== Adding Competency Evaluations ===")
    
    # Get the completed interview session
    session = InterviewSession.objects.filter(status='scheduled').first()
    if not session:
        print("❌ No interview session found")
        return
    
    print(f"✅ Found session: {session.session_id}")
    print(f"   Candidate: {session.candidate.email}")
    print(f"   Job: {session.job_description.title}")
    
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
    evaluations_data = [
        {
            'name': 'Python Programming',
            'score': 85,
            'level': 'proficient',
            'feedback': 'Strong understanding of Python syntax, data structures, and OOP concepts.',
            'strengths': 'Excellent grasp of Python fundamentals and clean code practices.',
            'areas_for_improvement': 'Could benefit from more advanced Python features.'
        },
        {
            'name': 'Django Framework',
            'score': 78,
            'level': 'competent',
            'feedback': 'Good knowledge of Django models, views, and templates.',
            'strengths': 'Solid understanding of Django ORM and URL routing.',
            'areas_for_improvement': 'Needs more experience with Django REST framework.'
        },
        {
            'name': 'Database Design',
            'score': 82,
            'level': 'proficient',
            'feedback': 'Solid understanding of relational databases and SQL queries.',
            'strengths': 'Good knowledge of database normalization and indexing.',
            'areas_for_improvement': 'Could improve knowledge of NoSQL databases.'
        },
        {
            'name': 'API Development',
            'score': 90,
            'level': 'expert',
            'feedback': 'Excellent knowledge of REST APIs and authentication.',
            'strengths': 'Outstanding API design skills and error handling.',
            'areas_for_improvement': 'Consider learning GraphQL for complex requirements.'
        },
        {
            'name': 'Testing',
            'score': 75,
            'level': 'competent',
            'feedback': 'Basic understanding of unit testing and TDD.',
            'strengths': 'Good knowledge of pytest and basic testing concepts.',
            'areas_for_improvement': 'Needs more experience with integration testing.'
        },
        {
            'name': 'Problem Solving',
            'score': 88,
            'level': 'proficient',
            'feedback': 'Strong analytical thinking and problem-solving approach.',
            'strengths': 'Excellent logical reasoning and algorithm usage.',
            'areas_for_improvement': 'Could improve in system design considerations.'
        }
    ]
    
    created_count = 0
    for eval_data in evaluations_data:
        # Find or create competency
        competency, comp_created = Competency.objects.get_or_create(
            name=eval_data['name'],
            framework=framework,
            defaults={
                'weight': 5,
                'description': f'Assessment of {eval_data["name"]} skills'
            }
        )
        
        if comp_created:
            print(f"✅ Created competency: {competency.name}")
        
        # Create evaluation directly
        try:
            evaluation = CompetencyEvaluation.objects.create(
                session=session,
                competency=competency,
                score=eval_data['score'],
                level=eval_data['level'],
                feedback=eval_data['feedback'],
                strengths=eval_data['strengths'],
                areas_for_improvement=eval_data['areas_for_improvement'],
                justification=f'Evaluation based on technical interview for {eval_data["name"]} competency.'
            )
            print(f"✅ Created evaluation for {eval_data['name']}: {eval_data['score']}% ({eval_data['level']})")
            created_count += 1
        except Exception as e:
            print(f"⚠️  Error creating evaluation for {eval_data['name']}: {e}")
    
    print(f"\n=== Summary ===")
    print(f"✅ Created {created_count} competency evaluations")
    
    # Check total evaluations
    total_evaluations = CompetencyEvaluation.objects.filter(session=session).count()
    print(f"✅ Total evaluations for session: {total_evaluations}")
    
    # Calculate weighted average
    evaluations = CompetencyEvaluation.objects.filter(session=session)
    if evaluations.exists():
        total_weighted_score = 0
        total_weight = 0
        
        for evaluation in evaluations:
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
    add_evaluations()


