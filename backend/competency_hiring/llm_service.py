import os
import json
import logging
from typing import Dict, List, Optional, Any
from openai import OpenAI

logger = logging.getLogger(__name__)

class LLMQuestionService:
    """
    Service for generating questions using OpenAI API.
    """
    
    # Available OpenAI models
    AVAILABLE_MODELS = [
        'gpt-4',
        'gpt-3.5-turbo', 
        'gpt-4o-mini',
        'o1-mini'
    ]
    
    def __init__(self, preferred_model=None):
        """
        Initialize the LLM service.
        
        Args:
            preferred_model: Specific model name to use
        """
        self.preferred_model = preferred_model
        
        # Initialize OpenAI client
        self.openai_client = None
        openai_api_key = os.getenv('OPENAI_API_KEY')
        if openai_api_key:
            try:
                self.openai_client = OpenAI(api_key=openai_api_key)
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
        else:
            logger.warning("OpenAI API key not found")
        
        # Determine the best available model
        self.completion_model = self.get_best_available_model()
        self.embedding_model = 'text-embedding-3-small'
        
        logger.info(f"LLM Service initialized with model: {self.completion_model}")
    
    def get_best_available_model(self) -> str:
        """Get the best available model based on preference and availability."""
        if self.preferred_model:
            return self.preferred_model
        
        # Prefer o1-mini for cost-effectiveness, then gpt-4o-mini
        for model in ['o1-mini', 'gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4']:
            if model in self.AVAILABLE_MODELS:
                return model
        
        # Default fallback
        return 'gpt-3.5-turbo'
    
    def test_model_availability(self, model_name: str) -> Dict[str, Any]:
        """Test if a specific model is available."""
        try:
            if not self.openai_client:
                return {'available': False, 'error': 'OpenAI client not initialized'}
            
            if model_name not in self.AVAILABLE_MODELS:
                return {'available': False, 'error': f'Model {model_name} not found'}
            
            # Test with a simple prompt
            response = self.openai_client.chat.completions.create(
                model=model_name,
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=10
            )
            return {'available': True, 'provider': 'openai'}
                
        except Exception as e:
            return {'available': False, 'error': str(e)}
    
    def generate_question(self, prompt_template: str, skill: str, level: str, 
                         question_type: str, context: str = "") -> Dict[str, Any]:
        """
        Generate a question using the OpenAI API.
        
        Args:
            prompt_template: The prompt template to use
            skill: The skill to focus on
            level: Difficulty level (easy, medium, hard)
            question_type: Type of question (technical, behavioral, etc.)
            context: Additional context for the question
            
        Returns:
            Dict containing the generated question and metadata
        """
        try:
            if not self.openai_client:
                return {
                    'success': False,
                    'error': 'OpenAI client not initialized'
                }
            
            # Format the prompt
            formatted_prompt = prompt_template.format(
                skill=skill,
                level=level,
                context=context
            )
            
            # Add system message for better results
            system_message = f"""You are an expert technical interviewer specializing in {skill} questions.
Generate a high-quality {question_type} question for a {level} level professional.
The question should be clear, practical, and test real-world understanding.
Provide only the question text, no explanations or additional text."""
            
            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": formatted_prompt}
            ]
            
            response = self.openai_client.chat.completions.create(
                model=self.completion_model,
                messages=messages,
                max_tokens=500,
                temperature=0.7
            )
            
            question_text = response.choices[0].message.content.strip()
            
            return {
                'success': True,
                'question': {
                    'text': question_text,
                    'skill': skill,
                    'level': level,
                    'type': question_type,
                    'context': context,
                    'model_used': self.completion_model,
                    'provider': 'openai'
                },
                'metadata': {
                    'model': self.completion_model,
                    'provider': 'openai',
                    'tokens_used': response.usage.total_tokens
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating question: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_embeddings(self, text: str) -> List[float]:
        """Generate embeddings for text using OpenAI."""
        try:
            if not self.openai_client:
                raise Exception("OpenAI client not available for embeddings")
            
            response = self.openai_client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            
            return response.data[0].embedding
            
        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            raise
    
    def assess_question_quality(self, question_text: str, skill: str, level: str) -> Dict[str, Any]:
        """Assess the quality of a generated question."""
        try:
            if not self.openai_client:
                return {
                    'success': False,
                    'error': 'OpenAI client not initialized'
                }
            
            assessment_prompt = f"""Rate the quality of this {skill} question for {level} level:

Question: {question_text}

Rate on a scale of 1-10 for:
1. Clarity (1-10)
2. Relevance to skill (1-10) 
3. Appropriate difficulty (1-10)
4. Practical value (1-10)

Provide only the scores as JSON: {{"clarity": X, "relevance": X, "difficulty": X, "practical_value": X, "overall": X}}"""

            messages = [
                {"role": "system", "content": "You are a quality assessment expert. Provide only JSON responses."},
                {"role": "user", "content": assessment_prompt}
            ]
            
            response = self.openai_client.chat.completions.create(
                model=self.completion_model,
                messages=messages,
                max_tokens=200,
                temperature=0.3
            )
            
            result = json.loads(response.choices[0].message.content.strip())
            return {
                'success': True,
                'assessment': result,
                'provider': 'openai'
            }
            
        except Exception as e:
            logger.error(f"Error assessing question quality: {e}")
            return {
                'success': False,
                'error': str(e)
            } 