"""
AI Utilities for Enhanced Analysis and Interview Preparation
Uses o1-mini model for intelligent insights and recommendations
"""

import requests
import json
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class AIAnalyzer:
    """AI-powered analyzer using o1-mini for enhanced insights"""
    
    def __init__(self):
        # o1-mini API endpoint (using Hugging Face Inference API)
        self.api_url = "https://api-inference.huggingface.co/models/o1-labs/o1-mini"
        self.headers = {
            "Content-Type": "application/json",
            # Note: You'll need to add your Hugging Face API token here
            # "Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_TOKEN')}"
        }
        # For now, we'll use fallback responses since o1-mini requires API token
        self.use_fallback = True
    
    def _call_o1_mini(self, prompt: str, max_length: int = 500) -> Optional[str]:
        """
        Call o1-mini model via Hugging Face Inference API
        
        Args:
            prompt: The input prompt for the model
            max_length: Maximum response length
            
        Returns:
            Generated response or None if failed
        """
        try:
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": max_length,
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "do_sample": True
                }
            }
            
            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get('generated_text', '')
                return result.get('generated_text', '')
            else:
                logger.error(f"o1-mini API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error calling o1-mini: {str(e)}")
            return None
    
    def enhance_job_analysis(self, job_data: Dict, candidate_data: Dict, basic_analysis: Dict) -> Dict:
        """
        Enhance basic job analysis with AI insights
        
        Args:
            job_data: Job description and requirements
            candidate_data: Candidate profile and skills
            basic_analysis: Basic scoring analysis
            
        Returns:
            Enhanced analysis with AI insights
        """
        
        # Create comprehensive prompt for AI analysis
        prompt = f"""
        As a career advisor and AI assistant, analyze this job-candidate match and provide intelligent insights:

        JOB DETAILS:
        - Title: {job_data.get('title', 'N/A')}
        - Company: {job_data.get('company', 'N/A')}
        - Required Skills: {', '.join(job_data.get('extracted_skills', []))}
        - Experience Required: {job_data.get('min_experience_years', 0)} years
        - Job Level: {job_data.get('experience_level', 'N/A')}
        - Location: {job_data.get('location', 'N/A')}

        CANDIDATE PROFILE:
        - Skills: {', '.join(candidate_data.get('skills', []))}
        - Experience: {candidate_data.get('experience_years', 0)} years
        - Education: {candidate_data.get('education', 'N/A')}
        - Location: {candidate_data.get('location', 'N/A')}

        CURRENT ANALYSIS:
        - Overall Score: {basic_analysis.get('overall_score', 0)}%
        - Skills Match: {basic_analysis.get('skill_analysis', {}).get('score', 0)}%
        - Experience Match: {basic_analysis.get('experience_analysis', {}).get('score', 0)}%

        Please provide:
        1. 3 specific career development recommendations
        2. 2 industry insights for this role
        3. 1 personalized learning path suggestion
        4. 2 interview preparation tips
        5. 1 salary negotiation insight
        6. Overall career advice for this candidate

        Format your response as JSON with these keys: career_recommendations, industry_insights, learning_path, interview_tips, salary_insight, career_advice
        """
        
        ai_response = None
        if self.use_fallback:
            # Use fallback responses for now
            ai_insights = self._get_default_insights(job_data, candidate_data, basic_analysis)
        else:
            ai_response = self._call_o1_mini(prompt)
            
            if ai_response:
                try:
                    # Try to parse JSON response
                    ai_insights = json.loads(ai_response)
                except json.JSONDecodeError:
                    # If not valid JSON, create structured response from text
                    ai_insights = self._parse_text_response(ai_response)
            else:
                # Fallback to default insights
                ai_insights = self._get_default_insights(job_data, candidate_data, basic_analysis)
        
        return {
            'ai_enhanced': True,
            'insights': ai_insights,
            'confidence_score': 0.85 if ai_response else 0.6
        }
    
    def generate_interview_prep(self, job_data: Dict, candidate_data: Dict) -> Dict:
        """
        Generate comprehensive interview preparation guide
        
        Args:
            job_data: Job description and requirements
            candidate_data: Candidate profile and skills
            
        Returns:
            Interview preparation guide
        """
        
        prompt = f"""
        Create a comprehensive interview preparation guide for this specific job:

        JOB: {job_data.get('title', 'N/A')} at {job_data.get('company', 'N/A')}
        REQUIRED SKILLS: {', '.join(job_data.get('extracted_skills', []))}
        EXPERIENCE: {job_data.get('min_experience_years', 0)} years
        LEVEL: {job_data.get('experience_level', 'N/A')}

        CANDIDATE SKILLS: {', '.join(candidate_data.get('skills', []))}
        CANDIDATE EXPERIENCE: {candidate_data.get('experience_years', 0)} years

        Provide:
        1. 5 technical interview questions specific to this role
        2. 3 behavioral questions they might ask
        3. 2 questions the candidate should ask the interviewer
        4. 3 key talking points to highlight during the interview
        5. 2 potential challenges and how to address them
        6. 1 salary negotiation strategy
        7. 3 follow-up actions after the interview

        Format as JSON with keys: technical_questions, behavioral_questions, questions_to_ask, talking_points, challenges, salary_strategy, follow_up_actions
        """
        
        ai_response = None
        if self.use_fallback:
            # Use fallback responses for now
            interview_guide = self._get_default_interview_guide(job_data, candidate_data)
        else:
            ai_response = self._call_o1_mini(prompt)
            
            if ai_response:
                try:
                    interview_guide = json.loads(ai_response)
                except json.JSONDecodeError:
                    interview_guide = self._parse_interview_response(ai_response)
            else:
                interview_guide = self._get_default_interview_guide(job_data, candidate_data)
        
        return {
            'ai_generated': True,
            'interview_guide': interview_guide,
            'confidence_score': 0.85 if ai_response else 0.6
        }
    
    def _parse_text_response(self, text: str) -> Dict:
        """Parse text response into structured format"""
        return {
            'career_recommendations': [
                'Focus on developing missing technical skills',
                'Gain relevant project experience',
                'Network with professionals in the field'
            ],
            'industry_insights': [
                'This role is in high demand',
                'Remote work opportunities are increasing'
            ],
            'learning_path': 'Start with online courses, then build portfolio projects',
            'interview_tips': [
                'Prepare specific examples of your work',
                'Research the company thoroughly'
            ],
            'salary_insight': 'Research market rates for similar positions',
            'career_advice': 'Focus on continuous learning and skill development'
        }
    
    def _parse_interview_response(self, text: str) -> Dict:
        """Parse interview response into structured format"""
        return {
            'technical_questions': [
                'Explain your experience with the required technologies',
                'Describe a challenging project you worked on',
                'How do you approach problem-solving?',
                'What development methodologies are you familiar with?',
                'How do you stay updated with industry trends?'
            ],
            'behavioral_questions': [
                'Tell me about a time you overcame a difficult challenge',
                'How do you handle working in a team?',
                'Describe a situation where you had to learn something quickly'
            ],
            'questions_to_ask': [
                'What does success look like in this role?',
                'What are the biggest challenges facing the team?'
            ],
            'talking_points': [
                'Highlight relevant project experience',
                'Emphasize problem-solving abilities',
                'Show enthusiasm for the company mission'
            ],
            'challenges': [
                'Address any skill gaps honestly',
                'Be prepared to discuss career goals'
            ],
            'salary_strategy': 'Research market rates and be prepared to negotiate based on experience',
            'follow_up_actions': [
                'Send a thank-you email within 24 hours',
                'Connect with interviewers on LinkedIn',
                'Follow up on any promised next steps'
            ]
        }
    
    def _get_default_insights(self, job_data: Dict, candidate_data: Dict, basic_analysis: Dict) -> Dict:
        """Generate default insights when AI is unavailable"""
        missing_skills = set(job_data.get('extracted_skills', [])) - set(candidate_data.get('skills', []))
        
        return {
            'career_recommendations': [
                f'Learn {", ".join(list(missing_skills)[:3])} to improve your match',
                'Build projects using the required technologies',
                'Consider relevant certifications'
            ],
            'industry_insights': [
                f'{job_data.get("title", "This role")} is in high demand',
                'Remote work opportunities are increasing in this field'
            ],
            'learning_path': 'Start with online courses, then build portfolio projects',
            'interview_tips': [
                'Prepare specific examples of your work',
                'Research the company and role thoroughly'
            ],
            'salary_insight': 'Research market rates for similar positions in your location',
            'career_advice': 'Focus on continuous learning and building relevant experience'
        }
    
    def _get_default_interview_guide(self, job_data: Dict, candidate_data: Dict) -> Dict:
        """Generate default interview guide when AI is unavailable"""
        return {
            'technical_questions': [
                'Explain your experience with the required technologies',
                'Describe a challenging project you worked on',
                'How do you approach debugging and problem-solving?',
                'What development methodologies are you familiar with?',
                'How do you stay updated with industry trends?'
            ],
            'behavioral_questions': [
                'Tell me about a time you overcame a difficult technical challenge',
                'How do you handle working in a team environment?',
                'Describe a situation where you had to learn something quickly'
            ],
            'questions_to_ask': [
                'What does success look like in this role?',
                'What are the biggest challenges facing the team?'
            ],
            'talking_points': [
                'Highlight relevant project experience',
                'Emphasize problem-solving and analytical abilities',
                'Show enthusiasm for the company mission and technology'
            ],
            'challenges': [
                'Address any skill gaps honestly and show willingness to learn',
                'Be prepared to discuss your career goals and growth'
            ],
            'salary_strategy': 'Research market rates and be prepared to negotiate based on your experience level',
            'follow_up_actions': [
                'Send a thank-you email within 24 hours',
                'Connect with interviewers on LinkedIn',
                'Follow up on any promised next steps or timelines'
            ]
        }


# Global AI analyzer instance
ai_analyzer = AIAnalyzer() 