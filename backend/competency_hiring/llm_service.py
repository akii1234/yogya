import openai
import json
import numpy as np
from typing import List, Dict, Any, Optional
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

class LLMQuestionService:
    """
    Service for generating questions using LLMs and managing embeddings.
    """
    
    # Available models in order of preference (cost and capability)
    AVAILABLE_MODELS = [
        "o1-mini",           # Most cost-effective for testing and production
        # "gpt-3.5-turbo",     # Good balance of cost and capability (commented for o1-mini only)
        # "gpt-4",             # Highest quality but most expensive (commented for o1-mini only)
        # "gpt-4o-mini"        # Alternative to o1-mini (commented for o1-mini only)
    ]
    
    def __init__(self, preferred_model: Optional[str] = None):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.embedding_model = "text-embedding-ada-002"
        
        # Set completion model with fallback logic
        if preferred_model and preferred_model in self.AVAILABLE_MODELS:
            self.completion_model = preferred_model
        else:
            self.completion_model = self.AVAILABLE_MODELS[0]  # Default to o1-mini
    
    def generate_question_from_prompt(self, prompt_template: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a question using a prompt template and parameters.
        """
        try:
            # Format the prompt with parameters
            formatted_prompt = prompt_template.format(**parameters)
            
            # Add system context for better question generation
            system_prompt = self._get_system_prompt(parameters.get('question_type', 'technical'))
            
            response = self.client.chat.completions.create(
                model=self.completion_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": formatted_prompt}
                ],
                temperature=parameters.get('temperature', 0.7),
                max_tokens=parameters.get('max_tokens', 500),
                response_format={"type": "json_object"}
            )
            
            # Parse the response
            content = response.choices[0].message.content
            result = json.loads(content)
            
            # Add metadata
            result['tokens_used'] = response.usage.total_tokens
            result['estimated_cost'] = self._calculate_cost(
                response.usage.prompt_tokens,
                response.usage.completion_tokens
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating question: {str(e)}")
            return {
                'error': str(e),
                'question_text': '',
                'metadata': {}
            }
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for text using OpenAI's embedding model.
        """
        try:
            response = self.client.embeddings.create(
                model=self.embedding_model,
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Error generating embedding: {str(e)}")
            return []
    
    def semantic_search(self, query: str, question_embeddings: List[Dict], top_k: int = 5) -> List[Dict]:
        """
        Perform semantic search using embeddings.
        """
        try:
            # Generate embedding for query
            query_embedding = self.generate_embedding(query)
            if not query_embedding:
                return []
            
            # Calculate similarities
            similarities = []
            for item in question_embeddings:
                if 'embedding' in item:
                    similarity = self._cosine_similarity(query_embedding, item['embedding'])
                    similarities.append({
                        'question_id': item['question_id'],
                        'question_text': item['question_text'],
                        'similarity': similarity
                    })
            
            # Sort by similarity and return top_k
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            return similarities[:top_k]
            
        except Exception as e:
            logger.error(f"Error in semantic search: {str(e)}")
            return []
    
    def assess_question_quality(self, question_text: str, question_type: str) -> Dict[str, Any]:
        """
        Assess the quality of a generated question using LLM.
        """
        try:
            assessment_prompt = f"""
            Assess the quality of this {question_type} interview question:
            
            Question: {question_text}
            
            Please evaluate on a scale of 1-10 for each criterion:
            1. Clarity and specificity
            2. Relevance to the skill/competency
            3. Appropriate difficulty level
            4. Potential to reveal candidate capabilities
            5. Uniqueness and originality
            
            Return your assessment as JSON with the following structure:
            {{
                "overall_score": <1-10>,
                "clarity_score": <1-10>,
                "relevance_score": <1-10>,
                "difficulty_score": <1-10>,
                "capability_revelation_score": <1-10>,
                "uniqueness_score": <1-10>,
                "feedback": "<detailed feedback>",
                "suggestions": ["<suggestion1>", "<suggestion2>"]
            }}
            """
            
            response = self.client.chat.completions.create(
                model=self.completion_model,
                messages=[
                    {"role": "system", "content": "You are an expert HR interviewer and question designer."},
                    {"role": "user", "content": assessment_prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Error assessing question quality: {str(e)}")
            return {
                'overall_score': 5,
                'feedback': f"Error in assessment: {str(e)}"
            }
    
    def test_model_availability(self) -> Dict[str, bool]:
        """Test which models are available with the current API key"""
        available_models = {}
        
        for model in self.AVAILABLE_MODELS:
            try:
                # Simple test call to check if model is accessible
                response = self.client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": "Hello"}],
                    max_tokens=5
                )
                available_models[model] = True
                print(f"✅ {model} is available")
            except Exception as e:
                available_models[model] = False
                print(f"❌ {model} is not available: {str(e)[:100]}...")
        
        return available_models
    
    def get_best_available_model(self) -> str:
        """Get the best available model based on preference order"""
        available_models = self.test_model_availability()
        
        for model in self.AVAILABLE_MODELS:
            if available_models.get(model, False):
                return model
        
        # If no models are available, return the first one (will fail gracefully)
        return self.AVAILABLE_MODELS[0]
    
    def batch_generate_questions(self, batch_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Generate multiple questions in batch.
        """
        results = []
        
        for skill in batch_config['target_skills']:
            for question_type in batch_config['question_types']:
                for difficulty in batch_config['difficulty_levels']:
                    for i in range(batch_config['count_per_skill']):
                        parameters = {
                            'skill': skill,
                            'level': difficulty,
                            'question_type': question_type,
                            'context': batch_config.get('context', ''),
                            'temperature': batch_config.get('temperature', 0.7),
                            'max_tokens': batch_config.get('max_tokens', 500)
                        }
                        
                        # Get appropriate prompt template
                        prompt_template = self._get_prompt_template(question_type, difficulty)
                        
                        result = self.generate_question_from_prompt(prompt_template, parameters)
                        result['skill'] = skill
                        result['question_type'] = question_type
                        result['difficulty'] = difficulty
                        
                        results.append(result)
        
        return results
    
    def _get_system_prompt(self, question_type: str) -> str:
        """
        Get system prompt based on question type.
        """
        prompts = {
            'technical': """You are an expert technical interviewer. Generate high-quality technical questions that:
            - Test specific technical knowledge and skills
            - Are appropriate for the specified difficulty level
            - Include clear evaluation criteria
            - Provide expected answer points
            - Use industry best practices
            
            Return your response as JSON with this structure:
            {
                "question_text": "The actual question",
                "evaluation_criteria": ["criterion1", "criterion2", "criterion3"],
                "expected_answer_points": ["point1", "point2", "point3"],
                "tags": ["tag1", "tag2"],
                "difficulty": "easy|medium|hard",
                "estimated_time": <minutes>
            }""",
            
            'behavioral': """You are an expert behavioral interviewer. Generate high-quality behavioral questions that:
            - Follow STAR (Situation, Task, Action, Result) methodology
            - Test specific soft skills and competencies
            - Are appropriate for the specified difficulty level
            - Include clear evaluation criteria
            - Provide expected answer points
            
            Return your response as JSON with this structure:
            {
                "question_text": "The actual question",
                "star_structure": {
                    "situation": "What situation to look for",
                    "task": "What task to focus on",
                    "action": "What actions to evaluate",
                    "result": "What results to assess"
                },
                "evaluation_criteria": ["criterion1", "criterion2", "criterion3"],
                "expected_answer_points": ["point1", "point2", "point3"],
                "tags": ["tag1", "tag2"],
                "difficulty": "easy|medium|hard",
                "estimated_time": <minutes>
            }""",
            
            'situational': """You are an expert situational interviewer. Generate high-quality situational questions that:
            - Present realistic workplace scenarios
            - Test problem-solving and decision-making abilities
            - Are appropriate for the specified difficulty level
            - Include clear evaluation criteria
            - Provide expected answer points
            
            Return your response as JSON with this structure:
            {
                "question_text": "The actual question",
                "car_structure": {
                    "context": "Background context",
                    "action": "Actions to evaluate",
                    "result": "Expected outcomes"
                },
                "evaluation_criteria": ["criterion1", "criterion2", "criterion3"],
                "expected_answer_points": ["point1", "point2", "point3"],
                "tags": ["tag1", "tag2"],
                "difficulty": "easy|medium|hard",
                "estimated_time": <minutes>
            }"""
        }
        
        return prompts.get(question_type, prompts['technical'])
    
    def _get_prompt_template(self, question_type: str, difficulty: str) -> str:
        """
        Get prompt template based on question type and difficulty.
        """
        templates = {
            'technical': {
                'easy': """Generate an easy-level technical question about {skill} for a {level} developer.

Focus on:
- Basic concepts and fundamentals
- Simple practical scenarios
- Clear, straightforward answers

The question should be accessible to someone with basic knowledge of {skill}.""",
                
                'medium': """Generate a medium-level technical question about {skill} for a {level} developer.

Focus on:
- Practical application of concepts
- Real-world scenarios
- Problem-solving approaches
- Best practices

The question should test understanding beyond basics but not require expert-level knowledge.""",
                
                'hard': """Generate a hard-level technical question about {skill} for a {level} developer.

Focus on:
- Advanced concepts and deep understanding
- Complex problem-solving scenarios
- System design considerations
- Performance optimization
- Edge cases and trade-offs

The question should challenge even experienced developers."""
            },
            
            'behavioral': {
                'easy': """Generate an easy-level behavioral question about {skill} for a {level} professional.

Focus on:
- Basic teamwork and communication
- Simple problem-solving scenarios
- Learning and growth experiences
- Clear, straightforward situations

The question should be accessible and relatable to most professionals.""",
                
                'medium': """Generate a medium-level behavioral question about {skill} for a {level} professional.

Focus on:
- Leadership and collaboration
- Complex problem-solving
- Conflict resolution
- Project management
- Stakeholder interaction

The question should test experience and maturity in professional situations.""",
                
                'hard': """Generate a hard-level behavioral question about {skill} for a {level} professional.

Focus on:
- High-stakes decision making
- Crisis management
- Strategic thinking
- Complex stakeholder management
- Transformational leadership

The question should challenge even senior professionals."""
            }
        }
        
        return templates.get(question_type, {}).get(difficulty, templates['technical']['medium'])
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors.
        """
        try:
            vec1 = np.array(vec1)
            vec2 = np.array(vec2)
            
            dot_product = np.dot(vec1, vec2)
            norm1 = np.linalg.norm(vec1)
            norm2 = np.linalg.norm(vec2)
            
            if norm1 == 0 or norm2 == 0:
                return 0.0
            
            return dot_product / (norm1 * norm2)
        except Exception as e:
            logger.error(f"Error calculating cosine similarity: {str(e)}")
            return 0.0
    
    def _calculate_cost(self, prompt_tokens: int, completion_tokens: int) -> float:
        """
        Calculate estimated cost based on token usage.
        """
        # GPT-4 pricing (approximate)
        prompt_cost_per_1k = 0.03
        completion_cost_per_1k = 0.06
        
        prompt_cost = (prompt_tokens / 1000) * prompt_cost_per_1k
        completion_cost = (completion_tokens / 1000) * completion_cost_per_1k
        
        return prompt_cost + completion_cost 