from django.core.management.base import BaseCommand
from competency_hiring.llm_service import LLMQuestionService
import os

class Command(BaseCommand):
    help = 'Test LLM model availability for both OpenAI and Perplexity'

    def add_arguments(self, parser):
        parser.add_argument(
            '--provider',
            type=str,
            choices=['openai', 'perplexity', 'all'],
            default='all',
            help='Which provider to test (openai, perplexity, or all)'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🧠 Testing LLM Model Availability')
        )
        
        provider = options['provider']
        
        # Check API keys
        openai_key = os.getenv('OPENAI_API_KEY')
        perplexity_key = os.getenv('PERPLEXITY_API_KEY')
        
        self.stdout.write(f"\n📋 API Key Status:")
        self.stdout.write(f"   OpenAI: {'✅ Set' if openai_key else '❌ Not set'}")
        self.stdout.write(f"   Perplexity: {'✅ Set' if perplexity_key else '❌ Not set'}")
        
        if not openai_key and not perplexity_key:
            self.stdout.write(
                self.style.ERROR('\n❌ No API keys found! Please set OPENAI_API_KEY or PERPLEXITY_API_KEY in your .env file')
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
        
        # Test models based on provider preference
        if provider in ['perplexity', 'all'] and perplexity_key:
            self.stdout.write(f"\n🔍 Testing Perplexity Models:")
            perplexity_models = [
                'llama-3.1-8b-instant',
                'llama-3.1-70b-versatile', 
                'llama-3.1-405b-reasoning',
                'mixtral-8x7b-instruct',
                'codellama-70b-instruct'
            ]
            
            for model in perplexity_models:
                result = llm_service.test_model_availability(model)
                if result['available']:
                    self.stdout.write(f"   ✅ {model} - Available")
                else:
                    self.stdout.write(f"   ❌ {model} - {result.get('error', 'Not available')}")
        
        if provider in ['openai', 'all'] and openai_key:
            self.stdout.write(f"\n🔍 Testing OpenAI Models:")
            openai_models = [
                'o1-mini',
                'gpt-4o-mini',
                'gpt-3.5-turbo',
                'gpt-4'
            ]
            
            for model in openai_models:
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
        if perplexity_key:
            self.stdout.write(f"   • Perplexity Pro is great for cost-effective question generation")
            self.stdout.write(f"   • Use llama-3.1-405b-reasoning for complex questions")
            self.stdout.write(f"   • Use llama-3.1-8b-instant for quick generation")
        if openai_key:
            self.stdout.write(f"   • OpenAI provides high-quality embeddings")
            self.stdout.write(f"   • Use o1-mini for cost-effective generation")
        
        self.stdout.write(
            self.style.SUCCESS('\n✅ LLM model testing completed!')
        ) 