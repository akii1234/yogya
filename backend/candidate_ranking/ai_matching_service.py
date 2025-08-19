import os
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from django.conf import settings

# Try to import Gemini
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: Google Generative AI not available. Install with: pip install google-generativeai")

logger = logging.getLogger(__name__)

class AIResumeMatchingService:
    """
    AI-powered resume matching service using Gemini API for enhanced skill matching.
    Falls back to traditional matching logic if AI is not available.
    """
    
    def __init__(self):
        """Initialize the AI matching service"""
        self.gemini_client = None
        self.ai_available = False
        
        # Initialize Gemini client
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        if gemini_api_key and GEMINI_AVAILABLE:
            try:
                genai.configure(api_key=gemini_api_key)
                self.gemini_client = genai
                self.ai_available = True
                logger.info("AI Resume Matching Service initialized with Gemini")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")
        else:
            if not GEMINI_AVAILABLE:
                logger.warning("Gemini library not available - using fallback matching")
            else:
                logger.warning("Gemini API key not found - using fallback matching")
    
    def calculate_ai_skill_match(
        self, 
        job_description: str, 
        job_requirements: str, 
        candidate_skills: List[str], 
        candidate_experience: str = "",
        candidate_education: str = ""
    ) -> Dict[str, Any]:
        """
        Calculate skill matching score using AI analysis.
        
        Args:
            job_description: Full job description
            job_requirements: Job requirements text
            candidate_skills: List of candidate skills
            candidate_experience: Candidate's experience description
            candidate_education: Candidate's education description
            
        Returns:
            Dict with AI analysis results
        """
        if not self.ai_available:
            logger.warning("AI not available, using fallback matching")
            return self._fallback_skill_match(job_description, job_requirements, candidate_skills)
        
        try:
            # Prepare the prompt for Gemini
            prompt = self._create_skill_matching_prompt(
                job_description, job_requirements, candidate_skills, 
                candidate_experience, candidate_education
            )
            
            # Generate response using Gemini
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            
            # Parse the response
            result = self._parse_ai_response(response.text)
            
            logger.info(f"AI skill matching completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"AI skill matching failed: {e}")
            logger.info("Falling back to traditional matching")
            return self._fallback_skill_match(job_description, job_requirements, candidate_skills)
    
    def _create_skill_matching_prompt(
        self, 
        job_description: str, 
        job_requirements: str, 
        candidate_skills: List[str], 
        candidate_experience: str,
        candidate_education: str
    ) -> str:
        """Create a detailed prompt for AI skill matching"""
        
        prompt = f"""
You are an expert HR recruiter and technical assessor. Analyze the match between a job posting and a candidate's profile.

JOB DESCRIPTION:
{job_description}

JOB REQUIREMENTS:
{job_requirements}

CANDIDATE PROFILE:
Skills: {', '.join(candidate_skills) if candidate_skills else 'None specified'}
Experience: {candidate_experience if candidate_experience else 'Not specified'}
Education: {candidate_education if candidate_education else 'Not specified'}

TASK:
Analyze the skill match between the candidate and the job requirements. Consider:
1. Direct skill matches (exact matches)
2. Related skills (e.g., "JavaScript" matches "JS", "React" matches "Frontend")
3. Skill levels and experience depth
4. Transferable skills
5. Missing critical skills

Provide your analysis in the following JSON format:
{{
    "overall_score": <score_0_100>,
    "skill_analysis": {{
        "matched_skills": ["skill1", "skill2"],
        "related_skills": ["skill1", "skill2"],
        "missing_critical_skills": ["skill1", "skill2"],
        "missing_nice_to_have_skills": ["skill1", "skill2"]
    }},
    "experience_match": {{
        "score": <score_0_100>,
        "analysis": "detailed analysis of experience match"
    }},
    "education_match": {{
        "score": <score_0_100>,
        "analysis": "detailed analysis of education match"
    }},
    "detailed_reasoning": "comprehensive explanation of the match",
    "recommendations": ["recommendation1", "recommendation2"]
}}

IMPORTANT: Return ONLY valid JSON. Do not include any other text.
"""
        return prompt
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the AI response and extract structured data"""
        try:
            # Clean the response text
            cleaned_text = response_text.strip()
            if cleaned_text.startswith('```json'):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.endswith('```'):
                cleaned_text = cleaned_text[:-3]
            
            # Parse JSON
            result = json.loads(cleaned_text)
            
            # Validate and normalize the result
            normalized_result = {
                'overall_score': min(100, max(0, float(result.get('overall_score', 0)))),
                'skill_analysis': {
                    'matched_skills': result.get('skill_analysis', {}).get('matched_skills', []),
                    'related_skills': result.get('skill_analysis', {}).get('related_skills', []),
                    'missing_critical_skills': result.get('skill_analysis', {}).get('missing_critical_skills', []),
                    'missing_nice_to_have_skills': result.get('skill_analysis', {}).get('missing_nice_to_have_skills', [])
                },
                'experience_match': {
                    'score': min(100, max(0, float(result.get('experience_match', {}).get('score', 0)))),
                    'analysis': result.get('experience_match', {}).get('analysis', '')
                },
                'education_match': {
                    'score': min(100, max(0, float(result.get('education_match', {}).get('score', 0)))),
                    'analysis': result.get('education_match', {}).get('analysis', '')
                },
                'detailed_reasoning': result.get('detailed_reasoning', ''),
                'recommendations': result.get('recommendations', []),
                'ai_used': True
            }
            
            return normalized_result
            
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            logger.error(f"Failed to parse AI response: {e}")
            logger.error(f"Response text: {response_text}")
            raise ValueError(f"Invalid AI response format: {e}")
    
    def _fallback_skill_match(
        self, 
        job_description: str, 
        job_requirements: str, 
        candidate_skills: List[str]
    ) -> Dict[str, Any]:
        """Fallback to traditional skill matching logic"""
        
        # Extract skills from job description and requirements
        job_skills = self._extract_skills_from_text(job_description + " " + job_requirements)
        
        # Calculate basic matching
        candidate_skills_set = set(skill.lower().strip() for skill in candidate_skills) if candidate_skills else set()
        job_skills_set = set(skill.lower().strip() for skill in job_skills)
        
        # Calculate matches
        matched_skills = job_skills_set.intersection(candidate_skills_set)
        missing_skills = job_skills_set - candidate_skills_set
        
        # Calculate score
        if not job_skills_set:
            overall_score = 50
        else:
            match_ratio = len(matched_skills) / len(job_skills_set)
            overall_score = min(100, match_ratio * 100)
        
        return {
            'overall_score': round(overall_score, 2),
            'skill_analysis': {
                'matched_skills': list(matched_skills),
                'related_skills': [],
                'missing_critical_skills': list(missing_skills),
                'missing_nice_to_have_skills': []
            },
            'experience_match': {
                'score': 50,  # Default fallback score
                'analysis': 'Experience analysis not available in fallback mode'
            },
            'education_match': {
                'score': 50,  # Default fallback score
                'analysis': 'Education analysis not available in fallback mode'
            },
            'detailed_reasoning': f'Fallback matching: {len(matched_skills)}/{len(job_skills_set)} skills matched',
            'recommendations': ['Consider using AI matching for more detailed analysis'],
            'ai_used': False
        }
    
    def _extract_skills_from_text(self, text: str) -> List[str]:
        """Extract skills from text using basic keyword matching"""
        # Common technical skills
        common_skills = {
            'python', 'java', 'javascript', 'react', 'angular', 'vue', 'node.js',
            'sql', 'mysql', 'postgresql', 'mongodb', 'aws', 'azure', 'docker',
            'kubernetes', 'git', 'agile', 'scrum', 'machine learning', 'ai',
            'data science', 'html', 'css', 'php', 'c++', 'c#', '.net', 'spring',
            'django', 'flask', 'express', 'typescript', 'redux', 'vuex',
            'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn',
            'jenkins', 'travis', 'circleci', 'github actions', 'terraform',
            'ansible', 'chef', 'puppet', 'elasticsearch', 'redis', 'kafka',
            'rabbitmq', 'nginx', 'apache', 'linux', 'unix', 'bash', 'shell'
        }
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in common_skills:
            if skill in text_lower:
                found_skills.append(skill)
        
        return found_skills
    
    def enhance_ranking_with_ai(
        self, 
        job_description: str, 
        job_requirements: str, 
        candidate_skills: List[str],
        candidate_experience: str = "",
        candidate_education: str = "",
        traditional_scores: Dict[str, float] = None
    ) -> Dict[str, Any]:
        """
        Enhance traditional ranking scores with AI analysis.
        
        Args:
            job_description: Full job description
            job_requirements: Job requirements text
            candidate_skills: List of candidate skills
            candidate_experience: Candidate's experience description
            candidate_education: Candidate's education description
            traditional_scores: Traditional scoring results
            
        Returns:
            Enhanced ranking results
        """
        
        # Get AI analysis
        ai_analysis = self.calculate_ai_skill_match(
            job_description, job_requirements, candidate_skills,
            candidate_experience, candidate_education
        )
        
        # If we have traditional scores, blend them
        if traditional_scores:
            enhanced_scores = self._blend_scores(ai_analysis, traditional_scores)
        else:
            enhanced_scores = ai_analysis
        
        return enhanced_scores
    
    def _blend_scores(self, ai_analysis: Dict[str, Any], traditional_scores: Dict[str, float]) -> Dict[str, Any]:
        """Blend AI analysis with traditional scores"""
        
        # Use AI score as primary, but consider traditional scores for validation
        ai_score = ai_analysis['overall_score']
        traditional_score = traditional_scores.get('overall_score', 0)
        
        # If AI and traditional scores are very different, use weighted average
        score_diff = abs(ai_score - traditional_score)
        if score_diff > 20:  # Significant difference
            # Use 70% AI, 30% traditional
            blended_score = (ai_score * 0.7) + (traditional_score * 0.3)
        else:
            # Use AI score as primary
            blended_score = ai_score
        
        enhanced_analysis = ai_analysis.copy()
        enhanced_analysis['overall_score'] = round(blended_score, 2)
        enhanced_analysis['traditional_score'] = traditional_score
        enhanced_analysis['score_blending_used'] = score_diff > 20
        
        return enhanced_analysis

# Global instance
ai_matching_service = AIResumeMatchingService()
