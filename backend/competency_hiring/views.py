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
    InterviewSession, CompetencyEvaluation, AIInterviewSession, InterviewAnalytics, QuestionBank
)
from .serializers import (
    CompetencyFrameworkSerializer, CompetencySerializer, InterviewTemplateSerializer,
    InterviewQuestionSerializer, InterviewSessionSerializer, CompetencyEvaluationSerializer,
    AIInterviewSessionSerializer, InterviewAnalyticsSerializer, InterviewSessionCreateSerializer,
    CompetencyEvaluationCreateSerializer, AIInterviewStartSerializer, AIInterviewResponseSerializer,
    InterviewSessionUpdateSerializer, FrameworkRecommendationSerializer, QuestionBankSerializer
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


class QuestionBankViewSet(viewsets.ModelViewSet):
    """ViewSet for managing question bank with tagging system"""
    
    queryset = QuestionBank.objects.filter(is_active=True)
    serializer_class = QuestionBankSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all for testing
    
    def get_queryset(self):
        queryset = QuestionBank.objects.filter(is_active=True)
        
        # Filter by tags
        tags = self.request.query_params.getlist('tags', [])
        if tags:
            queryset = queryset.filter(tags__overlap=tags)
        
        # Filter by type
        question_type = self.request.query_params.get('type', None)
        if question_type:
            queryset = queryset.filter(question_type=question_type)
        
        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty', None)
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        return queryset.order_by('-usage_count', '-success_rate')
    
    @action(detail=False, methods=['get'])
    def recommended_questions(self, request):
        """Get AI-recommended questions based on context"""
        job_description = request.query_params.get('job_description', '')
        resume_text = request.query_params.get('resume_text', '')
        competency_framework = request.query_params.get('framework_id', None)
        
        # AI-powered question recommendation logic
        recommended_questions = self.get_ai_recommendations(
            job_description, resume_text, competency_framework
        )
        
        return Response({
            'recommended_questions': recommended_questions,
            'reasoning': 'Based on job requirements and candidate profile'
        })
    
    @action(detail=False, methods=['post'])
    def advanced_recommendations(self, request):
        """Advanced AI-powered question recommendations with detailed analysis"""
        try:
            # Extract input data
            job_description = request.data.get('job_description', '')
            resume_text = request.data.get('resume_text', '')
            framework_id = request.data.get('framework_id')
            candidate_level = request.data.get('candidate_level')
            interview_type = request.data.get('interview_type', 'technical')  # technical, behavioral, mixed
            question_count = request.data.get('question_count', 10)
            
            # Validate inputs
            if not job_description and not resume_text:
                return Response({
                    'error': 'At least job description or resume text is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get AI recommendations
            recommendations = self.get_ai_recommendations(job_description, resume_text, framework_id)
            
            # Analyze context and provide insights
            context_analysis = self.analyze_interview_context(
                job_description, resume_text, framework_id, candidate_level, interview_type
            )
            
            # Generate interview strategy
            interview_strategy = self.generate_interview_strategy(
                recommendations, context_analysis, interview_type
            )
            
            return Response({
                'recommendations': recommendations[:question_count],
                'context_analysis': context_analysis,
                'interview_strategy': interview_strategy,
                'total_questions_analyzed': len(recommendations),
                'confidence_score': self.calculate_confidence_score(context_analysis)
            })
            
        except Exception as e:
            return Response({
                'error': f'Error generating recommendations: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def analyze_interview_context(self, jd, resume, framework_id, candidate_level, interview_type):
        """Analyze the interview context and provide insights"""
        analysis = {
            'detected_skills': {
                'job_requirements': self.extract_skills_from_text(jd),
                'candidate_skills': self.extract_skills_from_text(resume)
            },
            'candidate_level': candidate_level or self.determine_candidate_level(jd, resume),
            'interview_type': interview_type,
            'skill_gaps': [],
            'strengths': [],
            'recommended_focus_areas': []
        }
        
        # Analyze skill gaps
        jd_skills = set(analysis['detected_skills']['job_requirements'])
        candidate_skills = set(analysis['detected_skills']['candidate_skills'])
        skill_gaps = jd_skills - candidate_skills
        strengths = candidate_skills - jd_skills
        
        analysis['skill_gaps'] = list(skill_gaps)
        analysis['strengths'] = list(strengths)
        
        # Determine focus areas based on gaps and interview type
        if interview_type == 'technical':
            analysis['recommended_focus_areas'] = list(skill_gaps)[:3]
        elif interview_type == 'behavioral':
            analysis['recommended_focus_areas'] = ['communication', 'teamwork', 'problem solving']
        else:  # mixed
            analysis['recommended_focus_areas'] = list(skill_gaps)[:2] + ['leadership', 'adaptability']
        
        return analysis
    
    def generate_interview_strategy(self, recommendations, context_analysis, interview_type):
        """Generate interview strategy based on recommendations and context"""
        strategy = {
            'interview_flow': [],
            'time_allocation': {},
            'key_areas_to_probe': [],
            'red_flags_to_watch': [],
            'success_indicators': []
        }
        
        # Analyze question distribution
        question_types = {}
        difficulties = {}
        for rec in recommendations:
            q_type = rec['question_type']
            difficulty = rec['difficulty']
            
            question_types[q_type] = question_types.get(q_type, 0) + 1
            difficulties[difficulty] = difficulties.get(difficulty, 0) + 1
        
        # Generate interview flow
        if interview_type == 'technical':
            strategy['interview_flow'] = [
                'Warm-up: Easy technical questions',
                'Core: Medium difficulty technical problems',
                'Advanced: Complex technical scenarios',
                'Wrap-up: Behavioral questions about technical decisions'
            ]
        elif interview_type == 'behavioral':
            strategy['interview_flow'] = [
                'Introduction: Background and motivation',
                'Core: STAR/CAR behavioral questions',
                'Leadership: Team and project scenarios',
                'Wrap-up: Future goals and cultural fit'
            ]
        else:  # mixed
            strategy['interview_flow'] = [
                'Technical: Core skills assessment',
                'Behavioral: Past experiences and decisions',
                'Problem-solving: Real-world scenarios',
                'Cultural: Values and team fit'
            ]
        
        # Time allocation based on question distribution
        total_questions = len(recommendations)
        if total_questions > 0:
            strategy['time_allocation'] = {
                'technical_questions': f"{int((question_types.get('technical', 0) / total_questions) * 60)} minutes",
                'behavioral_questions': f"{int((question_types.get('behavioral', 0) / total_questions) * 60)} minutes",
                'problem_solving': f"{int((question_types.get('problem_solving', 0) / total_questions) * 60)} minutes"
            }
        
        # Key areas to probe based on skill gaps
        strategy['key_areas_to_probe'] = context_analysis['recommended_focus_areas']
        
        # Red flags and success indicators
        strategy['red_flags_to_watch'] = [
            'Inability to provide specific examples',
            'Vague or generic responses',
            'Lack of self-awareness about limitations',
            'Poor communication of technical concepts'
        ]
        
        strategy['success_indicators'] = [
            'Clear, structured responses with specific examples',
            'Demonstrates problem-solving approach',
            'Shows learning from past experiences',
            'Aligns with company values and culture'
        ]
        
        return strategy
    
    def calculate_confidence_score(self, context_analysis):
        """Calculate confidence score for the recommendations"""
        confidence = 0.5  # Base confidence
        
        # Increase confidence based on available data
        if context_analysis['detected_skills']['job_requirements']:
            confidence += 0.2
        
        if context_analysis['detected_skills']['candidate_skills']:
            confidence += 0.2
        
        if context_analysis['candidate_level']:
            confidence += 0.1
        
        # Cap at 1.0
        return min(confidence, 1.0)
    
    def get_ai_recommendations(self, jd, resume, framework_id):
        """AI-powered question recommendation with sophisticated logic"""
        try:
            # Step 1: Extract key information from inputs
            jd_skills = self.extract_skills_from_text(jd)
            resume_skills = self.extract_skills_from_text(resume)
            candidate_level = self.determine_candidate_level(jd, resume)
            
            # Step 2: Get competency framework if provided
            framework_competencies = []
            if framework_id:
                try:
                    framework = CompetencyFramework.objects.get(id=framework_id)
                    framework_competencies = list(framework.competencies.values_list('title', flat=True))
                except CompetencyFramework.DoesNotExist:
                    pass
            
            # Step 3: Score questions based on multiple factors
            questions = QuestionBank.objects.filter(is_active=True)
            scored_questions = []
            
            for question in questions:
                score = 0
                reasoning = []
                
                # Factor 1: Skill relevance (40% weight)
                skill_score = self.calculate_skill_relevance(question, jd_skills, resume_skills)
                score += skill_score * 0.4
                if skill_score > 0.7:
                    reasoning.append("High skill relevance")
                
                # Factor 2: Difficulty matching (25% weight)
                difficulty_score = self.calculate_difficulty_match(question, candidate_level)
                score += difficulty_score * 0.25
                if difficulty_score > 0.8:
                    reasoning.append("Perfect difficulty match")
                
                # Factor 3: Framework alignment (20% weight)
                framework_score = self.calculate_framework_alignment(question, framework_competencies)
                score += framework_score * 0.2
                if framework_score > 0.6:
                    reasoning.append("Framework aligned")
                
                # Factor 4: Success rate (15% weight)
                success_score = self.calculate_success_rate_score(question)
                score += success_score * 0.15
                if success_score > 0.8:
                    reasoning.append("High success rate")
                
                scored_questions.append({
                    'question': question,
                    'score': score,
                    'reasoning': reasoning,
                    'skill_relevance': skill_score,
                    'difficulty_match': difficulty_score,
                    'framework_alignment': framework_score,
                    'success_rate': success_score
                })
            
            # Step 4: Sort by score and return top recommendations
            scored_questions.sort(key=lambda x: x['score'], reverse=True)
            top_questions = scored_questions[:10]
            
            # Step 5: Format response with detailed reasoning
            recommendations = []
            for item in top_questions:
                question = item['question']
                recommendations.append({
                    'id': question.id,
                    'question_text': question.question_text,
                    'question_type': question.question_type,
                    'difficulty': question.difficulty,
                    'tags': question.tags,
                    'recommendation_score': round(item['score'], 2),
                    'reasoning': item['reasoning'],
                    'skill_relevance': round(item['skill_relevance'], 2),
                    'difficulty_match': round(item['difficulty_match'], 2),
                    'framework_alignment': round(item['framework_alignment'], 2),
                    'success_rate': round(item['success_rate'], 2)
                })
            
            return recommendations
            
        except Exception as e:
            # Fallback to basic recommendation
            return list(QuestionBank.objects.filter(is_active=True).order_by('-usage_count')[:10])
    
    def extract_skills_from_text(self, text):
        """Extract skills from text using keyword matching"""
        if not text:
            return []
        
        # Common technical skills
        technical_skills = [
            'python', 'java', 'javascript', 'react', 'node.js', 'django', 'flask',
            'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'git', 'agile',
            'machine learning', 'data science', 'ai', 'nlp', 'computer vision',
            'devops', 'ci/cd', 'microservices', 'api', 'rest', 'graphql'
        ]
        
        # Common soft skills
        soft_skills = [
            'communication', 'leadership', 'teamwork', 'problem solving',
            'critical thinking', 'adaptability', 'time management', 'collaboration',
            'mentoring', 'project management', 'stakeholder management'
        ]
        
        all_skills = technical_skills + soft_skills
        text_lower = text.lower()
        found_skills = []
        
        for skill in all_skills:
            if skill in text_lower:
                found_skills.append(skill)
        
        return found_skills
    
    def determine_candidate_level(self, jd, resume):
        """Determine candidate level based on job description and resume"""
        text = f"{jd} {resume}".lower()
        
        # Senior indicators
        senior_indicators = ['senior', 'lead', 'principal', 'architect', '5+ years', '10+ years']
        # Mid-level indicators
        mid_indicators = ['mid-level', 'intermediate', '3+ years', '5 years']
        # Junior indicators
        junior_indicators = ['junior', 'entry', '0-2 years', 'fresh graduate']
        
        senior_count = sum(1 for indicator in senior_indicators if indicator in text)
        mid_count = sum(1 for indicator in mid_indicators if indicator in text)
        junior_count = sum(1 for indicator in junior_indicators if indicator in text)
        
        if senior_count > mid_count and senior_count > junior_count:
            return 'senior'
        elif mid_count > junior_count:
            return 'mid-level'
        else:
            return 'junior'
    
    def calculate_skill_relevance(self, question, jd_skills, resume_skills):
        """Calculate how relevant the question is to the required skills"""
        if not jd_skills and not resume_skills:
            return 0.5  # Neutral score if no skills detected
        
        question_tags = [tag.lower() for tag in question.tags]
        question_text = question.question_text.lower()
        
        # Check tag matches
        tag_matches = 0
        for skill in jd_skills + resume_skills:
            if skill in question_tags:
                tag_matches += 1
        
        # Check text matches
        text_matches = 0
        for skill in jd_skills + resume_skills:
            if skill in question_text:
                text_matches += 1
        
        # Calculate relevance score
        total_skills = len(set(jd_skills + resume_skills))
        if total_skills == 0:
            return 0.5
        
        tag_score = tag_matches / total_skills if total_skills > 0 else 0
        text_score = text_matches / total_skills if total_skills > 0 else 0
        
        # Weight tags more heavily than text matches
        return (tag_score * 0.7) + (text_score * 0.3)
    
    def calculate_difficulty_match(self, question, candidate_level):
        """Calculate how well the question difficulty matches the candidate level"""
        difficulty_mapping = {
            'junior': {'easy': 1.0, 'medium': 0.7, 'hard': 0.3},
            'mid-level': {'easy': 0.6, 'medium': 1.0, 'hard': 0.7},
            'senior': {'easy': 0.3, 'medium': 0.7, 'hard': 1.0}
        }
        
        return difficulty_mapping.get(candidate_level, {}).get(question.difficulty, 0.5)
    
    def calculate_framework_alignment(self, question, framework_competencies):
        """Calculate how well the question aligns with the competency framework"""
        if not framework_competencies:
            return 0.5  # Neutral score if no framework provided
        
        question_text = question.question_text.lower()
        framework_text = ' '.join(framework_competencies).lower()
        
        # Simple keyword matching
        matches = 0
        for competency in framework_competencies:
            if competency.lower() in question_text:
                matches += 1
        
        return matches / len(framework_competencies) if framework_competencies else 0.5
    
    def calculate_success_rate_score(self, question):
        """Calculate score based on question success rate"""
        if question.success_rate is None:
            return 0.5  # Neutral score if no success rate data
        
        # Normalize success rate (0-100) to 0-1
        return question.success_rate / 100
    
    @action(detail=True, methods=['post'])
    def increment_usage(self, request, pk=None):
        """Increment usage count when question is used"""
        question = self.get_object()
        question.increment_usage()
        return Response({'message': 'Usage count incremented'})
    
    @action(detail=True, methods=['post'])
    def update_success_rate(self, request, pk=None):
        """Update success rate based on candidate performance"""
        question = self.get_object()
        success_percentage = request.data.get('success_percentage', 0)
        question.update_success_rate(success_percentage)
        return Response({'message': 'Success rate updated'})


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
