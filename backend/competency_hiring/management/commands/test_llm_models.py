from django.core.management.base import BaseCommand
from competency_hiring.llm_service import LLMQuestionService
import os

class Command(BaseCommand):
    help = 'Test LLM model availability for OpenAI'

    def add_arguments(self, parser):
        parser.add_argument(
            '--model',
            type=str,
            help='Specific model to test (optional)'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🧠 Testing LLM Model Availability')
        )
        
        # Check API keys
        openai_key = os.getenv('OPENAI_API_KEY')
        
        self.stdout.write(f"\n📋 API Key Status:")
        self.stdout.write(f"   OpenAI: {'✅ Set' if openai_key else '❌ Not set'}")
        
        if not openai_key:
            self.stdout.write(
                self.style.ERROR('\n❌ No API key found! Please set OPENAI_API_KEY in your .env file')
            )
            return
        
        # Initialize service
        try:
            llm_service = LLMQuestionService()
            self.stdout.write(f"\n🚀 LLM Service initialized with model: {llm_service.completion_model}")
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'\n❌ Failed to initialize LLM service: {e}')
            )
            return
        
        # Test specific model or all models
        specific_model = options.get('model')
        if specific_model:
            models_to_test = [specific_model]
        else:
            models_to_test = [
                'o1-mini',
                'gpt-4o-mini',
                'gpt-3.5-turbo',
                'gpt-4'
            ]
        
        self.stdout.write(f"\n🔍 Testing OpenAI Models:")
        for model in models_to_test:
            result = llm_service.test_model_availability(model)
            if result['available']:
                self.stdout.write(f"   ✅ {model} - Available")
            else:
                self.stdout.write(f"   ❌ {model} - {result.get('error', 'Not available')}")
        
        # Test question generation
        self.stdout.write(f"\n🧪 Testing Question Generation:")
        try:
            test_result = llm_service.generate_question(
                prompt_template="Generate a {level} level {skill} question for a {level} developer.\n\nContext: {context}",
                skill="Python",
                level="medium",
                question_type="technical",
                context="Web development"
            )
            
            if test_result['success']:
                self.stdout.write(f"   ✅ Question generation successful!")
                self.stdout.write(f"   📝 Question: {test_result['question']['text'][:100]}...")
                self.stdout.write(f"   🤖 Provider: {test_result['metadata']['provider']}")
                self.stdout.write(f"   🎯 Model: {test_result['metadata']['model']}")
            else:
                self.stdout.write(f"   ❌ Question generation failed: {test_result['error']}")
                
        except Exception as e:
            self.stdout.write(f"   ❌ Question generation test failed: {e}")
        
        # Recommendations
        self.stdout.write(f"\n💡 Recommendations:")
        self.stdout.write(f"   • Use o1-mini for cost-effective generation")
        self.stdout.write(f"   • Use gpt-4o-mini for balanced quality and cost")
        self.stdout.write(f"   • Use gpt-4 for highest quality (most expensive)")
        
        self.stdout.write(
            self.style.SUCCESS('\n✅ LLM model testing completed!')
        ) 