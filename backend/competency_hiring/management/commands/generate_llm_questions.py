from django.core.management.base import BaseCommand
from competency_hiring.models import LLMQuestionPrompt, LLMQuestionGeneration, QuestionBank, QuestionEmbedding
from competency_hiring.llm_service import LLMQuestionService
import uuid
import json

class Command(BaseCommand):
    help = 'Generate questions using LLM prompts'

    def add_arguments(self, parser):
        parser.add_argument(
            '--skill',
            type=str,
            help='Target skill for question generation'
        )
        parser.add_argument(
            '--level',
            type=str,
            choices=['easy', 'medium', 'hard'],
            default='medium',
            help='Difficulty level'
        )
        parser.add_argument(
            '--type',
            type=str,
            choices=['technical', 'behavioral', 'situational', 'problem_solving'],
            default='technical',
            help='Question type'
        )
        parser.add_argument(
            '--count',
            type=int,
            default=5,
            help='Number of questions to generate'
        )
        parser.add_argument(
            '--context',
            type=str,
            default='',
            help='Additional context for question generation'
        )
        parser.add_argument(
            '--prompt-id',
            type=str,
            help='Specific prompt ID to use'
        )
        parser.add_argument(
            '--auto-approve',
            action='store_true',
            help='Automatically approve and add to question bank'
        )

    def handle(self, *args, **options):
        llm_service = LLMQuestionService()
        
        # Get prompt
        if options['prompt_id']:
            try:
                prompt = LLMQuestionPrompt.objects.get(id=options['prompt_id'])
            except LLMQuestionPrompt.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Prompt with ID {options['prompt_id']} not found"))
                return
        else:
            # Find appropriate prompt
            prompts = LLMQuestionPrompt.objects.filter(
                question_type=options['type'],
                difficulty=options['level'],
                is_active=True
            )
            
            # For SQLite compatibility, we'll filter by skill after getting the prompts
            if options['skill']:
                # Filter prompts that contain the skill in their target_skills
                filtered_prompts = []
                for prompt in prompts:
                    if options['skill'] in prompt.target_skills:
                        filtered_prompts.append(prompt)
                prompts = filtered_prompts
            
            if not prompts:
                self.stdout.write(self.style.ERROR(f"No prompts found for {options['type']} {options['level']} questions"))
                return
            
            prompt = prompts[0]  # Take the first matching prompt
        
        self.stdout.write(f"Using prompt: {prompt.name}")
        self.stdout.write(f"Generating {options['count']} {options['type']} questions (difficulty: {options['level']})")
        
        generated_count = 0
        approved_count = 0
        
        for i in range(options['count']):
            try:
                # Prepare parameters
                parameters = {
                    'skill': options['skill'] or 'programming',
                    'level': options['level'],
                    'question_type': options['type'],
                    'context': options['context'],
                    'temperature': prompt.temperature,
                    'max_tokens': prompt.max_tokens
                }
                
                # Generate question
                result = llm_service.generate_question_from_prompt(prompt.prompt_template, parameters)
                
                if 'error' in result:
                    self.stdout.write(self.style.ERROR(f"Error generating question {i+1}: {result['error']}"))
                    continue
                
                # Create LLM generation record
                generation = LLMQuestionGeneration.objects.create(
                    prompt=prompt,
                    input_parameters=parameters,
                    generated_question=result.get('question_text', ''),
                    generated_metadata=result,
                    tokens_used=result.get('tokens_used', 0),
                    estimated_cost=result.get('estimated_cost', 0)
                )
                
                # Assess quality
                quality_assessment = llm_service.assess_question_quality(
                    result.get('question_text', ''),
                    options['type']
                )
                
                generation.quality_score = quality_assessment.get('overall_score', 5)
                generation.save()
                
                generated_count += 1
                
                self.stdout.write(f"✅ Generated question {i+1}: {result.get('question_text', '')[:100]}...")
                self.stdout.write(f"   Quality Score: {quality_assessment.get('overall_score', 'N/A')}/10")
                
                # Auto-approve if requested and quality is good
                if options['auto_approve'] and quality_assessment.get('overall_score', 0) >= 7:
                    # Create question bank entry
                    question_data = {
                        'id': uuid.uuid4(),
                        'question_text': result.get('question_text', ''),
                        'question_type': options['type'],
                        'difficulty': options['level'],
                        'tags': result.get('tags', []) + [options['skill']] if options['skill'] else result.get('tags', []),
                        'evaluation_criteria': result.get('evaluation_criteria', []),
                        'expected_answer_points': result.get('expected_answer_points', [])
                    }
                    
                    # Add behavioral structure if applicable
                    if options['type'] == 'behavioral' and 'star_structure' in result:
                        question_data['star_structure'] = result['star_structure']
                    elif options['type'] == 'situational' and 'car_structure' in result:
                        question_data['car_structure'] = result['car_structure']
                    
                    question_bank_entry = QuestionBank.objects.create(**question_data)
                    
                    # Update generation record
                    generation.status = 'added_to_bank'
                    generation.question_bank_entry = question_bank_entry
                    generation.save()
                    
                    # Generate embedding
                    try:
                        embedding_vector = llm_service.generate_embedding(result.get('question_text', ''))
                        if embedding_vector:
                            QuestionEmbedding.objects.create(
                                question=question_bank_entry,
                                embedding_vector=embedding_vector,
                                embedding_text=result.get('question_text', '')
                            )
                    except Exception as e:
                        self.stdout.write(f"⚠️  Could not generate embedding: {str(e)}")
                    
                    approved_count += 1
                    self.stdout.write(f"   ✅ Auto-approved and added to question bank")
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error in iteration {i+1}: {str(e)}"))
        
        self.stdout.write(self.style.SUCCESS(f"Generation complete!"))
        self.stdout.write(f"📊 Generated: {generated_count} questions")
        self.stdout.write(f"📊 Auto-approved: {approved_count} questions")
        self.stdout.write(f"📊 Total questions in bank: {QuestionBank.objects.count()}")
        self.stdout.write(f"📊 Total embeddings: {QuestionEmbedding.objects.count()}") 