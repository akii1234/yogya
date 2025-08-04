from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count
from django.utils import timezone
from datetime import timedelta
import json

from .models import (
    CompetencyFramework, Competency, InterviewTemplate, InterviewQuestion,
    InterviewSession, CompetencyEvaluation, AIInterviewSession, InterviewAnalytics
)
from .serializers import (
    CompetencyFrameworkSerializer, CompetencySerializer, InterviewTemplateSerializer,
    InterviewQuestionSerializer, InterviewSessionSerializer, CompetencyEvaluationSerializer,
    AIInterviewSessionSerializer, InterviewAnalyticsSerializer, InterviewSessionCreateSerializer,
    CompetencyEvaluationCreateSerializer, AIInterviewStartSerializer, AIInterviewResponseSerializer,
    InterviewSessionUpdateSerializer, FrameworkRecommendationSerializer
)


class CompetencyFrameworkViewSet(viewsets.ModelViewSet):
    """ViewSet for managing competency frameworks"""
    
    queryset = CompetencyFramework.objects.filter(is_active=True)
    serializer_class = CompetencyFrameworkSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all for testing
    
    def get_queryset(self):
        queryset = CompetencyFramework.objects.filter(is_active=True)
        technology = self.request.query_params.get('technology', None)
        level = self.request.query_params.get('level', None)
        
        if technology:
            queryset = queryset.filter(technology__icontains=technology)
        if level:
            queryset = queryset.filter(level=level)
            
        return queryset.prefetch_related('competencies')
    
    @action(detail=True, methods=['get'])
    def competencies(self, request, pk=None):
        """Get all competencies for a specific framework"""
        framework = self.get_object()
        competencies = framework.competencies.filter(is_active=True).order_by('order')
        serializer = CompetencySerializer(competencies, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_competency(self, request, pk=None):
        """Add a new competency to the framework"""
        framework = self.get_object()
        serializer = CompetencySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(framework=framework)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CompetencyViewSet(viewsets.ModelViewSet):
    """ViewSet for managing competencies"""
    
    queryset = Competency.objects.filter(is_active=True)
    serializer_class = CompetencySerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all for testing
    
    def get_queryset(self):
        queryset = Competency.objects.filter(is_active=True)
        framework_id = self.request.query_params.get('framework', None)
        category = self.request.query_params.get('category', None)
        
        if framework_id:
            queryset = queryset.filter(framework_id=framework_id)
        if category:
            queryset = queryset.filter(category__icontains=category)
            
        return queryset.select_related('framework').order_by('framework', 'order')


class InterviewTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing interview templates"""
    
    queryset = InterviewTemplate.objects.filter(is_active=True)
    serializer_class = InterviewTemplateSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all for testing
    
    def get_queryset(self):
        queryset = InterviewTemplate.objects.filter(is_active=True)
        framework_id = self.request.query_params.get('framework', None)
        
        if framework_id:
            queryset = queryset.filter(framework_id=framework_id)
            
        return queryset.select_related('framework').prefetch_related('questions')
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get all questions for a specific template"""
        template = self.get_object()
        questions = template.questions.filter(is_active=True).order_by('order')
        serializer = InterviewQuestionSerializer(questions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_question(self, request, pk=None):
        """Add a new question to the template"""
        template = self.get_object()
        serializer = InterviewQuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(template=template)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InterviewQuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing interview questions"""
    
    queryset = InterviewQuestion.objects.filter(is_active=True)
    serializer_class = InterviewQuestionSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all for testing
    
    def get_queryset(self):
        queryset = InterviewQuestion.objects.filter(is_active=True)
        template_id = self.request.query_params.get('template', None)
        question_type = self.request.query_params.get('type', None)
        difficulty = self.request.query_params.get('difficulty', None)
        
        if template_id:
            queryset = queryset.filter(template_id=template_id)
        if question_type:
            queryset = queryset.filter(question_type=question_type)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
            
        return queryset.select_related('template', 'competency').order_by('template', 'order')


class InterviewSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing interview sessions"""
    
    queryset = InterviewSession.objects.all()
    serializer_class = InterviewSessionSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all for testing
    
    def get_queryset(self):
        queryset = InterviewSession.objects.all()
        status_filter = self.request.query_params.get('status', None)
        candidate_id = self.request.query_params.get('candidate', None)
        job_id = self.request.query_params.get('job', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if candidate_id:
            queryset = queryset.filter(candidate_id=candidate_id)
        if job_id:
            queryset = queryset.filter(job_description_id=job_id)
            
        return queryset.select_related('candidate', 'job_description', 'template').prefetch_related('evaluations')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return InterviewSessionCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return InterviewSessionUpdateSerializer
        return InterviewSessionSerializer
    
    @action(detail=True, methods=['get'])
    def evaluations(self, request, pk=None):
        """Get all evaluations for a specific session"""
        session = self.get_object()
        evaluations = session.evaluations.all().order_by('competency__order')
        serializer = CompetencyEvaluationSerializer(evaluations, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_evaluation(self, request, pk=None):
        """Add a new evaluation to the session"""
        session = self.get_object()
        serializer = CompetencyEvaluationCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(session=session)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def calculate_overall_score(self, request, pk=None):
        """Calculate overall score based on competency evaluations"""
        session = self.get_object()
        evaluations = session.evaluations.all()
        
        if not evaluations.exists():
            return Response({'error': 'No evaluations found'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate weighted average score
        total_weighted_score = 0
        total_weight = 0
        
        for evaluation in evaluations:
            weight = evaluation.competency.weight
            total_weighted_score += evaluation.score * weight
            total_weight += weight
        
        overall_score = total_weighted_score / total_weight if total_weight > 0 else 0
        session.overall_score = overall_score
        session.save()
        
        return Response({
            'overall_score': overall_score,
            'evaluation_count': evaluations.count()
        })
    
    @action(detail=True, methods=['post'])
    def start_ai_interview(self, request, pk=None):
        """Start an AI-powered interview session"""
        session = self.get_object()
        serializer = AIInterviewStartSerializer(data=request.data)
        
        if serializer.is_valid():
            llm_model = serializer.validated_data.get('llm_model', 'gpt-4')
            
            # Check if AI session already exists
            ai_session, created = AIInterviewSession.objects.get_or_create(
                session=session,
                defaults={
                    'llm_model': llm_model,
                    'is_active': True
                }
            )
            
            if not created:
                ai_session.is_active = True
                ai_session.save()
            
            # Update session status
            session.status = 'in_progress'
            session.save()
            
            return Response({
                'ai_session_id': ai_session.id,
                'message': 'AI interview started successfully'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CompetencyEvaluationViewSet(viewsets.ModelViewSet):
    """ViewSet for managing competency evaluations"""
    
    queryset = CompetencyEvaluation.objects.all()
    serializer_class = CompetencyEvaluationSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all for testing
    
    def get_queryset(self):
        queryset = CompetencyEvaluation.objects.all()
        session_id = self.request.query_params.get('session', None)
        competency_id = self.request.query_params.get('competency', None)
        
        if session_id:
            queryset = queryset.filter(session_id=session_id)
        if competency_id:
            queryset = queryset.filter(competency_id=competency_id)
            
        return queryset.select_related('session', 'competency').order_by('session', 'competency__order')


class AIInterviewSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for managing AI interview sessions"""
    
    queryset = AIInterviewSession.objects.all()
    serializer_class = AIInterviewSessionSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all for testing
    
    @action(detail=True, methods=['post'])
    def submit_response(self, request, pk=None):
        """Submit candidate response to AI interview"""
        ai_session = self.get_object()
        serializer = AIInterviewResponseSerializer(data=request.data)
        
        if serializer.is_valid():
            candidate_response = serializer.validated_data['candidate_response']
            question_index = serializer.validated_data['question_index']
            
            # Add response to conversation history
            conversation_entry = {
                'timestamp': timezone.now().isoformat(),
                'question_index': question_index,
                'candidate_response': candidate_response,
                'type': 'candidate_response'
            }
            
            ai_session.conversation_history.append(conversation_entry)
            ai_session.current_question_index = question_index + 1
            ai_session.save()
            
            # TODO: Integrate with LLM for next question generation
            # For now, return a mock response
            next_question = {
                'question': f"Next question for competency {question_index + 1}",
                'question_index': question_index + 1,
                'type': 'ai_question'
            }
            
            return Response({
                'message': 'Response submitted successfully',
                'next_question': next_question
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def complete_interview(self, request, pk=None):
        """Complete AI interview and generate evaluations"""
        ai_session = self.get_object()
        
        # Mark AI session as completed
        ai_session.is_active = False
        ai_session.completed_at = timezone.now()
        ai_session.save()
        
        # Update interview session status
        session = ai_session.session
        session.status = 'completed'
        session.save()
        
        # TODO: Generate competency evaluations using LLM
        # For now, create placeholder evaluations
        
        return Response({
            'message': 'AI interview completed successfully',
            'session_id': session.id
        })


class InterviewAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for interview analytics (read-only)"""
    
    queryset = InterviewAnalytics.objects.all()
    serializer_class = InterviewAnalyticsSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all for testing
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics"""
        total_sessions = InterviewSession.objects.count()
        completed_sessions = InterviewSession.objects.filter(status='completed').count()
        pending_sessions = InterviewSession.objects.filter(status='scheduled').count()
        
        # Average scores
        avg_overall_score = InterviewSession.objects.filter(
            overall_score__isnull=False
        ).aggregate(Avg('overall_score'))['overall_score__avg'] or 0
        
        # Recent sessions
        recent_sessions = InterviewSession.objects.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        return Response({
            'total_sessions': total_sessions,
            'completed_sessions': completed_sessions,
            'pending_sessions': pending_sessions,
            'avg_overall_score': avg_overall_score,
            'recent_sessions': recent_sessions
        })


class FrameworkRecommendationView(APIView):
    """View for recommending competency frameworks based on job descriptions"""
    
    permission_classes = [permissions.AllowAny]  # Temporarily allow all for testing
    
    def post(self, request):
        serializer = FrameworkRecommendationSerializer(data=request.data)
        if serializer.is_valid():
            job_description_id = serializer.validated_data['job_description_id']
            
            # Get job description
            from resume_checker.models import JobDescription
            try:
                job_description = JobDescription.objects.get(id=job_description_id)
            except JobDescription.DoesNotExist:
                return Response({'error': 'Job description not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Simple keyword-based recommendation
            # TODO: Implement more sophisticated ML-based recommendation
            job_text = f"{job_description.title} {job_description.description} {job_description.requirements}".lower()
            
            frameworks = CompetencyFramework.objects.filter(is_active=True)
            best_match = None
            best_score = 0
            
            for framework in frameworks:
                score = 0
                if framework.technology.lower() in job_text:
                    score += 3
                if framework.level in job_text:
                    score += 1
                
                if score > best_score:
                    best_score = score
                    best_match = framework
            
            if best_match:
                # Find matching competencies
                matching_competencies = []
                for competency in best_match.competencies.all():
                    if competency.name.lower() in job_text:
                        matching_competencies.append(competency.name)
                
                return Response({
                    'job_description_id': job_description_id,
                    'confidence_score': min(best_score * 20, 100),  # Scale to 0-100
                    'recommended_framework': CompetencyFrameworkSerializer(best_match).data,
                    'matching_competencies': matching_competencies
                })
            else:
                return Response({
                    'job_description_id': job_description_id,
                    'confidence_score': 0,
                    'recommended_framework': None,
                    'matching_competencies': []
                })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
