import json
import logging
from typing import Dict, List, Optional, Tuple
from django.db import transaction
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Interview, InterviewSession, AIInterviewAssistant, Interviewer
from competency_hiring.models import CompetencyFramework, Competency, InterviewTemplate
from competency_hiring.llm_service import LLMQuestionService

logger = logging.getLogger(__name__)


class AIInterviewService:
    """
    Service for managing Human + AI collaborative interviews
    """
    
    def __init__(self, ai_assistant_id: Optional[str] = None):
        self.llm_service = LLMQuestionService()
        self.ai_assistant = None
        if ai_assistant_id:
            try:
                self.ai_assistant = AIInterviewAssistant.objects.get(id=ai_assistant_id, is_active=True)
            except AIInterviewAssistant.DoesNotExist:
                logger.warning(f"AI Assistant {ai_assistant_id} not found, using default")
    
    def prepare_interview(self, interview_id: str) -> Dict:
        """
        Prepare AI-generated questions and materials for an interview
        """
        try:
            interview = Interview.objects.select_related(
                'candidate', 'job_posting', 'competency_framework', 'interview_template'
            ).get(id=interview_id)
            
            # Generate AI questions based on competency framework
            ai_questions = self._generate_interview_questions(interview)
            
            # Update interview with AI-generated content
            interview.ai_generated_questions = ai_questions
            interview.status = 'ai_prep'
            interview.save()
            
            return {
                'success': True,
                'interview_id': str(interview.id),
                'ai_questions': ai_questions,
                'total_questions': len(ai_questions),
                'competency_framework': interview.competency_framework.name if interview.competency_framework else None,
                'preparation_complete': True
            }
            
        except Interview.DoesNotExist:
            return {'success': False, 'error': 'Interview not found'}
        except Exception as e:
            logger.error(f"Error preparing interview: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _generate_interview_questions(self, interview: Interview) -> List[Dict]:
        """
        Generate AI questions based on competency framework and job requirements
        """
        questions = []
        
        # Get competency framework
        framework = interview.competency_framework
        if not framework:
            # Fallback to default questions
            return self._get_default_questions(interview)
        
        # Generate questions for each competency
        competencies = Competency.objects.filter(framework=framework, is_active=True).order_by('-weightage')
        
        for competency in competencies:
            try:
                # Generate competency-specific questions
                competency_questions = self._generate_competency_questions(
                    competency, interview.job_posting, interview.candidate
                )
                
                questions.extend(competency_questions)
                
            except Exception as e:
                logger.error(f"Error generating questions for competency {competency.title}: {str(e)}")
                continue
        
        return questions
    
    def _generate_competency_questions(self, competency: Competency, job_posting, candidate) -> List[Dict]:
        """
        Generate questions for a specific competency
        """
        questions = []
        
        # Prepare context for AI
        context = {
            'competency': competency.title,
            'evaluation_method': competency.evaluation_method,
            'job_title': job_posting.title,
            'job_requirements': job_posting.requirements,
            'candidate_experience': candidate.years_of_experience,
            'candidate_skills': candidate.skills
        }
        
        # Generate different types of questions
        question_types = ['behavioral', 'technical', 'situational']
        
        for q_type in question_types:
            try:
                prompt = self._build_question_prompt(competency, context, q_type)
                ai_response = self.llm_service.generate_question(prompt)
                
                if ai_response and ai_response.get('question'):
                    questions.append({
                        'id': f"{competency.id}_{q_type}_{len(questions)}",
                        'competency_id': str(competency.id),
                        'competency_title': competency.title,
                        'type': q_type,
                        'question': ai_response['question'],
                        'evaluation_criteria': competency.evaluation_criteria,
                        'weightage': float(competency.weightage),
                        'ai_generated': True,
                        'difficulty': 'medium'
                    })
                    
            except Exception as e:
                logger.error(f"Error generating {q_type} question for {competency.title}: {str(e)}")
                continue
        
        return questions
    
    def _build_question_prompt(self, competency: Competency, context: Dict, question_type: str) -> str:
        """
        Build AI prompt for question generation
        """
        base_prompt = f"""
        You are an expert interviewer conducting a {context['evaluation_method']} behavioral interview.
        
        Competency: {competency.title}
        Job Title: {context['job_title']}
        Job Requirements: {context['job_requirements']}
        Candidate Experience: {context['candidate_experience']} years
        Candidate Skills: {context['candidate_skills']}
        
        Generate a {question_type} question that assesses the competency "{competency.title}" using the {context['evaluation_method']} methodology.
        
        The question should:
        1. Be specific and actionable
        2. Allow the candidate to demonstrate their {competency.title} skills
        3. Follow the {context['evaluation_method']} structure
        4. Be appropriate for the candidate's experience level
        5. Be relevant to the job requirements
        
        Return only the question text, no additional formatting.
        """
        
        return base_prompt
    
    def _get_default_questions(self, interview: Interview) -> List[Dict]:
        """
        Fallback default questions when no competency framework is available
        """
        return [
            {
                'id': 'default_1',
                'competency_title': 'Problem Solving',
                'type': 'behavioral',
                'question': 'Tell me about a time when you faced a complex technical problem. What was the situation, what actions did you take, and what was the result?',
                'evaluation_criteria': ['Clear problem identification', 'Systematic approach', 'Effective solution'],
                'weightage': 25.0,
                'ai_generated': False,
                'difficulty': 'medium'
            },
            {
                'id': 'default_2',
                'competency_title': 'Communication',
                'type': 'behavioral',
                'question': 'Describe a situation where you had to explain a technical concept to a non-technical stakeholder. How did you approach it?',
                'evaluation_criteria': ['Clarity of explanation', 'Adaptation to audience', 'Successful outcome'],
                'weightage': 20.0,
                'ai_generated': False,
                'difficulty': 'medium'
            }
        ]
    
    def analyze_response(self, interview_id: str, question_id: str, response: str) -> Dict:
        """
        Analyze candidate response using AI
        """
        try:
            interview = Interview.objects.get(id=interview_id)
            
            # Get the question context
            question = self._find_question_in_interview(interview, question_id)
            if not question:
                return {'success': False, 'error': 'Question not found'}
            
            # Analyze response using AI
            analysis = self._analyze_response_with_ai(question, response, interview)
            
            # Store analysis in interview
            if not interview.ai_response_analysis:
                interview.ai_response_analysis = []
            
            interview.ai_response_analysis.append({
                'question_id': question_id,
                'response': response,
                'analysis': analysis,
                'timestamp': timezone.now().isoformat()
            })
            interview.save()
            
            return {
                'success': True,
                'analysis': analysis,
                'question_id': question_id
            }
            
        except Interview.DoesNotExist:
            return {'success': False, 'error': 'Interview not found'}
        except Exception as e:
            logger.error(f"Error analyzing response: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _analyze_response_with_ai(self, question: Dict, response: str, interview: Interview) -> Dict:
        """
        Use AI to analyze candidate response
        """
        prompt = f"""
        Analyze this candidate response to an interview question.
        
        Question: {question['question']}
        Competency: {question['competency_title']}
        Evaluation Criteria: {question['evaluation_criteria']}
        Job Title: {interview.job_posting.title}
        
        Candidate Response: {response}
        
        Provide a structured analysis including:
        1. Response Quality Score (1-10)
        2. Strengths identified
        3. Areas for improvement
        4. Competency assessment
        5. Follow-up question suggestions
        
        Return as JSON with keys: score, strengths, improvements, competency_assessment, followup_questions
        """
        
        try:
            ai_response = self.llm_service.generate_question(prompt)
            if ai_response and ai_response.get('question'):
                # Try to parse as JSON
                try:
                    return json.loads(ai_response['question'])
                except json.JSONDecodeError:
                    # Fallback to structured text
                    return {
                        'score': 7,
                        'strengths': ['Good response structure'],
                        'improvements': ['Could provide more specific examples'],
                        'competency_assessment': 'Demonstrates competency',
                        'followup_questions': ['Can you provide a specific example?']
                    }
            else:
                return self._default_analysis()
                
        except Exception as e:
            logger.error(f"Error in AI analysis: {str(e)}")
            return self._default_analysis()
    
    def _default_analysis(self) -> Dict:
        """
        Default analysis when AI fails
        """
        return {
            'score': 5,
            'strengths': ['Response provided'],
            'improvements': ['Could be more detailed'],
            'competency_assessment': 'Needs more information',
            'followup_questions': ['Can you elaborate on that?']
        }
    
    def generate_followup_questions(self, interview_id: str, current_question_id: str, response_analysis: Dict) -> List[Dict]:
        """
        Generate follow-up questions based on response analysis
        """
        try:
            interview = Interview.objects.get(id=interview_id)
            current_question = self._find_question_in_interview(interview, current_question_id)
            
            if not current_question:
                return []
            
            # Generate follow-up questions using AI
            followup_prompt = f"""
            Based on this response analysis, generate 2-3 follow-up questions:
            
            Original Question: {current_question['question']}
            Competency: {current_question['competency_title']}
            Response Analysis: {response_analysis}
            
            Generate follow-up questions that:
            1. Probe deeper into the response
            2. Explore specific examples
            3. Test the competency further
            4. Are relevant to the job requirements
            
            Return as a list of questions.
            """
            
            ai_response = self.llm_service.generate_question(followup_prompt)
            
            if ai_response and ai_response.get('question'):
                # Parse the response to extract questions
                questions = self._extract_questions_from_ai_response(ai_response['question'])
                
                # Store follow-up suggestions
                if not interview.ai_followup_suggestions:
                    interview.ai_followup_suggestions = []
                
                interview.ai_followup_suggestions.append({
                    'question_id': current_question_id,
                    'suggestions': questions,
                    'timestamp': timezone.now().isoformat()
                })
                interview.save()
                
                return questions
            
            return []
            
        except Exception as e:
            logger.error(f"Error generating follow-up questions: {str(e)}")
            return []
    
    def _extract_questions_from_ai_response(self, ai_response: str) -> List[Dict]:
        """
        Extract questions from AI response
        """
        # Simple extraction - split by newlines and look for question marks
        lines = ai_response.split('\n')
        questions = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            if line and ('?' in line or line.startswith('Q') or line.startswith('1.') or line.startswith('2.')):
                questions.append({
                    'id': f'followup_{i}',
                    'question': line,
                    'type': 'followup',
                    'ai_generated': True
                })
        
        return questions[:3]  # Limit to 3 questions
    
    def _find_question_in_interview(self, interview: Interview, question_id: str) -> Optional[Dict]:
        """
        Find a specific question in the interview's AI-generated questions
        """
        if not interview.ai_generated_questions:
            return None
        
        for question in interview.ai_generated_questions:
            if question.get('id') == question_id:
                return question
        
        return None
    
    def create_interview_session(self, interview_id: str) -> Dict:
        """
        Create a real-time interview session
        """
        try:
            interview = Interview.objects.get(id=interview_id)
            
            # Generate unique session ID
            session_id = f"session_{interview.id}_{int(timezone.now().timestamp())}"
            
            # Create session
            session = InterviewSession.objects.create(
                interview=interview,
                session_id=session_id,
                is_active=True
            )
            
            # Update interview status
            interview.is_live = True
            interview.session_id = session_id
            interview.status = 'in_progress'
            interview.save()
            
            return {
                'success': True,
                'session_id': session_id,
                'interview_id': str(interview.id),
                'session_created': True
            }
            
        except Interview.DoesNotExist:
            return {'success': False, 'error': 'Interview not found'}
        except Exception as e:
            logger.error(f"Error creating interview session: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def end_interview_session(self, session_id: str) -> Dict:
        """
        End an interview session and generate summary
        """
        try:
            session = InterviewSession.objects.get(session_id=session_id)
            
            # End session
            session.end_time = timezone.now()
            session.is_active = False
            session.save()
            
            # Update interview
            interview = session.interview
            interview.is_live = False
            interview.status = 'human_review'
            interview.save()
            
            # Generate AI summary
            summary = self._generate_interview_summary(interview)
            interview.ai_interview_summary = summary
            interview.save()
            
            return {
                'success': True,
                'session_ended': True,
                'summary': summary,
                'duration_minutes': self._calculate_duration(session.start_time, session.end_time)
            }
            
        except InterviewSession.DoesNotExist:
            return {'success': False, 'error': 'Session not found'}
        except Exception as e:
            logger.error(f"Error ending interview session: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _generate_interview_summary(self, interview: Interview) -> str:
        """
        Generate AI summary of the interview
        """
        try:
            # Prepare context for summary
            context = {
                'candidate_name': interview.candidate.user.get_full_name(),
                'job_title': interview.job_posting.title,
                'interview_type': interview.interview_type,
                'ai_mode': interview.ai_mode,
                'questions_asked': len(interview.questions_asked),
                'response_analyses': len(interview.ai_response_analysis) if interview.ai_response_analysis else 0
            }
            
            prompt = f"""
            Generate a professional summary of this interview:
            
            Candidate: {context['candidate_name']}
            Job: {context['job_title']}
            Interview Type: {context['interview_type']}
            AI Mode: {context['ai_mode']}
            Questions Asked: {context['questions_asked']}
            Responses Analyzed: {context['response_analyses']}
            
            Provide a concise summary highlighting:
            1. Key competencies assessed
            2. Notable strengths and areas for improvement
            3. Overall impression
            4. Recommendation for next steps
            
            Keep it professional and objective.
            """
            
            ai_response = self.llm_service.generate_question(prompt)
            if ai_response and ai_response.get('question'):
                return ai_response['question']
            else:
                return f"Interview completed for {context['candidate_name']} for {context['job_title']} position."
                
        except Exception as e:
            logger.error(f"Error generating interview summary: {str(e)}")
            return "Interview summary generation failed."
    
    def _calculate_duration(self, start_time, end_time) -> int:
        """
        Calculate duration in minutes
        """
        if not start_time or not end_time:
            return 0
        
        duration = end_time - start_time
        return int(duration.total_seconds() / 60)
    
    def get_interviewer_ai_preferences(self, interviewer_id: str) -> Dict:
        """
        Get AI collaboration preferences for an interviewer
        """
        try:
            interviewer = Interviewer.objects.get(id=interviewer_id)
            
            return {
                'ai_assistance_enabled': interviewer.ai_assistance_enabled,
                'ai_question_suggestions': interviewer.ai_question_suggestions,
                'ai_response_analysis': interviewer.ai_response_analysis,
                'ai_followup_suggestions': interviewer.ai_followup_suggestions
            }
            
        except Interviewer.DoesNotExist:
            return {'error': 'Interviewer not found'}
    
    def update_interviewer_ai_preferences(self, interviewer_id: str, preferences: Dict) -> Dict:
        """
        Update AI collaboration preferences for an interviewer
        """
        try:
            interviewer = Interviewer.objects.get(id=interviewer_id)
            
            # Update preferences
            for key, value in preferences.items():
                if hasattr(interviewer, key):
                    setattr(interviewer, key, value)
            
            interviewer.save()
            
            return {
                'success': True,
                'preferences_updated': True,
                'preferences': self.get_interviewer_ai_preferences(interviewer_id)
            }
            
        except Interviewer.DoesNotExist:
            return {'success': False, 'error': 'Interviewer not found'}
        except Exception as e:
            logger.error(f"Error updating interviewer preferences: {str(e)}")
            return {'success': False, 'error': str(e)} 