import logging
from typing import List, Dict, Any
from django.db import transaction
from django.utils import timezone
from .models import InterviewSession, CompetencyEvaluation, InterviewQuestion
from competency_hiring.models import Competency, CompetencyFramework, QuestionBank
from resume_checker.models import JobDescription, Candidate, Resume
from competency_hiring.llm_service import LLMQuestionService

logger = logging.getLogger(__name__)


class CompetencyFrameworkService:
    """
    Service for generating competency frameworks from JD + Resume analysis
    """
    
    def __init__(self):
        self.llm_service = LLMQuestionService()
    
    def generate_competency_framework(self, job_description: JobDescription, candidate: Candidate) -> Dict[str, Any]:
        """
        Generate a competency framework based on JD + Resume analysis
        """
        try:
            # Get candidate's resume
            resume = candidate.resumes.filter(processing_status='completed').first()
            if not resume:
                raise ValueError("No processed resume found for candidate")
            
            # Analyze JD and resume for competency mapping
            jd_text = f"{job_description.title} {job_description.description} {job_description.requirements}"
            resume_text = resume.parsed_text or resume.processed_text
            
            # Generate competency framework using AI
            framework_prompt = f"""
            Based on the following job description and candidate resume, generate a competency framework:
            
            JOB DESCRIPTION:
            {jd_text}
            
            CANDIDATE RESUME:
            {resume_text}
            
            Generate a competency framework with:
            1. 4-6 core competencies relevant to this role
            2. Weightage for each competency (total 100%)
            3. Specific skills/technologies for each competency
            4. Question types (behavioral, technical, coding)
            
            Return as JSON format.
            """
            
            # Use LLM to generate framework
            response = self.llm_service.generate_question(
                prompt_template=framework_prompt,
                skill=job_description.title,
                level="intermediate",
                question_type="framework_generation",
                context=f"Job: {job_description.title}\nDescription: {job_description.description[:500]}..."
            )
            
            # Parse the response and create framework
            framework_data = self._parse_framework_response(response)
            
            return framework_data
            
        except Exception as e:
            logger.error(f"Error generating competency framework: {str(e)}")
            # Fallback to default framework
            return self._get_default_framework(job_description)
    
    def _parse_framework_response(self, response: str) -> Dict[str, Any]:
        """
        Parse LLM response into structured framework data
        """
        # This is a simplified parser - in production, you'd want more robust JSON parsing
        try:
            import json
            return json.loads(response)
        except:
            # Fallback parsing
            return self._extract_framework_from_text(response)
    
    def _extract_framework_from_text(self, text: str) -> Dict[str, Any]:
        """
        Extract framework data from text response
        """
        competencies = [
            {
                'title': 'Technical Skills',
                'weightage': 30.0,
                'skills': ['Programming', 'Problem Solving', 'Technical Knowledge'],
                'question_types': ['technical', 'coding']
            },
            {
                'title': 'Problem Solving',
                'weightage': 25.0,
                'skills': ['Analytical Thinking', 'Debugging', 'Solution Design'],
                'question_types': ['behavioral', 'technical']
            },
            {
                'title': 'Communication',
                'weightage': 20.0,
                'skills': ['Technical Communication', 'Documentation', 'Team Collaboration'],
                'question_types': ['behavioral']
            },
            {
                'title': 'Experience & Projects',
                'weightage': 25.0,
                'skills': ['Project Management', 'Real-world Application', 'Leadership'],
                'question_types': ['behavioral', 'scenario']
            }
        ]
        
        return {
            'competencies': competencies,
            'total_weightage': 100.0,
            'framework_name': 'Generated Framework'
        }
    
    def _get_default_framework(self, job_description: JobDescription) -> Dict[str, Any]:
        """
        Get default competency framework based on job type
        """
        if 'python' in job_description.title.lower() or 'developer' in job_description.title.lower():
            return {
                'competencies': [
                    {
                        'title': 'Python Basics',
                        'weightage': 20.0,
                        'skills': ['Python Syntax', 'Data Structures', 'OOP'],
                        'question_types': ['technical', 'coding']
                    },
                    {
                        'title': 'Functional Programming',
                        'weightage': 15.0,
                        'skills': ['Higher-order Functions', 'Lambda', 'Map/Reduce'],
                        'question_types': ['technical', 'coding']
                    },
                    {
                        'title': 'Exception Handling',
                        'weightage': 15.0,
                        'skills': ['Try-Catch', 'Error Management', 'Debugging'],
                        'question_types': ['behavioral', 'technical']
                    },
                    {
                        'title': 'API & Microservices',
                        'weightage': 20.0,
                        'skills': ['REST APIs', 'JSON', 'HTTP', 'Authentication'],
                        'question_types': ['technical', 'behavioral']
                    },
                    {
                        'title': 'Problem Solving',
                        'weightage': 20.0,
                        'skills': ['Algorithm Design', 'Optimization', 'Debugging'],
                        'question_types': ['behavioral', 'technical']
                    },
                    {
                        'title': 'Communication',
                        'weightage': 10.0,
                        'skills': ['Technical Communication', 'Documentation'],
                        'question_types': ['behavioral']
                    }
                ],
                'total_weightage': 100.0,
                'framework_name': 'Python Developer Framework'
            }
        
        # Generic framework
        return {
            'competencies': [
                {
                    'title': 'Technical Skills',
                    'weightage': 30.0,
                    'skills': ['Core Technologies', 'Problem Solving'],
                    'question_types': ['technical', 'coding']
                },
                {
                    'title': 'Problem Solving',
                    'weightage': 25.0,
                    'skills': ['Analytical Thinking', 'Solution Design'],
                    'question_types': ['behavioral', 'technical']
                },
                {
                    'title': 'Communication',
                    'weightage': 20.0,
                    'skills': ['Technical Communication', 'Team Collaboration'],
                    'question_types': ['behavioral']
                },
                {
                    'title': 'Experience',
                    'weightage': 25.0,
                    'skills': ['Project Management', 'Real-world Application'],
                    'question_types': ['behavioral', 'scenario']
                }
            ],
            'total_weightage': 100.0,
            'framework_name': 'Generic Framework'
        }


class QuestionGenerationService:
    """
    Service for generating competency-based questions
    """
    
    def __init__(self):
        self.llm_service = LLMQuestionService()
        self.competency_service = CompetencyFrameworkService()
    
    def generate_competency_questions(self, session: InterviewSession) -> List[Dict[str, Any]]:
        """
        Generate questions for each competency in the interview session
        """
        try:
            # Get or generate competency framework
            framework = self.competency_service.generate_competency_framework(
                session.job_description, 
                session.candidate
            )
            
            questions = []
            
            for competency in framework['competencies']:
                competency_questions = self._generate_questions_for_competency(
                    competency, 
                    session.job_description, 
                    session.candidate
                )
                
                questions.append({
                    'competency': competency,
                    'questions': competency_questions
                })
            
            return questions
            
        except Exception as e:
            logger.error(f"Error generating competency questions: {str(e)}")
            return self._get_fallback_questions()
    
    def _generate_questions_for_competency(self, competency: Dict, job: JobDescription, candidate: Candidate) -> List[Dict]:
        """
        Generate questions for a specific competency
        """
        questions = []
        
        # Generate 2-4 questions per competency
        num_questions = min(4, len(competency['question_types']))
        
        for i in range(num_questions):
            question_type = competency['question_types'][i % len(competency['question_types'])]
            
            question_prompt = f"""
            Generate a {question_type} question for the competency: {competency['title']}
            
            Job: {job.title} at {job.company}
            Required Skills: {', '.join(competency['skills'])}
            
            The question should:
            1. Be specific to {competency['title']}
            2. Include expected answer focus points
            3. Be appropriate for {question_type} type
            4. Include follow-up question if applicable
            
            Return as JSON with: question_text, expected_focus, follow_up_question, difficulty
            """
            
            try:
                response = self.llm_service.generate_question(
                    prompt_template=question_prompt,
                    skill=competency['title'],
                    level="intermediate",
                    question_type=question_type,
                    context=f"Competency: {competency['title']}\nSkills: {', '.join(competency['skills'])}\nQuestion Type: {question_type}"
                )
                
                question_data = self._parse_question_response(response, competency, question_type)
                questions.append(question_data)
                
            except Exception as e:
                logger.error(f"Error generating question for {competency['title']}: {str(e)}")
                # Add fallback question
                questions.append(self._get_fallback_question(competency, question_type))
        
        return questions
    
    def _parse_question_response(self, response: str, competency: Dict, question_type: str) -> Dict:
        """
        Parse LLM response into structured question data
        """
        try:
            import json
            data = json.loads(response)
            return {
                'question_text': data.get('question_text', ''),
                'expected_focus': data.get('expected_focus', ''),
                'follow_up_question': data.get('follow_up_question', ''),
                'difficulty': data.get('difficulty', 'medium'),
                'question_type': question_type,
                'competency_title': competency['title']
            }
        except:
            return self._get_fallback_question(competency, question_type)
    
    def _get_fallback_question(self, competency: Dict, question_type: str) -> Dict:
        """
        Get fallback question when AI generation fails
        """
        fallback_questions = {
            'Python Basics': {
                'technical': {
                    'question_text': 'Explain the difference between a list and a tuple in Python.',
                    'expected_focus': 'Mutability, performance, usage scenarios.',
                    'follow_up_question': 'When would you prefer one over the other?'
                },
                'coding': {
                    'question_text': 'Write a Python snippet to reverse a string without using slicing.',
                    'expected_focus': 'Loops, built-in functions.',
                    'follow_up_question': 'How would you optimize this for large strings?'
                }
            },
            'Functional Programming': {
                'technical': {
                    'question_text': 'Can you give an example of a higher-order function in Python from your past projects?',
                    'expected_focus': 'Application in real-world scenario.',
                    'follow_up_question': 'What were the benefits of using this approach?'
                },
                'coding': {
                    'question_text': 'Implement a custom map() function in Python.',
                    'expected_focus': 'Closures, iterables.',
                    'follow_up_question': 'How would you handle edge cases?'
                }
            },
            'Exception Handling': {
                'behavioral': {
                    'question_text': 'Describe a time when you caught an unexpected exception in production. How did you debug and fix it?',
                    'expected_focus': 'STAR/CAR structure.',
                    'follow_up_question': 'What preventive measures did you implement?'
                },
                'technical': {
                    'question_text': 'Write a Python function that handles file read errors gracefully.',
                    'expected_focus': 'try-except-finally usage.',
                    'follow_up_question': 'How would you handle different types of file errors?'
                }
            },
            'API & Microservices': {
                'technical': {
                    'question_text': 'Given a REST API returning JSON, write Python code to fetch and parse the response.',
                    'expected_focus': 'requests library, JSON parsing.',
                    'follow_up_question': 'How would you handle API rate limiting?'
                },
                'behavioral': {
                    'question_text': 'Explain how you would handle authentication in an API-based microservice architecture.',
                    'expected_focus': 'JWT, OAuth2.',
                    'follow_up_question': 'What security considerations would you implement?'
                }
            }
        }
        
        competency_questions = fallback_questions.get(competency['title'], {})
        question_data = competency_questions.get(question_type, {
            'question_text': f'Tell me about your experience with {competency["title"]}.',
            'expected_focus': 'Relevant experience and skills.',
            'follow_up_question': 'Can you provide a specific example?'
        })
        
        return {
            **question_data,
            'difficulty': 'medium',
            'question_type': question_type,
            'competency_title': competency['title']
        }
    
    def _get_fallback_questions(self) -> List[Dict[str, Any]]:
        """
        Get fallback questions when framework generation fails
        """
        return [
            {
                'competency': {
                    'title': 'Technical Skills',
                    'weightage': 30.0,
                    'skills': ['Core Technologies', 'Problem Solving'],
                    'question_types': ['technical', 'coding']
                },
                'questions': [
                    {
                        'question_text': 'What are your strongest technical skills?',
                        'expected_focus': 'Technical depth and breadth.',
                        'follow_up_question': 'Can you provide a specific example?',
                        'difficulty': 'medium',
                        'question_type': 'behavioral',
                        'competency_title': 'Technical Skills'
                    }
                ]
            }
        ]


class InterviewFlowService:
    """
    Service for managing the real-time interview flow
    """
    
    def __init__(self):
        self.question_service = QuestionGenerationService()
    
    def prepare_interview_session(self, session: InterviewSession) -> Dict[str, Any]:
        """
        Prepare interview session with competency framework and questions
        """
        try:
            # Generate competency questions
            competency_questions = self.question_service.generate_competency_questions(session)
            
            # Create interview structure
            interview_structure = {
                'session_id': session.session_id,
                'candidate': {
                    'name': session.candidate.full_name,
                    'email': session.candidate.email
                },
                'job': {
                    'title': session.job_description.title,
                    'company': session.job_description.company,
                    'job_id': session.job_description.job_id
                },
                'interview_type': session.interview_type,
                'competency_questions': competency_questions,
                'ai_enabled': session.ai_enabled,
                'ai_mode': session.ai_mode
            }
            
            return interview_structure
            
        except Exception as e:
            logger.error(f"Error preparing interview session: {str(e)}")
            raise
    
    def mark_question_answered(self, question_id: str, session_id: str) -> bool:
        """
        Mark a question as answered in the interview
        """
        try:
            question = InterviewQuestion.objects.get(id=question_id, session__session_id=session_id)
            question.answered_at = timezone.now()
            question.save()
            return True
        except InterviewQuestion.DoesNotExist:
            return False
    
    def score_competency(self, session_id: str, competency_title: str, score: float, 
                        star_observations: Dict = None, car_observations: Dict = None) -> bool:
        """
        Score a competency during the interview
        """
        try:
            session = InterviewSession.objects.get(session_id=session_id)
            
            # Get or create competency evaluation
            evaluation, created = CompetencyEvaluation.objects.get_or_create(
                session=session,
                competency_title=competency_title,
                defaults={
                    'competency_description': f"Evaluation for {competency_title}",
                    'evaluation_method': 'STAR',
                    'score': score,
                    'weightage': 20.0,  # Default weightage
                    'star_observations': star_observations or {},
                    'car_observations': car_observations or {}
                }
            )
            
            if not created:
                evaluation.score = score
                if star_observations:
                    evaluation.star_observations = star_observations
                if car_observations:
                    evaluation.car_observations = car_observations
                evaluation.save()
            
            return True
            
        except Exception as e:
            logger.error(f"Error scoring competency: {str(e)}")
            return False
    
    def add_follow_up_question(self, session_id: str, competency_title: str, 
                              question_text: str, question_type: str = 'behavioral') -> Dict:
        """
        Add a follow-up question during the interview
        """
        try:
            session = InterviewSession.objects.get(session_id=session_id)
            
            question = InterviewQuestion.objects.create(
                session=session,
                question_text=question_text,
                question_type=question_type,
                competency_title=competency_title
            )
            
            return {
                'question_id': str(question.id),
                'question_text': question.question_text,
                'competency_title': question.competency_title,
                'question_type': question.question_type
            }
            
        except Exception as e:
            logger.error(f"Error adding follow-up question: {str(e)}")
            return None
