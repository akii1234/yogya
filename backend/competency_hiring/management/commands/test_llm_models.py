from django.core.management.base import BaseCommand
from competency_hiring.llm_service import LLMQuestionService

class Command(BaseCommand):
    help = 'Test LLM model availability with focus on o1-mini (extensible for future models)'

    def handle(self, *args, **options):
        self.stdout.write("🔍 Testing LLM Model Availability (o1-mini focused)")
        self.stdout.write("=" * 60)
        
        llm_service = LLMQuestionService()
        
        # Test model availability
        available_models = llm_service.test_model_availability()
        
        self.stdout.write("")
        self.stdout.write("📊 Model Availability Summary:")
        self.stdout.write("-" * 40)
        
        working_models = []
        for model, is_available in available_models.items():
            status = "✅ Available" if is_available else "❌ Not Available"
            self.stdout.write(f"   {model:<15} {status}")
            if is_available:
                working_models.append(model)
        
        self.stdout.write("")
        if working_models:
            best_model = llm_service.get_best_available_model()
            self.stdout.write(self.style.SUCCESS(f"🎯 Best available model: {best_model}"))
            self.stdout.write("")
            self.stdout.write("💡 You can now use:")
            self.stdout.write(f"   python manage.py generate_llm_questions --skill python --type technical --level medium --count 1")
        else:
            self.stdout.write(self.style.ERROR("❌ No models are currently available"))
            self.stdout.write("")
            self.stdout.write("🔧 Troubleshooting:")
            self.stdout.write("   1. Check your OpenAI API key in .env file")
            self.stdout.write("   2. Verify your OpenAI account has sufficient credits")
            self.stdout.write("   3. Check if your account has access to the models")
            self.stdout.write("   4. Try upgrading your OpenAI plan")
        
        self.stdout.write("")
        self.stdout.write("🎯 Current Configuration (o1-mini only):")
        self.stdout.write("   - Using o1-mini for cost-effectiveness")
        self.stdout.write("   - Other models commented out for future use")
        self.stdout.write("   - Extensible architecture preserved")
        
        self.stdout.write("")
        self.stdout.write("📚 Model Information:")
        self.stdout.write("   o1-mini        - ✅ Active (cost-effective, fast, reliable)")
        self.stdout.write("   gpt-3.5-turbo  - 🔒 Commented (uncomment to enable)")
        self.stdout.write("   gpt-4          - 🔒 Commented (uncomment to enable)")
        self.stdout.write("   gpt-4o-mini    - 🔒 Commented (uncomment to enable)")
        
        self.stdout.write("")
        self.stdout.write("🔄 To enable other models in the future:")
        self.stdout.write("   1. Uncomment desired models in llm_service.py")
        self.stdout.write("   2. Update AVAILABLE_MODELS list")
        self.stdout.write("   3. Test with: python manage.py test_llm_models") 