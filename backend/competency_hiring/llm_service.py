import os
import json
import logging
from typing import Dict, List, Optional, Any
# from openai import OpenAI  # Commented out OpenAI integration

# Try to import Gemini
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: Google Generative AI not available. Install with: pip install google-generativeai")

logger = logging.getLogger(__name__)

class LLMQuestionService:
    """
    Service for generating questions using Gemini AI (OpenAI integration temporarily disabled).
    """
    
    # Available OpenAI models (commented out)
    # OPENAI_MODELS = [
    #     'gpt-4',
    #     'gpt-3.5-turbo', 
    #     'gpt-4o-mini',
    #     'o1-mini'
    # ]
    
    # Available Gemini models
    GEMINI_MODELS = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro'
    ]
    
    def __init__(self, preferred_model=None, preferred_provider='gemini'):
        """
        Initialize the LLM service.
        
        Args:
            preferred_model: Specific model name to use
            preferred_provider: 'gemini' (default) - OpenAI temporarily disabled
        """
        self.preferred_model = preferred_model
        self.preferred_provider = preferred_provider
        
        # Initialize OpenAI client (commented out)
        # self.openai_client = None
        # openai_api_key = os.getenv('OPENAI_API_KEY')
        # if openai_api_key:
        #     try:
        #         self.openai_client = OpenAI(api_key=openai_api_key)
        #         logger.info("OpenAI client initialized successfully")
        #     except Exception as e:
        #         logger.warning(f"Failed to initialize OpenAI client: {e}")
        # else:
        #     logger.warning("OpenAI API key not found")
        
        # Initialize Gemini client
        self.gemini_client = None
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        if gemini_api_key and GEMINI_AVAILABLE:
            try:
                genai.configure(api_key=gemini_api_key)
                self.gemini_client = genai
                logger.info("Gemini client initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")
        else:
            if not GEMINI_AVAILABLE:
                logger.warning("Gemini library not available")
            else:
                logger.warning("Gemini API key not found")
        
        # Determine the best available model and provider
        self.completion_model, self.provider = self.get_best_available_model()
        # self.embedding_model = 'text-embedding-3-small'  # OpenAI only for embeddings (commented out)
        
        logger.info(f"LLM Service initialized with model: {self.completion_model} (Provider: {self.provider})")
    
    def get_best_available_model(self) -> tuple[str, str]:
        """Get the best available model and provider based on preference and availability."""
        # OpenAI provider selection (commented out)
        # if self.preferred_provider == 'openai' and self.openai_client:
        #     if self.preferred_model and self.preferred_model in self.OPENAI_MODELS:
        #         return self.preferred_model, 'openai'
        #     # Return best OpenAI model
        #     for model in ['o1-mini', 'gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4']:
        #         if model in self.OPENAI_MODELS:
        #             return model, 'openai'
        
        if self.preferred_provider == 'gemini' and self.gemini_client:
            if self.preferred_model and self.preferred_model in self.GEMINI_MODELS:
                return self.preferred_model, 'gemini'
            # Return best Gemini model
            for model in ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']:
                if model in self.GEMINI_MODELS:
                    return model, 'gemini'
        
        # Auto selection - prefer Gemini for cost-effectiveness
        if self.gemini_client:
            for model in ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']:
                if model in self.GEMINI_MODELS:
                    return model, 'gemini'
        
        # OpenAI fallback (commented out)
        # if self.openai_client:
        #     for model in ['o1-mini', 'gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4']:
        #         if model in self.OPENAI_MODELS:
        #             return model, 'openai'
        
        # Default fallback - now Gemini or error
        if self.gemini_client:
            return 'gemini-1.5-flash', 'gemini'
        else:
            raise Exception("No AI provider available. Please set GEMINI_API_KEY or re-enable OpenAI integration.")
    
    def test_model_availability(self, model_name: str, provider: str = None) -> Dict[str, Any]:
        """Test if a specific model is available."""
        try:
            # OpenAI model testing (commented out)
            # if provider == 'openai' or (provider is None and model_name in self.OPENAI_MODELS):
            #     if not self.openai_client:
            #         return {'available': False, 'error': 'OpenAI client not initialized'}
            #     
            #     if model_name not in self.OPENAI_MODELS:
            #         return {'available': False, 'error': f'OpenAI model {model_name} not found'}
            #     
            #     # Test with a simple prompt
            #     response = self.openai_client.chat.completions.create(
            #         model=model_name,
            #         messages=[{"role": "user", "content": "Hello"}],
            #         max_tokens=10
            #     )
            #     return {'available': True, 'provider': 'openai'}
            
            if provider == 'gemini' or (provider is None and model_name in self.GEMINI_MODELS):
                if not self.gemini_client:
                    return {'available': False, 'error': 'Gemini client not initialized'}
                
                if model_name not in self.GEMINI_MODELS:
                    return {'available': False, 'error': f'Gemini model {model_name} not found'}
                
                # Test with a simple prompt
                model = self.gemini_client.GenerativeModel(model_name)
                response = model.generate_content("Hello")
                return {'available': True, 'provider': 'gemini'}
                
        except Exception as e:
            return {'available': False, 'error': str(e)}
    
    def generate_question(self, prompt_template: str, skill: str, level: str, 
                         question_type: str, context: str = "") -> Dict[str, Any]:
        """
        Generate a question using the configured AI provider.
        
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
            
            # OpenAI generation (commented out)
            # if self.provider == 'openai':
            #     return self._generate_with_openai(system_message, formatted_prompt, skill, level, question_type, context)
            if self.provider == 'gemini':
                return self._generate_with_gemini(system_message, formatted_prompt, skill, level, question_type, context)
            else:
                return {
                    'success': False,
                    'error': 'No AI provider available'
                }
            
        except Exception as e:
            logger.error(f"Error generating question: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    # OpenAI generation method (commented out)
    # def _generate_with_openai(self, system_message: str, formatted_prompt: str, skill: str, level: str, question_type: str, context: str) -> Dict[str, Any]:
    #     """Generate question using OpenAI."""
    #     if not self.openai_client:
    #         return {
    #             'success': False,
    #             'error': 'OpenAI client not initialized'
    #         }
    #     
    #     messages = [
    #         {"role": "system", "content": system_message},
    #         {"role": "user", "content": formatted_prompt}
    #     ]
    #     
    #     response = self.openai_client.chat.completions.create(
    #         model=self.completion_model,
    #         messages=messages,
    #         max_tokens=500,
    #         temperature=0.7
    #     )
    #     
    #     question_text = response.choices[0].message.content.strip()
    #     
    #     return {
    #         'success': True,
    #         'question': {
    #             'text': question_text,
    #             'skill': skill,
    #             'level': level,
    #             'type': question_type,
    #             'context': context,
    #             'model_used': self.completion_model,
    #             'provider': 'openai'
    #         },
    #         'metadata': {
    #             'model': self.completion_model,
    #             'provider': 'openai',
    #             'tokens_used': response.usage.total_tokens
    #         }
    #     }
    
    def _generate_with_gemini(self, system_message: str, formatted_prompt: str, skill: str, level: str, question_type: str, context: str) -> Dict[str, Any]:
        """Generate question using Gemini."""
        if not self.gemini_client:
            return {
                'success': False,
                'error': 'Gemini client not initialized'
            }
        
        # Combine system message and user prompt for Gemini
        full_prompt = f"{system_message}\n\n{formatted_prompt}"
        
        model = self.gemini_client.GenerativeModel(self.completion_model)
        response = model.generate_content(full_prompt)
        
        question_text = response.text.strip()
        
        return {
            'success': True,
            'question': {
                'text': question_text,
                'skill': skill,
                'level': level,
                'type': question_type,
                'context': context,
                'model_used': self.completion_model,
                'provider': 'gemini'
            },
            'metadata': {
                'model': self.completion_model,
                'provider': 'gemini',
                'tokens_used': response.usage_metadata.total_token_count if hasattr(response, 'usage_metadata') else 0
            }
        }
    
    def generate_embeddings(self, text: str) -> List[float]:
        """Generate embeddings for text using OpenAI (embeddings not available in Gemini)."""
        # OpenAI embeddings (commented out)
        # try:
        #     if not self.openai_client:
        #         raise Exception("OpenAI client not available for embeddings")
        #     
        #     response = self.openai_client.embeddings.create(
        #         model=self.embedding_model,
        #         input=text
        #     )
        #     
        #     return response.data[0].embedding
            
        # except Exception as e:
        #     logger.error(f"Error generating embeddings: {e}")
        #     raise
        
        # Gemini doesn't support embeddings, so we raise an exception
        raise Exception("Embeddings not available. OpenAI integration is currently disabled. Please re-enable OpenAI for embeddings functionality.")
    
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

            # OpenAI assessment (commented out)
            # if self.provider == 'openai':
            #     return self._assess_with_openai(assessment_prompt)
            if self.provider == 'gemini':
                return self._assess_with_gemini(assessment_prompt)
            else:
                return {
                    'success': False,
                    'error': 'No AI provider available'
                }
            
        except Exception as e:
            logger.error(f"Error assessing question quality: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    # OpenAI assessment method (commented out)
    # def _assess_with_openai(self, assessment_prompt: str) -> Dict[str, Any]:
    #     """Assess question quality using OpenAI."""
    #     if not self.openai_client:
    #         return {
    #             'success': False,
    #             'error': 'OpenAI client not initialized'
    #         }
    #     
    #     messages = [
    #         {"role": "system", "content": "You are a quality assessment expert. Provide only JSON responses."},
    #         {"role": "user", "content": assessment_prompt}
    #     ]
    #     
    #     response = self.openai_client.chat.completions.create(
    #         model=self.completion_model,
    #         messages=messages,
    #         max_tokens=200,
    #         temperature=0.3
    #     )
    #     
    #     result = json.loads(response.choices[0].message.content.strip())
    #     return {
    #         'success': True,
    #         'assessment': result,
    #         'provider': 'openai'
    #     }
    
    def _assess_with_gemini(self, assessment_prompt: str) -> Dict[str, Any]:
        """Assess question quality using Gemini."""
        if not self.gemini_client:
            return {
                'success': False,
                'error': 'Gemini client not initialized'
            }
        
        system_message = "You are a quality assessment expert. Provide only JSON responses."
        full_prompt = f"{system_message}\n\n{assessment_prompt}"
        
        model = self.gemini_client.GenerativeModel(self.completion_model)
        response = model.generate_content(full_prompt)
        
        result = json.loads(response.text.strip())
        return {
            'success': True,
            'assessment': result,
            'provider': 'gemini'
        } 