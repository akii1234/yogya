from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
import json
import logging

from .models import Interview, InterviewSession, AIInterviewAssistant, Interviewer, InterviewFeedback
from .services import AIInterviewService
from competency_hiring.models import CompetencyFramework, InterviewTemplate
from resume_checker.models import Candidate
from hiring_manager.models import JobPosting

logger = logging.getLogger(__name__)


# ============================================================================
# INTERVIEW PREPARATION & AI ASSISTANCE
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def prepare_interview_with_ai(request):
    """
    Prepare an interview with AI-generated questions and materials
    """
    try:
        interview_id = request.data.get('interview_id')
        if not interview_id:
            return Response({'error': 'interview_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize AI service
        ai_service = AIInterviewService()
        
        # Prepare interview with AI
        result = ai_service.prepare_interview(interview_id)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error preparing interview with AI: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_candidate_response(request):
    """
    Analyze candidate response using AI
    """
    try:
        interview_id = request.data.get('interview_id')
        question_id = request.data.get('question_id')
        response = request.data.get('response')
        
        if not all([interview_id, question_id, response]):
            return Response({'error': 'interview_id, question_id, and response are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize AI service
        ai_service = AIInterviewService()
        
        # Analyze response
        result = ai_service.analyze_response(interview_id, question_id, response)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error analyzing candidate response: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_followup_questions(request):
    """
    Generate follow-up questions based on response analysis
    """
    try:
        interview_id = request.data.get('interview_id')
        question_id = request.data.get('question_id')
        response_analysis = request.data.get('response_analysis', {})
        
        if not all([interview_id, question_id]):
            return Response({'error': 'interview_id and question_id are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize AI service
        ai_service = AIInterviewService()
        
        # Generate follow-up questions
        questions = ai_service.generate_followup_questions(interview_id, question_id, response_analysis)
        
        return Response({
            'success': True,
            'followup_questions': questions,
            'total_questions': len(questions)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error generating follow-up questions: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# INTERVIEW SESSION MANAGEMENT
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_interview_session(request):
    """
    Create a real-time interview session
    """
    try:
        interview_id = request.data.get('interview_id')
        if not interview_id:
            return Response({'error': 'interview_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize AI service
        ai_service = AIInterviewService()
        
        # Create session
        result = ai_service.create_interview_session(interview_id)
        
        if result['success']:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error creating interview session: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_interview_session(request):
    """
    End an interview session and generate summary
    """
    try:
        session_id = request.data.get('session_id')
        if not session_id:
            return Response({'error': 'session_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize AI service
        ai_service = AIInterviewService()
        
        # End session
        result = ai_service.end_interview_session(session_id)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error ending interview session: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_session(request, session_id):
    """
    Get interview session details
    """
    try:
        session = get_object_or_404(InterviewSession, session_id=session_id)
        
        return Response({
            'session_id': session.session_id,
            'interview_id': str(session.interview.id),
            'start_time': session.start_time,
            'end_time': session.end_time,
            'is_active': session.is_active,
            'current_phase': session.current_phase,
            'interviewer_joined': session.interviewer_joined,
            'candidate_joined': session.candidate_joined,
            'ai_assistant_active': session.ai_assistant_active,
            'question_history': session.question_history,
            'response_history': session.response_history,
            'ai_suggestions': session.ai_suggestions
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting interview session: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_session_phase(request, session_id):
    """
    Update the current phase of an interview session
    """
    try:
        session = get_object_or_404(InterviewSession, session_id=session_id)
        new_phase = request.data.get('phase')
        
        if new_phase not in dict(InterviewSession._meta.get_field('current_phase').choices):
            return Response({'error': 'Invalid phase'}, status=status.HTTP_400_BAD_REQUEST)
        
        session.current_phase = new_phase
        session.save()
        
        return Response({
            'success': True,
            'session_id': session_id,
            'current_phase': new_phase
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error updating session phase: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# INTERVIEWER MANAGEMENT
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interviewer_profile(request, interviewer_id):
    """
    Get interviewer profile and AI preferences
    """
    try:
        interviewer = get_object_or_404(Interviewer, id=interviewer_id)
        
        return Response({
            'id': str(interviewer.id),
            'user': {
                'id': interviewer.user.id,
                'name': interviewer.user.get_full_name(),
                'email': interviewer.user.email
            },
            'company': interviewer.company,
            'department': interviewer.department,
            'title': interviewer.title,
            'phone': interviewer.phone,
            'technical_skills': interviewer.technical_skills,
            'interview_types': interviewer.interview_types,
            'experience_years': interviewer.experience_years,
            'ai_preferences': {
                'ai_assistance_enabled': interviewer.ai_assistance_enabled,
                'ai_question_suggestions': interviewer.ai_question_suggestions,
                'ai_response_analysis': interviewer.ai_response_analysis,
                'ai_followup_suggestions': interviewer.ai_followup_suggestions
            },
            'availability': {
                'is_active': interviewer.is_active,
                'max_interviews_per_week': interviewer.max_interviews_per_week
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting interviewer profile: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_interviewer_ai_preferences(request, interviewer_id):
    """
    Update AI collaboration preferences for an interviewer
    """
    try:
        preferences = request.data.get('preferences', {})
        
        # Initialize AI service
        ai_service = AIInterviewService()
        
        # Update preferences
        result = ai_service.update_interviewer_ai_preferences(interviewer_id, preferences)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Error updating interviewer preferences: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interviewer_schedule(request, interviewer_id):
    """
    Get interviewer's interview schedule
    """
    try:
        interviewer = get_object_or_404(Interviewer, id=interviewer_id)
        
        # Get upcoming interviews
        upcoming_interviews = Interview.objects.filter(
            interviewer=interviewer,
            scheduled_date__gte=timezone.now(),
            status__in=['scheduled', 'ai_prep']
        ).select_related('candidate', 'job_posting').order_by('scheduled_date')
        
        interviews_data = []
        for interview in upcoming_interviews:
            interviews_data.append({
                'id': str(interview.id),
                'candidate_name': interview.candidate.user.get_full_name(),
                'job_title': interview.job_posting.title,
                'interview_type': interview.interview_type,
                'ai_mode': interview.ai_mode,
                'scheduled_date': interview.scheduled_date,
                'duration_minutes': interview.duration_minutes,
                'status': interview.status
            })
        
        return Response({
            'interviewer_id': str(interviewer.id),
            'upcoming_interviews': interviews_data,
            'total_interviews': len(interviews_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting interviewer schedule: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# INTERVIEW MANAGEMENT
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_details(request, interview_id):
    """
    Get detailed interview information including AI-generated content
    """
    try:
        interview = get_object_or_404(Interview, id=interview_id)
        
        return Response({
            'id': str(interview.id),
            'candidate': {
                'id': str(interview.candidate.id),
                'name': interview.candidate.user.get_full_name(),
                'email': interview.candidate.user.email
            },
            'job_posting': {
                'id': str(interview.job_posting.id),
                'title': interview.job_posting.title,
                'company': interview.job_posting.company
            },
            'interviewer': {
                'id': str(interview.interviewer.id),
                'name': interview.interviewer.user.get_full_name()
            },
            'interview_details': {
                'type': interview.interview_type,
                'ai_mode': interview.ai_mode,
                'scheduled_date': interview.scheduled_date,
                'duration_minutes': interview.duration_minutes,
                'status': interview.status,
                'is_live': interview.is_live
            },
            'competency_framework': {
                'id': str(interview.competency_framework.id),
                'name': interview.competency_framework.name
            } if interview.competency_framework else None,
            'ai_content': {
                'generated_questions': interview.ai_generated_questions,
                'response_analysis': interview.ai_response_analysis,
                'followup_suggestions': interview.ai_followup_suggestions,
                'interview_summary': interview.ai_interview_summary
            },
            'evaluation': {
                'technical_score': interview.technical_score,
                'communication_score': interview.communication_score,
                'problem_solving_score': interview.problem_solving_score,
                'cultural_fit_score': interview.cultural_fit_score,
                'overall_score': interview.overall_score,
                'competency_scores': interview.competency_scores
            },
            'recommendation': {
                'ai_recommendation': interview.ai_recommendation,
                'human_recommendation': interview.recommendation,
                'human_override': interview.human_override,
                'override_reason': interview.override_reason
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting interview details: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_interview_evaluation(request, interview_id):
    """
    Update interview evaluation scores and feedback
    """
    try:
        interview = get_object_or_404(Interview, id=interview_id)
        
        # Update scores
        if 'technical_score' in request.data:
            interview.technical_score = request.data['technical_score']
        if 'communication_score' in request.data:
            interview.communication_score = request.data['communication_score']
        if 'problem_solving_score' in request.data:
            interview.problem_solving_score = request.data['problem_solving_score']
        if 'cultural_fit_score' in request.data:
            interview.cultural_fit_score = request.data['cultural_fit_score']
        
        # Update competency scores
        if 'competency_scores' in request.data:
            interview.competency_scores = request.data['competency_scores']
        
        # Update recommendation
        if 'recommendation' in request.data:
            interview.recommendation = request.data['recommendation']
        
        # Update feedback
        if 'strengths' in request.data:
            interview.strengths = request.data['strengths']
        if 'areas_of_improvement' in request.data:
            interview.areas_of_improvement = request.data['areas_of_improvement']
        if 'general_feedback' in request.data:
            interview.general_feedback = request.data['general_feedback']
        
        # Update status
        if 'status' in request.data:
            interview.status = request.data['status']
        
        interview.save()
        
        return Response({
            'success': True,
            'interview_id': str(interview.id),
            'evaluation_updated': True
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error updating interview evaluation: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def override_ai_recommendation(request, interview_id):
    """
    Override AI recommendation with human decision
    """
    try:
        interview = get_object_or_404(Interview, id=interview_id)
        
        human_recommendation = request.data.get('recommendation')
        override_reason = request.data.get('reason', '')
        
        if not human_recommendation:
            return Response({'error': 'recommendation is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update interview
        interview.recommendation = human_recommendation
        interview.human_override = True
        interview.override_reason = override_reason
        interview.save()
        
        return Response({
            'success': True,
            'interview_id': str(interview.id),
            'ai_recommendation': interview.ai_recommendation,
            'human_recommendation': interview.recommendation,
            'override_reason': interview.override_reason
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error overriding AI recommendation: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# AI ASSISTANT MANAGEMENT
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ai_assistants(request):
    """
    Get list of available AI assistants
    """
    try:
        assistants = AIInterviewAssistant.objects.filter(is_active=True)
        
        assistants_data = []
        for assistant in assistants:
            assistants_data.append({
                'id': str(assistant.id),
                'name': assistant.name,
                'description': assistant.description,
                'ai_model': assistant.ai_model,
                'ai_provider': assistant.ai_provider,
                'personality': assistant.assistant_personality,
                'features': {
                    'question_generation': assistant.question_generation_enabled,
                    'response_analysis': assistant.response_analysis_enabled,
                    'followup_suggestions': assistant.followup_suggestions_enabled,
                    'bias_detection': assistant.bias_detection_enabled
                }
            })
        
        return Response({
            'assistants': assistants_data,
            'total_assistants': len(assistants_data)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting AI assistants: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_ai_assistant(request):
    """
    Create a new AI assistant configuration
    """
    try:
        with transaction.atomic():
            assistant = AIInterviewAssistant.objects.create(
                name=request.data.get('name'),
                description=request.data.get('description', ''),
                ai_model=request.data.get('ai_model', 'gemini-pro'),
                ai_provider=request.data.get('ai_provider', 'gemini'),
                assistant_personality=request.data.get('personality', 'professional'),
                question_generation_enabled=request.data.get('question_generation', True),
                response_analysis_enabled=request.data.get('response_analysis', True),
                followup_suggestions_enabled=request.data.get('followup_suggestions', True),
                bias_detection_enabled=request.data.get('bias_detection', True),
                question_generation_prompt=request.data.get('question_prompt', ''),
                response_analysis_prompt=request.data.get('analysis_prompt', ''),
                followup_prompt=request.data.get('followup_prompt', '')
            )
            
            return Response({
                'success': True,
                'assistant_id': str(assistant.id),
                'assistant_created': True
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        logger.error(f"Error creating AI assistant: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
# ANALYTICS & REPORTING
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interviewer_analytics(request, interviewer_id):
    """
    Get analytics for an interviewer
    """
    try:
        interviewer = get_object_or_404(Interviewer, id=interviewer_id)
        
        # Get interview statistics
        total_interviews = Interview.objects.filter(interviewer=interviewer).count()
        completed_interviews = Interview.objects.filter(interviewer=interviewer, status='completed').count()
        ai_assisted_interviews = Interview.objects.filter(
            interviewer=interviewer, 
            ai_mode__in=['ai_assisted', 'ai_co_pilot', 'ai_lead']
        ).count()
        
        # Get average scores
        avg_scores = Interview.objects.filter(
            interviewer=interviewer, 
            status='completed',
            overall_score__isnull=False
        ).aggregate(
            avg_technical=models.Avg('technical_score'),
            avg_communication=models.Avg('communication_score'),
            avg_problem_solving=models.Avg('problem_solving_score'),
            avg_cultural_fit=models.Avg('cultural_fit_score'),
            avg_overall=models.Avg('overall_score')
        )
        
        return Response({
            'interviewer_id': str(interviewer.id),
            'statistics': {
                'total_interviews': total_interviews,
                'completed_interviews': completed_interviews,
                'ai_assisted_interviews': ai_assisted_interviews,
                'completion_rate': (completed_interviews / total_interviews * 100) if total_interviews > 0 else 0
            },
            'average_scores': avg_scores,
            'ai_usage': {
                'ai_assistance_enabled': interviewer.ai_assistance_enabled,
                'ai_question_suggestions': interviewer.ai_question_suggestions,
                'ai_response_analysis': interviewer.ai_response_analysis,
                'ai_followup_suggestions': interviewer.ai_followup_suggestions
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting interviewer analytics: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_analytics(request):
    """
    Get overall interview analytics
    """
    try:
        # Get overall statistics
        total_interviews = Interview.objects.count()
        completed_interviews = Interview.objects.filter(status='completed').count()
        ai_assisted_interviews = Interview.objects.filter(
            ai_mode__in=['ai_assisted', 'ai_co_pilot', 'ai_lead']
        ).count()
        
        # Get AI vs Human recommendation comparison
        ai_recommendations = Interview.objects.filter(
            status='completed',
            ai_recommendation__isnull=False
        ).values('ai_recommendation').annotate(count=models.Count('id'))
        
        human_recommendations = Interview.objects.filter(
            status='completed',
            recommendation__isnull=False
        ).values('recommendation').annotate(count=models.Count('id'))
        
        # Get average scores by interview type
        avg_scores_by_type = Interview.objects.filter(
            status='completed',
            overall_score__isnull=False
        ).values('interview_type').annotate(
            avg_score=models.Avg('overall_score'),
            count=models.Count('id')
        )
        
        return Response({
            'overall_statistics': {
                'total_interviews': total_interviews,
                'completed_interviews': completed_interviews,
                'ai_assisted_interviews': ai_assisted_interviews,
                'completion_rate': (completed_interviews / total_interviews * 100) if total_interviews > 0 else 0,
                'ai_usage_rate': (ai_assisted_interviews / total_interviews * 100) if total_interviews > 0 else 0
            },
            'ai_recommendations': list(ai_recommendations),
            'human_recommendations': list(human_recommendations),
            'average_scores_by_type': list(avg_scores_by_type)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting interview analytics: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
