import logging
from django.utils import timezone
from django.db.models import Q, Avg, Count, Sum
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import (
    InterviewSession, 
    CompetencyEvaluation, 
    InterviewFeedback, 
    InterviewQuestion, 
    InterviewAnalytics,
    InterviewRoom,
    RoomParticipant,
    ChatMessage,
    InterviewRecording
)
from .serializers import (
    InterviewSessionSerializer,
    InterviewSessionDetailSerializer,
    CompetencyEvaluationSerializer,
    InterviewFeedbackSerializer,
    InterviewQuestionSerializer,
    InterviewAnalyticsSerializer,
    StartInterviewSerializer,
    EndInterviewSerializer,
    CompetencyScoreSerializer,
    SubmitFeedbackSerializer,
    InterviewAnalyticsRequestSerializer,
    InterviewAnalyticsResponseSerializer,
    InterviewRoomSerializer,
    RoomParticipantSerializer,
    ChatMessageSerializer,
    InterviewRecordingSerializer
)
from .services import InterviewFlowService, CompetencyFrameworkService, QuestionGenerationService

logger = logging.getLogger(__name__)


# Interview Session Management
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_sessions(request):
    """Get all interview sessions for the authenticated user"""
    try:
        user = request.user
        
        # Filter based on user role
        if user.role in ['hr', 'hiring_manager', 'admin']:
            # HR can see all interviews
            sessions = InterviewSession.objects.all()
        elif user.role == 'interviewer':
            # Interviewer can see their own interviews
            sessions = InterviewSession.objects.filter(interviewer=user)
        elif user.role == 'candidate':
            # Candidate can see their own interviews
            sessions = InterviewSession.objects.filter(candidate__user=user)
        else:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Apply filters
        status_filter = request.GET.get('status')
        if status_filter:
            sessions = sessions.filter(status=status_filter)
        
        interview_type = request.GET.get('interview_type')
        if interview_type:
            sessions = sessions.filter(interview_type=interview_type)
        
        # Pagination
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 10))
        start = (page - 1) * page_size
        end = start + page_size
        
        sessions = sessions[start:end]
        
        serializer = InterviewSessionSerializer(sessions, many=True)
        
        return Response({
            'success': True,
            'sessions': serializer.data,
            'total_count': InterviewSession.objects.count(),
            'page': page,
            'page_size': page_size
        })
        
    except Exception as e:
        logger.error(f"Error in get_interview_sessions: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_session_detail(request, session_id):
    """Get detailed interview session with all related data"""
    try:
        session = get_object_or_404(InterviewSession, session_id=session_id)
        
        # Check permissions
        user = request.user
        if user.role not in ['hr', 'hiring_manager', 'admin']:
            if user.role == 'interviewer' and session.interviewer != user:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            elif user.role == 'candidate' and session.candidate.user != user:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = InterviewSessionDetailSerializer(session)
        
        return Response({
            'success': True,
            'session': serializer.data
        })
        
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Interview session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_interview_session_detail: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_interview(request):
    """Start an interview session"""
    try:
        serializer = StartInterviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        session_id = serializer.validated_data['session_id']
        session = InterviewSession.objects.get(session_id=session_id)
        
        # Check if user is the interviewer
        if session.interviewer != request.user:
            return Response({'error': 'Only the assigned interviewer can start the interview'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Update session status
        session.status = 'in_progress'
        session.actual_start_time = timezone.now()
        session.save()
        
        # Create analytics record if it doesn't exist
        InterviewAnalytics.objects.get_or_create(session=session)
        
        return Response({
            'success': True,
            'message': 'Interview started successfully',
            'session_id': session_id,
            'start_time': session.actual_start_time
        })
        
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Interview session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in start_interview: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def end_interview(request):
    """End an interview session"""
    try:
        serializer = EndInterviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        session_id = serializer.validated_data['session_id']
        session = InterviewSession.objects.get(session_id=session_id)
        
        # Check if user is the interviewer
        if session.interviewer != request.user:
            return Response({'error': 'Only the assigned interviewer can end the interview'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Update session
        session.status = 'completed'
        session.actual_end_time = timezone.now()
        session.notes = serializer.validated_data.get('notes', '')
        session.recording_url = serializer.validated_data.get('recording_url', '')
        session.transcription = serializer.validated_data.get('transcription', '')
        session.save()
        
        return Response({
            'success': True,
            'message': 'Interview ended successfully',
            'session_id': session_id,
            'end_time': session.actual_end_time,
            'duration_actual': session.duration_actual
        })
        
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Interview session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in end_interview: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Competency Scoring API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_competency_score(request, session_id):
    """Submit competency score with STAR/CAR methodology"""
    try:
        session = get_object_or_404(InterviewSession, session_id=session_id)
        
        # Check if user is the interviewer
        if session.interviewer != request.user:
            return Response({'error': 'Only the assigned interviewer can submit scores'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = CompetencyScoreSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Create or update competency evaluation
        evaluation, created = CompetencyEvaluation.objects.get_or_create(
            session=session,
            competency_title=data['competency_title'],
            defaults={
                'competency_description': f"Evaluation for {data['competency_title']}",
                'evaluation_method': 'STAR',
                'score': data['score'],
                'weightage': 20.0,  # Default weightage, can be customized
                'star_observations': data.get('star_observations', {}),
                'car_observations': data.get('car_observations', {}),
                'strengths': data.get('strengths', ''),
                'areas_for_improvement': data.get('areas_for_improvement', ''),
                'detailed_feedback': data.get('detailed_feedback', ''),
                'criteria_scores': data.get('criteria_scores', {}),
                'criteria_feedback': data.get('criteria_feedback', {})
            }
        )
        
        if not created:
            # Update existing evaluation
            evaluation.score = data['score']
            evaluation.star_observations = data.get('star_observations', evaluation.star_observations)
            evaluation.car_observations = data.get('car_observations', evaluation.car_observations)
            evaluation.strengths = data.get('strengths', evaluation.strengths)
            evaluation.areas_for_improvement = data.get('areas_for_improvement', evaluation.areas_for_improvement)
            evaluation.detailed_feedback = data.get('detailed_feedback', evaluation.detailed_feedback)
            evaluation.criteria_scores = data.get('criteria_scores', evaluation.criteria_scores)
            evaluation.criteria_feedback = data.get('criteria_feedback', evaluation.criteria_feedback)
            evaluation.save()
        
        return Response({
            'success': True,
            'message': 'Competency score submitted successfully',
            'evaluation_id': evaluation.id,
            'score': evaluation.score,
            'performance_level': evaluation.performance_level
        })
        
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Interview session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in submit_competency_score: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_competency_evaluations(request, session_id):
    """Get all competency evaluations for an interview session"""
    try:
        session = get_object_or_404(InterviewSession, session_id=session_id)
        
        # Check permissions
        user = request.user
        if user.role not in ['hr', 'hiring_manager', 'admin']:
            if user.role == 'interviewer' and session.interviewer != user:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            elif user.role == 'candidate' and session.candidate.user != user:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        evaluations = session.competency_evaluations.all()
        serializer = CompetencyEvaluationSerializer(evaluations, many=True)
        
        return Response({
            'success': True,
            'evaluations': serializer.data,
            'overall_score': session.overall_score
        })
        
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Interview session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_competency_evaluations: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Interview Feedback API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_interview_feedback(request, session_id):
    """Submit complete interview feedback"""
    try:
        session = get_object_or_404(InterviewSession, session_id=session_id)
        
        # Check if user is the interviewer
        if session.interviewer != request.user:
            return Response({'error': 'Only the assigned interviewer can submit feedback'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = SubmitFeedbackSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Create or update feedback
        feedback, created = InterviewFeedback.objects.get_or_create(
            session=session,
            defaults={
                'overall_score': data['overall_score'],
                'overall_recommendation': data['overall_recommendation'],
                'interviewer_notes': data.get('interviewer_notes', ''),
                'ai_insights': data.get('ai_insights', ''),
                'strengths_summary': data.get('strengths_summary', ''),
                'improvement_areas': data.get('improvement_areas', ''),
                'star_summary': data.get('star_summary', {}),
                'car_summary': data.get('car_summary', {}),
                'competency_scores': data.get('competency_scores', {}),
                'competency_feedback': data.get('competency_feedback', {}),
                'cultural_fit_score': data.get('cultural_fit_score'),
                'values_alignment': data.get('values_alignment', {}),
                'technical_score': data.get('technical_score'),
                'technical_feedback': data.get('technical_feedback', ''),
                'next_steps': data.get('next_steps', ''),
                'follow_up_required': data.get('follow_up_required', False),
                'follow_up_notes': data.get('follow_up_notes', '')
            }
        )
        
        if not created:
            # Update existing feedback
            for field, value in data.items():
                setattr(feedback, field, value)
            feedback.save()
        
        return Response({
            'success': True,
            'message': 'Interview feedback submitted successfully',
            'feedback_id': feedback.id,
            'overall_score': feedback.overall_score,
            'recommendation': feedback.overall_recommendation
        })
        
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Interview session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in submit_interview_feedback: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_feedback(request, session_id):
    """Get interview feedback for a session"""
    try:
        session = get_object_or_404(InterviewSession, session_id=session_id)
        
        # Check permissions
        user = request.user
        if user.role not in ['hr', 'hiring_manager', 'admin']:
            if user.role == 'interviewer' and session.interviewer != user:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            elif user.role == 'candidate' and session.candidate.user != user:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            feedback = session.feedback
            serializer = InterviewFeedbackSerializer(feedback)
            
            return Response({
                'success': True,
                'feedback': serializer.data
            })
        except InterviewFeedback.DoesNotExist:
            return Response({
                'success': True,
                'feedback': None,
                'message': 'No feedback submitted yet'
            })
        
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Interview session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_interview_feedback: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Interview Questions API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ask_question(request, session_id):
    """Ask a question during interview"""
    try:
        session = get_object_or_404(InterviewSession, session_id=session_id)
        
        # Check if user is the interviewer
        if session.interviewer != request.user:
            return Response({'error': 'Only the assigned interviewer can ask questions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        serializer = InterviewQuestionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Create question
        question = InterviewQuestion.objects.create(
            session=session,
            question_text=data['question_text'],
            question_type=data['question_type'],
            competency_title=data.get('competency_title', ''),
            star_structure=data.get('star_structure', {}),
            car_structure=data.get('car_structure', {})
        )
        
        # Update analytics
        analytics, created = InterviewAnalytics.objects.get_or_create(session=session)
        analytics.total_questions_asked += 1
        analytics.save()
        
        return Response({
            'success': True,
            'message': 'Question asked successfully',
            'question_id': question.id,
            'question_text': question.question_text
        })
        
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Interview session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in ask_question: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_response(request, question_id):
    """Submit candidate response to a question"""
    try:
        question = get_object_or_404(InterviewQuestion, id=question_id)
        
        # Check if user is the candidate
        if question.session.candidate.user != request.user:
            return Response({'error': 'Only the candidate can submit responses'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        response = request.data.get('response', '')
        response_duration = request.data.get('response_duration_seconds')
        
        # Update question with response
        question.candidate_response = response
        question.response_duration_seconds = response_duration
        question.answered_at = timezone.now()
        question.save()
        
        return Response({
            'success': True,
            'message': 'Response submitted successfully',
            'question_id': question.id
        })
        
    except InterviewQuestion.DoesNotExist:
        return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in submit_response: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Competency Questions Screen API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_competency_questions_screen(request, session_id):
    """Get competency questions screen data for interview"""
    try:
        session = get_object_or_404(InterviewSession, session_id=session_id)
        
        # Check if user is the interviewer
        if session.interviewer != request.user:
            return Response({'error': 'Only the assigned interviewer can access this screen'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Initialize services
        flow_service = InterviewFlowService()
        
        # Prepare interview session with competency questions
        interview_data = flow_service.prepare_interview_session(session)
        
        return Response({
            'success': True,
            'interview_data': interview_data
        })
        
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Interview session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_competency_questions_screen: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_question_answered(request, session_id):
    """Mark a question as answered during interview"""
    try:
        session = get_object_or_404(InterviewSession, session_id=session_id)
        
        # Check if user is the interviewer
        if session.interviewer != request.user:
            return Response({'error': 'Only the assigned interviewer can mark questions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        question_id = request.data.get('question_id')
        if not question_id:
            return Response({'error': 'question_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize services
        flow_service = InterviewFlowService()
        
        # Mark question as answered
        success = flow_service.mark_question_answered(question_id, session_id)
        
        if success:
            return Response({
                'success': True,
                'message': 'Question marked as answered'
            })
        else:
            return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)
        
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Interview session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in mark_question_answered: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def score_competency_live(request, session_id):
    """Score a competency during live interview"""
    try:
        session = get_object_or_404(InterviewSession, session_id=session_id)
        
        # Check if user is the interviewer
        if session.interviewer != request.user:
            return Response({'error': 'Only the assigned interviewer can score competencies'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        competency_title = request.data.get('competency_title')
        score = request.data.get('score')
        star_observations = request.data.get('star_observations')
        car_observations = request.data.get('car_observations')
        
        if not competency_title or score is None:
            return Response({'error': 'competency_title and score are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize services
        flow_service = InterviewFlowService()
        
        # Score competency
        success = flow_service.score_competency(
            session_id, 
            competency_title, 
            score, 
            star_observations, 
            car_observations
        )
        
        if success:
            return Response({
                'success': True,
                'message': f'Competency {competency_title} scored successfully',
                'score': score
            })
        else:
            return Response({'error': 'Failed to score competency'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Interview session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in score_competency_live: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_follow_up_question(request, session_id):
    """Add a follow-up question during interview"""
    try:
        session = get_object_or_404(InterviewSession, session_id=session_id)
        
        # Check if user is the interviewer
        if session.interviewer != request.user:
            return Response({'error': 'Only the assigned interviewer can add questions'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        competency_title = request.data.get('competency_title')
        question_text = request.data.get('question_text')
        question_type = request.data.get('question_type', 'behavioral')
        
        if not competency_title or not question_text:
            return Response({'error': 'competency_title and question_text are required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Initialize services
        flow_service = InterviewFlowService()
        
        # Add follow-up question
        question_data = flow_service.add_follow_up_question(
            session_id, 
            competency_title, 
            question_text, 
            question_type
        )
        
        if question_data:
            return Response({
                'success': True,
                'message': 'Follow-up question added successfully',
                'question': question_data
            })
        else:
            return Response({'error': 'Failed to add follow-up question'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Interview session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in add_follow_up_question: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_progress(request, session_id):
    """Get interview progress and current status"""
    try:
        session = get_object_or_404(InterviewSession, session_id=session_id)
        
        # Check permissions
        user = request.user
        if user.role not in ['hr', 'hiring_manager', 'admin']:
            if user.role == 'interviewer' and session.interviewer != user:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
            elif user.role == 'candidate' and session.candidate.user != user:
                return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get competency evaluations
        evaluations = session.competency_evaluations.all()
        competency_scores = {}
        total_score = 0
        total_weight = 0
        
        for evaluation in evaluations:
            competency_scores[evaluation.competency_title] = {
                'score': float(evaluation.score),
                'weightage': float(evaluation.weightage),
                'performance_level': evaluation.performance_level,
                'weighted_score': float(evaluation.weighted_score)
            }
            total_score += float(evaluation.score) * float(evaluation.weightage)
            total_weight += float(evaluation.weightage)
        
        overall_score = (total_score / total_weight) if total_weight > 0 else 0
        
        # Get questions progress
        questions = session.questions.all()
        answered_questions = questions.filter(answered_at__isnull=False).count()
        total_questions = questions.count()
        
        progress_data = {
            'session_id': session.session_id,
            'status': session.status,
            'overall_score': round(overall_score, 2),
            'competency_scores': competency_scores,
            'questions_progress': {
                'answered': answered_questions,
                'total': total_questions,
                'percentage': round((answered_questions / total_questions * 100) if total_questions > 0 else 0, 2)
            },
            'duration': session.duration_actual,
            'ai_enabled': session.ai_enabled,
            'ai_mode': session.ai_mode
        }
        
        return Response({
            'success': True,
            'progress': progress_data
        })
        
    except InterviewSession.DoesNotExist:
        return Response({'error': 'Interview session not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error in get_interview_progress: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Analytics API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interview_analytics(request):
    """Get interview analytics and insights"""
    try:
        user = request.user
        
        # Filter based on user role
        if user.role in ['hr', 'hiring_manager', 'admin']:
            sessions = InterviewSession.objects.all()
        elif user.role == 'interviewer':
            sessions = InterviewSession.objects.filter(interviewer=user)
        else:
            return Response({'error': 'Unauthorized'}, status=status.HTTP_403_FORBIDDEN)
        
        # Apply filters
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        interviewer_id = request.GET.get('interviewer_id')
        job_id = request.GET.get('job_id')
        interview_type = request.GET.get('interview_type')
        
        if date_from:
            sessions = sessions.filter(scheduled_date__date__gte=date_from)
        if date_to:
            sessions = sessions.filter(scheduled_date__date__lte=date_to)
        if interviewer_id:
            sessions = sessions.filter(interviewer_id=interviewer_id)
        if job_id:
            sessions = sessions.filter(job_description__job_id=job_id)
        if interview_type:
            sessions = sessions.filter(interview_type=interview_type)
        
        # Calculate analytics
        total_interviews = sessions.count()
        completed_interviews = sessions.filter(status='completed').count()
        
        # Average scores
        completed_sessions = sessions.filter(status='completed')
        avg_score = completed_sessions.aggregate(avg_score=Avg('overall_score'))['avg_score'] or 0
        
        # Completion rate
        completion_rate = (completed_interviews / total_interviews * 100) if total_interviews > 0 else 0
        
        # Average duration
        avg_duration = completed_sessions.aggregate(avg_duration=Avg('duration_actual'))['avg_duration'] or 0
        
        # Competency breakdown
        competency_breakdown = {}
        evaluations = CompetencyEvaluation.objects.filter(session__in=completed_sessions)
        for evaluation in evaluations:
            competency = evaluation.competency_title
            if competency not in competency_breakdown:
                competency_breakdown[competency] = {
                    'total_evaluations': 0,
                    'average_score': 0,
                    'total_score': 0
                }
            competency_breakdown[competency]['total_evaluations'] += 1
            competency_breakdown[competency]['total_score'] += float(evaluation.score)
        
        # Calculate averages
        for competency in competency_breakdown:
            total = competency_breakdown[competency]['total_score']
            count = competency_breakdown[competency]['total_evaluations']
            competency_breakdown[competency]['average_score'] = round(total / count, 2)
        
        # AI usage stats
        ai_usage_stats = {
            'ai_enabled_interviews': sessions.filter(ai_enabled=True).count(),
            'ai_suggestions_used': 0,  # Will be calculated from analytics
            'ai_follow_ups_generated': 0  # Will be calculated from analytics
        }
        
        # Recent interviews
        recent_interviews = sessions.order_by('-created_at')[:5]
        recent_data = InterviewSessionSerializer(recent_interviews, many=True).data
        
        return Response({
            'success': True,
            'analytics': {
                'total_interviews': total_interviews,
                'completed_interviews': completed_interviews,
                'average_score': round(float(avg_score), 2),
                'completion_rate': round(completion_rate, 2),
                'average_duration': round(float(avg_duration), 2),
                'competency_breakdown': competency_breakdown,
                'ai_usage_stats': ai_usage_stats,
                'recent_interviews': recent_data
            }
        })
        
    except Exception as e:
        logger.error(f"Error in get_interview_analytics: {str(e)}")
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
