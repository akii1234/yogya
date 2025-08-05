from django.core.management.base import BaseCommand
from competency_hiring.models import LLMQuestionPrompt, LLMQuestionGeneration, QuestionBank, QuestionEmbedding
import uuid
import json

class Command(BaseCommand):
    help = 'Demo LLM question generation without API calls'

    def add_arguments(self, parser):
        parser.add_argument(
            '--skill',
            type=str,
            default='python',
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
            default=3,
            help='Number of questions to generate'
        )

    def handle(self, *args, **options):
        self.stdout.write("🤖 LLM Question Generation Demo")
        self.stdout.write("=" * 50)
        
        # Find appropriate prompt
        prompts = LLMQuestionPrompt.objects.filter(
            question_type=options['type'],
            difficulty=options['level'],
            is_active=True
        )
        
        if not prompts.exists():
            self.stdout.write(self.style.ERROR(f"No prompts found for {options['type']} {options['level']} questions"))
            return
        
        prompt = prompts.first()
        self.stdout.write(f"📝 Using prompt: {prompt.name}")
        self.stdout.write(f"🎯 Generating {options['count']} {options['type']} questions (difficulty: {options['level']})")
        self.stdout.write("")
        
        # Demo questions based on skill and type
        demo_questions = self.get_demo_questions(options['skill'], options['type'], options['level'])
        
        generated_count = 0
        approved_count = 0
        
        for i in range(min(options['count'], len(demo_questions))):
            demo_q = demo_questions[i]
            
            self.stdout.write(f"🔍 Question {i+1}:")
            self.stdout.write(f"   📝 {demo_q['question_text']}")
            self.stdout.write(f"   🏷️  Tags: {', '.join(demo_q['tags'])}")
            self.stdout.write(f"   📊 Quality Score: {demo_q['quality_score']}/10")
            self.stdout.write(f"   ⏱️  Estimated Time: {demo_q['estimated_time']} minutes")
            self.stdout.write("")
            
            # Create LLM generation record
            generation = LLMQuestionGeneration.objects.create(
                prompt=prompt,
                input_parameters={
                    'skill': options['skill'],
                    'level': options['level'],
                    'question_type': options['type']
                },
                generated_question=demo_q['question_text'],
                generated_metadata=demo_q,
                quality_score=demo_q['quality_score'],
                tokens_used=150,  # Mock token count
                estimated_cost=0.002  # Mock cost
            )
            
            generated_count += 1
            
            # Auto-approve if quality is good
            if demo_q['quality_score'] >= 7:
                # Create question bank entry
                question_data = {
                    'id': uuid.uuid4(),
                    'question_text': demo_q['question_text'],
                    'question_type': options['type'],
                    'difficulty': options['level'],
                    'tags': demo_q['tags'],
                    'evaluation_criteria': demo_q['evaluation_criteria'],
                    'expected_answer_points': demo_q['expected_answer_points']
                }
                
                # Add behavioral structure if applicable
                if options['type'] == 'behavioral' and 'star_structure' in demo_q:
                    question_data['star_structure'] = demo_q['star_structure']
                elif options['type'] == 'situational' and 'car_structure' in demo_q:
                    question_data['car_structure'] = demo_q['car_structure']
                
                question_bank_entry = QuestionBank.objects.create(**question_data)
                
                # Update generation record
                generation.status = 'added_to_bank'
                generation.question_bank_entry = question_bank_entry
                generation.save()
                
                approved_count += 1
                self.stdout.write(f"   ✅ Auto-approved and added to question bank")
            else:
                self.stdout.write(f"   ⏳ Requires human review (quality < 7)")
            
            self.stdout.write("")
        
        self.stdout.write("=" * 50)
        self.stdout.write(self.style.SUCCESS("Demo complete!"))
        self.stdout.write(f"📊 Generated: {generated_count} questions")
        self.stdout.write(f"📊 Auto-approved: {approved_count} questions")
        self.stdout.write(f"📊 Total questions in bank: {QuestionBank.objects.count()}")
        self.stdout.write("")
        self.stdout.write("💡 To use real LLM generation:")
        self.stdout.write("   1. Upgrade your OpenAI plan")
        self.stdout.write("   2. Run: python manage.py generate_llm_questions --skill python --type technical --level medium --count 3 --auto-approve")

    def get_demo_questions(self, skill, question_type, level):
        """Get demo questions based on skill and type"""
        
        if skill == 'python' and question_type == 'technical':
            return [
                {
                    'question_text': 'Explain the difference between lists and tuples in Python. When would you use each?',
                    'tags': ['python', 'data-structures', 'technical'],
                    'quality_score': 8.5,
                    'estimated_time': 5,
                    'evaluation_criteria': [
                        'Understanding of mutability vs immutability',
                        'Knowledge of use cases for each',
                        'Performance considerations'
                    ],
                    'expected_answer_points': [
                        'Lists are mutable, tuples are immutable',
                        'Lists for dynamic data, tuples for fixed data',
                        'Tuples are more memory efficient'
                    ]
                },
                {
                    'question_text': 'How would you implement a decorator in Python? Provide an example.',
                    'tags': ['python', 'decorators', 'functions', 'technical'],
                    'quality_score': 9.0,
                    'estimated_time': 7,
                    'evaluation_criteria': [
                        'Understanding of decorator pattern',
                        'Knowledge of function wrapping',
                        'Practical implementation'
                    ],
                    'expected_answer_points': [
                        'Use @ syntax or function wrapping',
                        'Understand closure concept',
                        'Provide practical example'
                    ]
                },
                {
                    'question_text': 'Explain the GIL (Global Interpreter Lock) in Python and its implications.',
                    'tags': ['python', 'concurrency', 'performance', 'technical'],
                    'quality_score': 7.5,
                    'estimated_time': 8,
                    'evaluation_criteria': [
                        'Understanding of GIL concept',
                        'Knowledge of threading vs multiprocessing',
                        'Performance implications'
                    ],
                    'expected_answer_points': [
                        'GIL prevents true parallel execution',
                        'Use multiprocessing for CPU-bound tasks',
                        'Threading good for I/O-bound tasks'
                    ]
                }
            ]
        
        elif skill == 'leadership' and question_type == 'behavioral':
            return [
                {
                    'question_text': 'Tell me about a time when you had to lead a team through a major technical challenge.',
                    'tags': ['leadership', 'teamwork', 'problem-solving'],
                    'quality_score': 8.0,
                    'estimated_time': 6,
                    'star_structure': {
                        'situation': 'Major technical challenge affecting team',
                        'task': 'Lead team through resolution',
                        'action': 'Systematic problem-solving approach',
                        'result': 'Successfully resolved challenge'
                    },
                    'evaluation_criteria': [
                        'Leadership approach',
                        'Problem-solving methodology',
                        'Team collaboration'
                    ],
                    'expected_answer_points': [
                        'Clear problem definition',
                        'Team involvement and delegation',
                        'Systematic approach'
                    ]
                }
            ]
        
        else:
            return [
                {
                    'question_text': f'Demo question about {skill} ({question_type}, {level} level)',
                    'tags': [skill, question_type, level],
                    'quality_score': 7.0,
                    'estimated_time': 5,
                    'evaluation_criteria': ['Demo criterion 1', 'Demo criterion 2'],
                    'expected_answer_points': ['Demo point 1', 'Demo point 2']
                }
            ] 