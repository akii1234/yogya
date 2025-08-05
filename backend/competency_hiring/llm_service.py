import os
import json
import logging
from typing import Dict, List, Optional, Any
from openai import OpenAI
import pplx

logger = logging.getLogger(__name__)

class LLMQuestionService:
    """
    Service for generating questions using various LLM providers.
    Supports both OpenAI and Perplexity APIs.
    """
    
    # Available models for different providers
    AVAILABLE_MODELS = {
        'openai': [
            'gpt-4',
            'gpt-3.5-turbo', 
            'gpt-4o-mini',
            'o1-mini'
        ],
        'perplexity': [
            'llama-3.1-8b-instant',
            'llama-3.1-70b-versatile',
            'llama-3.1-405b-reasoning',
            'mixtral-8x7b-instruct',
            'codellama-70b-instruct',
            'pplx-7b-online',
            'pplx-70b-online',
            'pplx-7b-chat',
            'pplx-70b-chat'
        ]
    }
    
    def __init__(self, preferred_provider='perplexity', preferred_model=None):
        """
        Initialize the LLM service.
        
        Args:
            preferred_provider: 'openai' or 'perplexity'
            preferred_model: Specific model name to use
        """
        self.preferred_provider = preferred_provider
        self.preferred_model = preferred_model
        
        # Initialize API clients
        self.openai_client = None
        self.perplexity_client = None
        
        # Try to initialize OpenAI client
        openai_api_key = os.getenv('OPENAI_API_KEY')
        if openai_api_key:
            try:
                self.openai_client = OpenAI(api_key=openai_api_key)
                logger.info("OpenAI client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
        
        # Try to initialize Perplexity client
        perplexity_api_key = os.getenv('PERPLEXITY_API_KEY')
        if perplexity_api_key:
            try:
                self.perplexity_client = pplx.Perplexity(api_key=perplexity_api_key)
                logger.info("Perplexity client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Perplexity client: {e}")
        
        # Determine the best available model
        self.completion_model = self.get_best_available_model()
        self.embedding_model = self.get_best_embedding_model()
        
        logger.info(f"LLM Service initialized with provider: {self.preferred_provider}, model: {self.completion_model}")
    
    def get_best_available_model(self) -> str:
        """Get the best available model based on preference and availability."""
        if self.preferred_model:
            return self.preferred_model
        
        # Perplexity models (preferred)
        if self.perplexity_client:
            perplexity_models = self.AVAILABLE_MODELS['perplexity']
            # Prefer reasoning models for question generation
            for model in ['llama-3.1-405b-reasoning', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant']:
                if model in perplexity_models:
                    return model
        
        # OpenAI models (fallback)
        if self.openai_client:
            openai_models = self.AVAILABLE_MODELS['openai']
            for model in ['o1-mini', 'gpt-4o-mini', 'gpt-3.5-turbo']:
                if model in openai_models:
                    return model
        
        # Default fallback
        return 'llama-3.1-8b-instant'
    
    def get_best_embedding_model(self) -> str:
        """Get the best available embedding model."""
        # Perplexity doesn't have dedicated embedding models, use OpenAI
        if self.openai_client:
            return 'text-embedding-3-small'
        return 'text-embedding-ada-002'
    
    def test_model_availability(self, model_name: str) -> Dict[str, Any]:
        """Test if a specific model is available."""
        try:
            if model_name in self.AVAILABLE_MODELS['perplexity']:
                if not self.perplexity_client:
                    return {'available': False, 'error': 'Perplexity client not initialized'}
                
                # Test with a simple prompt
                response = self.perplexity_client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": "Hello"}],
                    max_tokens=10
                )
                return {'available': True, 'provider': 'perplexity'}
                
            elif model_name in self.AVAILABLE_MODELS['openai']:
                if not self.openai_client:
                    return {'available': False, 'error': 'OpenAI client not initialized'}
                
                # Test with a simple prompt
                response = self.openai_client.chat.completions.create(
                    model=model_name,
                    messages=[{"role": "user", "content": "Hello"}],
                    max_tokens=10
                )
                return {'available': True, 'provider': 'openai'}
                
            else:
                return {'available': False, 'error': f'Model {model_name} not found'}
                
        except Exception as e:
            return {'available': False, 'error': str(e)}
    
    def generate_question(self, prompt_template: str, skill: str, level: str, 
                         question_type: str, context: str = "") -> Dict[str, Any]:
        """
        Generate a question using the LLM service.
        
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
            
            # Try Perplexity first (preferred)
            if self.perplexity_client and self.completion_model in self.AVAILABLE_MODELS['perplexity']:
                try:
                    response = self.perplexity_client.chat.completions.create(
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
                            'provider': 'perplexity'
                        },
                        'metadata': {
                            'model': self.completion_model,
                            'provider': 'perplexity',
                            'tokens_used': response.usage.total_tokens if hasattr(response, 'usage') else None
                        }
                    }
                    
                except Exception as e:
                    logger.warning(f"Perplexity generation failed: {e}")
            
            # Fallback to OpenAI
            if self.openai_client and self.completion_model in self.AVAILABLE_MODELS['openai']:
                try:
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
                    logger.error(f"OpenAI generation failed: {e}")
            
            # If both failed, return error
            return {
                'success': False,
                'error': 'No available LLM providers could generate the question'
            }
            
        except Exception as e:
            logger.error(f"Error generating question: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_embeddings(self, text: str) -> List[float]:
        """Generate embeddings for text using OpenAI (Perplexity doesn't have embedding models)."""
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
            
            # Try Perplexity first
            if self.perplexity_client:
                try:
                    response = self.perplexity_client.chat.completions.create(
                        model=self.completion_model,
                        messages=messages,
                        max_tokens=200,
                        temperature=0.3
                    )
                    
                    result = json.loads(response.choices[0].message.content.strip())
                    return {
                        'success': True,
                        'assessment': result,
                        'provider': 'perplexity'
                    }
                    
                except Exception as e:
                    logger.warning(f"Perplexity assessment failed: {e}")
            
            # Fallback to OpenAI
            if self.openai_client:
                try:
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
                    logger.error(f"OpenAI assessment failed: {e}")
            
            return {
                'success': False,
                'error': 'Could not assess question quality'
            }
            
        except Exception as e:
            logger.error(f"Error assessing question quality: {e}")
            return {
                'success': False,
                'error': str(e)
            } 