#!/usr/bin/env python3
"""
Test script for Gemini AI integration structure (no API calls).
OpenAI integration is currently disabled.
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from competency_hiring.llm_service import LLMQuestionService

def test_structure():
    """Test the structure of the Gemini integration without API calls."""
    print("🧪 Testing Gemini Integration Structure")
    print("=" * 50)
    
    # Test 1: Check if the service can be imported and initialized
    print("\n1. Testing Service Import and Initialization...")
    try:
        llm_service = LLMQuestionService(preferred_provider='gemini')
        print(f"✅ Service initialized successfully")
        print(f"   Model: {llm_service.completion_model}")
        print(f"   Provider: {llm_service.provider}")
        print(f"   OpenAI Client: {'✅ Available' if hasattr(llm_service, 'openai_client') and llm_service.openai_client else '❌ Disabled'}")
        print(f"   Gemini Client: {'✅ Available' if llm_service.gemini_client else '❌ Not available'}")
    except Exception as e:
        print(f"❌ Failed to initialize service: {e}")
        return False
    
    # Test 2: Check available models
    print("\n2. Testing Available Models...")
    print(f"   OpenAI Models: {'❌ Disabled' if not hasattr(llm_service, 'OPENAI_MODELS') else llm_service.OPENAI_MODELS}")
    print(f"   Gemini Models: {llm_service.GEMINI_MODELS}")
    
    # Test 3: Test provider selection logic
    print("\n3. Testing Provider Selection Logic...")
    
    # Test with different provider preferences
    providers_to_test = ['auto', 'gemini', 'openai']
    
    for provider in providers_to_test:
        try:
            test_service = LLMQuestionService(preferred_provider=provider)
            print(f"   {provider.upper()}: Model={test_service.completion_model}, Provider={test_service.provider}")
        except Exception as e:
            print(f"   {provider.upper()}: ❌ Error - {e}")
    
    # Test 4: Check method availability
    print("\n4. Testing Method Availability...")
    methods_to_check = [
        'generate_question',
        'assess_question_quality', 
        'test_model_availability',
        'generate_embeddings',
        # '_generate_with_openai',  # Commented out - OpenAI disabled
        '_generate_with_gemini',
        # '_assess_with_openai',    # Commented out - OpenAI disabled
        '_assess_with_gemini'
    ]
    
    for method in methods_to_check:
        if hasattr(llm_service, method):
            print(f"   ✅ {method}")
        else:
            print(f"   ❌ {method} - Missing!")
    
    # Test 5: Test environment variable handling
    print("\n5. Testing Environment Variable Handling...")
    openai_key = os.getenv('OPENAI_API_KEY')
    gemini_key = os.getenv('GEMINI_API_KEY')
    
    print(f"   OPENAI_API_KEY: {'✅ Set (but disabled)' if openai_key else '❌ Not set'}")
    print(f"   GEMINI_API_KEY: {'✅ Set' if gemini_key else '❌ Not set'}")
    
    # Test 6: Test settings integration
    print("\n6. Testing Settings Integration...")
    from django.conf import settings
    print(f"   Settings OPENAI_API_KEY: {'✅ Set (but disabled)' if hasattr(settings, 'OPENAI_API_KEY') and settings.OPENAI_API_KEY else '❌ Not set'}")
    print(f"   Settings GEMINI_API_KEY: {'✅ Set' if hasattr(settings, 'GEMINI_API_KEY') and settings.GEMINI_API_KEY else '❌ Not set'}")
    
    print("\n" + "=" * 50)
    print("🎉 Structure Test Complete!")
    return True

def test_with_mock_gemini_key():
    """Test with a mock Gemini API key to see the initialization flow."""
    print("\n🧪 Testing with Mock Gemini API Key")
    print("=" * 50)
    
    # Temporarily set a mock key
    original_key = os.getenv('GEMINI_API_KEY')
    os.environ['GEMINI_API_KEY'] = 'mock_key_for_testing'
    
    try:
        llm_service = LLMQuestionService(preferred_provider='gemini')
        print(f"✅ Service initialized with mock key")
        print(f"   Model: {llm_service.completion_model}")
        print(f"   Provider: {llm_service.provider}")
        print(f"   Gemini Client: {'✅ Available' if llm_service.gemini_client else '❌ Not available'}")
        
        # This should fail gracefully without a real API key
        result = llm_service.test_model_availability('gemini-1.5-flash', 'gemini')
        print(f"   Model test result: {result}")
        
    except Exception as e:
        print(f"❌ Error with mock key: {e}")
    finally:
        # Restore original key
        if original_key:
            os.environ['GEMINI_API_KEY'] = original_key
        else:
            os.environ.pop('GEMINI_API_KEY', None)

def test_openai_disabled():
    """Test that OpenAI integration is properly disabled."""
    print("\n🧪 Testing OpenAI Integration Disabled")
    print("=" * 50)
    
    try:
        # Try to initialize with OpenAI preference
        llm_service = LLMQuestionService(preferred_provider='openai')
        print(f"✅ Service initialized (should use Gemini as fallback)")
        print(f"   Model: {llm_service.completion_model}")
        print(f"   Provider: {llm_service.provider}")
        print(f"   Note: OpenAI integration is disabled, using Gemini instead")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test embeddings method
    try:
        llm_service = LLMQuestionService()
        llm_service.generate_embeddings("test text")
    except Exception as e:
        print(f"✅ Embeddings method correctly disabled: {e}")

if __name__ == "__main__":
    print("🚀 Yogya HR Platform - Gemini Integration Structure Test")
    print("=" * 60)
    print("ℹ️  OpenAI integration is currently disabled")
    print("=" * 60)
    
    # Run structure tests
    structure_success = test_structure()
    
    # Test with mock key
    test_with_mock_gemini_key()
    
    # Test OpenAI disabled
    test_openai_disabled()
    
    print("\n✨ Structure test completed!")
    print("\n💡 Next Steps:")
    print("   1. Set GEMINI_API_KEY environment variable")
    print("   2. Run test_gemini_integration.py for full API testing")
    print("   3. Run gemini_example.py for usage examples")
    print("\n🔄 To re-enable OpenAI:")
    print("   1. Uncomment OpenAI code in llm_service.py")
    print("   2. Set OPENAI_API_KEY environment variable") 