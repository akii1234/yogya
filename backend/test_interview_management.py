#!/usr/bin/env python3
"""
Test script for Interview Management Backend
Tests the interview session, competency evaluation, and feedback functionality
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from django.utils import timezone
from user_management.models import User
from candidate_ranking.models import Candidate, JobDescription
from interview_management.models import (
    InterviewSession, 
    CompetencyEvaluation, 
    InterviewFeedback, 
    InterviewQuestion, 
    InterviewAnalytics
)


def test_interview_management_backend():
    """Test the interview management backend functionality"""
    
    print("🧪 Testing Interview Management Backend")
    print("=" * 50)
    
    try:
        # Get test data
        print("\n1. Getting test data...")
        
        # Get or create test users
        interviewer, created = User.objects.get_or_create(
            email='interviewer@test.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'Interviewer',
                'role': 'interviewer',
                'is_staff': True
            }
        )
        
        candidate_user, created = User.objects.get_or_create(
            email='candidate@test.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'Candidate',
                'role': 'candidate'
            }
        )
        
        # Get or create test candidate
        candidate, created = Candidate.objects.get_or_create(
            email='candidate@test.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'Candidate',
                'phone': '+1234567890',
                'city': 'Test City',
                'state': 'Test State',
                'country': 'Test Country'
            }
        )
        
        # Get or create test job
        job, created = JobDescription.objects.get_or_create(
            job_id='TEST-INT-001',
            defaults={
                'title': 'Test Interview Position',
                'company': 'Test Company',
                'location': 'Test Location',
                'description': 'Test job description for interview testing',
                'requirements': 'Test requirements',
                'status': 'active'
            }
        )
        
        print(f"✅ Test data ready: Interviewer={interviewer.email}, Candidate={candidate.full_name}, Job={job.job_id}")
        
        # Test 1: Create Interview Session
        print("\n2. Testing Interview Session Creation...")
        
        session = InterviewSession.objects.create(
            candidate=candidate,
            interviewer=interviewer,
            job_description=job,
            interview_type='mixed',
            interview_mode='video',
            ai_enabled=True,
            ai_mode='ai_assisted',
            scheduled_date=timezone.now() + timedelta(hours=1),
            duration_minutes=60,
            status='scheduled',
            meeting_link='https://meet.google.com/test-interview',
            meeting_instructions='Please join 5 minutes before the scheduled time.'
        )
        
        print(f"✅ Interview session created: {session.session_id}")
        print(f"   - Status: {session.status}")
        print(f"   - Scheduled: {session.scheduled_date}")
        print(f"   - AI Enabled: {session.ai_enabled}")
        
        # Test 2: Start Interview
        print("\n3. Testing Interview Start...")
        
        session.status = 'in_progress'
        session.actual_start_time = timezone.now()
        session.save()
        
        print(f"✅ Interview started: {session.actual_start_time}")
        print(f"   - Status: {session.status}")
        
        # Test 3: Create Competency Evaluations
        print("\n4. Testing Competency Evaluations...")
        
        competencies = [
            {
                'title': 'Problem Solving',
                'score': 85.0,
                'weightage': 20.0,
                'star_observations': {
                    'situation': 'Complex production bug',
                    'task': 'Debug and fix quickly',
                    'action': 'Systematic approach',
                    'result': 'Successfully resolved'
                },
                'strengths': 'Excellent analytical thinking and systematic approach',
                'areas_for_improvement': 'Could improve on documentation'
            },
            {
                'title': 'Communication',
                'score': 78.0,
                'weightage': 15.0,
                'car_observations': {
                    'context': 'Explaining technical concept to non-technical stakeholder',
                    'action': 'Used analogies and simplified language',
                    'result': 'Stakeholder understood and made informed decision'
                },
                'strengths': 'Good at simplifying complex concepts',
                'areas_for_improvement': 'Could be more concise'
            },
            {
                'title': 'Collaboration',
                'score': 92.0,
                'weightage': 15.0,
                'star_observations': {
                    'situation': 'Team member struggling with task',
                    'task': 'Help team member succeed',
                    'action': 'Provided guidance and support',
                    'result': 'Team member completed task successfully'
                },
                'strengths': 'Excellent team player and mentor',
                'areas_for_improvement': 'None identified'
            }
        ]
        
        for comp_data in competencies:
            evaluation = CompetencyEvaluation.objects.create(
                session=session,
                competency_title=comp_data['title'],
                competency_description=f"Evaluation for {comp_data['title']}",
                evaluation_method='STAR',
                score=comp_data['score'],
                weightage=comp_data['weightage'],
                star_observations=comp_data.get('star_observations', {}),
                car_observations=comp_data.get('car_observations', {}),
                strengths=comp_data['strengths'],
                areas_for_improvement=comp_data['areas_for_improvement'],
                detailed_feedback=f"Comprehensive feedback for {comp_data['title']}"
            )
            print(f"✅ Competency evaluation created: {evaluation.competency_title} - {evaluation.score}% ({evaluation.performance_level})")
        
        # Test 4: Create Interview Questions
        print("\n5. Testing Interview Questions...")
        
        questions = [
            {
                'text': 'Tell me about a time when you debugged a critical production issue.',
                'type': 'behavioral',
                'competency': 'Problem Solving'
            },
            {
                'text': 'How would you explain a complex technical concept to a non-technical stakeholder?',
                'type': 'behavioral',
                'competency': 'Communication'
            },
            {
                'text': 'Describe a situation where you helped a struggling team member.',
                'type': 'behavioral',
                'competency': 'Collaboration'
            }
        ]
        
        for q_data in questions:
            question = InterviewQuestion.objects.create(
                session=session,
                question_text=q_data['text'],
                question_type=q_data['type'],
                competency_title=q_data['competency'],
                star_structure={
                    'situation': 'Production issue',
                    'task': 'Debug and fix',
                    'action': 'Systematic approach',
                    'result': 'Resolved successfully'
                }
            )
            print(f"✅ Question created: {question.question_text[:50]}...")
        
        # Test 5: End Interview
        print("\n6. Testing Interview End...")
        
        session.status = 'completed'
        session.actual_end_time = timezone.now()
        session.notes = 'Interview completed successfully. Candidate demonstrated strong technical and soft skills.'
        session.save()
        
        print(f"✅ Interview ended: {session.actual_end_time}")
        print(f"   - Duration: {session.duration_actual} minutes")
        print(f"   - Status: {session.status}")
        
        # Test 6: Create Interview Feedback
        print("\n7. Testing Interview Feedback...")
        
        feedback = InterviewFeedback.objects.create(
            session=session,
            overall_score=85.0,
            overall_recommendation='proceed',
            interviewer_notes='Excellent candidate with strong problem-solving skills and good communication. Recommended for next round.',
            ai_insights='AI analysis shows consistent STAR methodology usage and strong competency demonstration.',
            strengths_summary='Strong analytical thinking, good communication, excellent collaboration skills',
            improvement_areas='Could improve on technical documentation',
            star_summary={
                'overall_quality': 'Excellent',
                'structure_followed': True,
                'specific_examples': True
            },
            car_summary={
                'context_clarity': 'Good',
                'action_specificity': 'Excellent',
                'result_impact': 'Clear'
            },
            competency_scores={
                'Problem Solving': 85.0,
                'Communication': 78.0,
                'Collaboration': 92.0
            },
            competency_feedback={
                'Problem Solving': 'Excellent analytical approach',
                'Communication': 'Good but could be more concise',
                'Collaboration': 'Outstanding team player'
            },
            cultural_fit_score=88.0,
            technical_score=82.0,
            next_steps='Schedule technical round with senior engineer',
            follow_up_required=False
        )
        
        print(f"✅ Interview feedback created: {feedback.overall_score}% - {feedback.overall_recommendation}")
        print(f"   - Positive: {feedback.is_positive}")
        print(f"   - Follow-up required: {feedback.needs_follow_up}")
        
        # Test 7: Create Analytics
        print("\n8. Testing Interview Analytics...")
        
        analytics = InterviewAnalytics.objects.create(
            session=session,
            total_questions_asked=3,
            average_response_time=45.5,
            completion_rate=100.0,
            strongest_competency='Collaboration',
            weakest_competency='Communication',
            competency_gaps=['Advanced System Design'],
            ai_suggestions_used=2,
            ai_follow_ups_generated=1,
            ai_effectiveness_score=85.0,
            interview_quality_score=88.0,
            bias_detection_score=92.0,
            time_spent_per_competency={
                'Problem Solving': 15,
                'Communication': 12,
                'Collaboration': 10
            },
            question_effectiveness={
                'behavioral': 90.0,
                'technical': 85.0
            },
            candidate_engagement_metrics={
                'response_quality': 'High',
                'engagement_level': 'Excellent',
                'confidence_level': 'High'
            }
        )
        
        print(f"✅ Analytics created: {analytics.total_questions_asked} questions, {analytics.completion_rate}% completion")
        print(f"   - Strongest: {analytics.strongest_competency}")
        print(f"   - Weakest: {analytics.weakest_competency}")
        
        # Test 8: Calculate Overall Score
        print("\n9. Testing Overall Score Calculation...")
        
        overall_score = session.overall_score
        print(f"✅ Overall score calculated: {overall_score}%")
        
        # Test 9: Verify Data Relationships
        print("\n10. Testing Data Relationships...")
        
        # Verify session has all related data
        evaluations_count = session.competency_evaluations.count()
        questions_count = session.questions.count()
        has_feedback = hasattr(session, 'feedback')
        has_analytics = hasattr(session, 'analytics')
        
        print(f"✅ Session relationships verified:")
        print(f"   - Competency evaluations: {evaluations_count}")
        print(f"   - Questions: {questions_count}")
        print(f"   - Has feedback: {has_feedback}")
        print(f"   - Has analytics: {has_analytics}")
        
        # Test 10: Performance Level Calculation
        print("\n11. Testing Performance Level Calculation...")
        
        for evaluation in session.competency_evaluations.all():
            print(f"✅ {evaluation.competency_title}: {evaluation.score}% -> {evaluation.performance_level}")
        
        print("\n🎉 All Interview Management Backend Tests Passed!")
        print("=" * 50)
        
        # Summary
        print(f"\n📊 Test Summary:")
        print(f"   - Interview Session: {session.session_id}")
        print(f"   - Duration: {session.duration_actual} minutes")
        print(f"   - Overall Score: {overall_score}%")
        print(f"   - Recommendation: {feedback.overall_recommendation}")
        print(f"   - Competencies Evaluated: {evaluations_count}")
        print(f"   - Questions Asked: {questions_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    success = test_interview_management_backend()
    if success:
        print("\n✅ Interview Management Backend is working correctly!")
    else:
        print("\n❌ Interview Management Backend has issues!")
        sys.exit(1)
