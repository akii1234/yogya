#!/usr/bin/env python3
"""
Test script for Gemini AI integration in Yogya HR Platform.
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

def test_gemini_integration():
    """Test Gemini AI integration."""
    print("🧪 Testing Gemini AI Integration")
    print("=" * 50)
    
    # Test 1: Initialize service with Gemini preference
    print("\n1. Testing LLM Service Initialization...")
    try:
        llm_service = LLMQuestionService(preferred_provider='gemini')
        print(f"✅ Service initialized successfully")
        print(f"   Model: {llm_service.completion_model}")
        print(f"   Provider: {llm_service.provider}")
    except Exception as e:
        print(f"❌ Failed to initialize service: {e}")
        return False
    
    # Test 2: Test model availability
    print("\n2. Testing Model Availability...")
    try:
        result = llm_service.test_model_availability('gemini-1.5-flash', 'gemini')
        if result['available']:
            print(f"✅ Gemini model available: {result}")
        else:
            print(f"❌ Gemini model not available: {result}")
    except Exception as e:
        print(f"❌ Error testing model availability: {e}")
    
    # Test 3: Generate a test question
    print("\n3. Testing Question Generation...")
    try:
        prompt_template = "Generate a {level} level {skill} question."
        result = llm_service.generate_question(
            prompt_template=prompt_template,
            skill="Python",
            level="intermediate",
            question_type="technical",
            context="Web development"
        )
        
        if result['success']:
            print(f"✅ Question generated successfully")
            print(f"   Provider: {result['question']['provider']}")
            print(f"   Model: {result['question']['model_used']}")
            print(f"   Question: {result['question']['text'][:100]}...")
        else:
            print(f"❌ Failed to generate question: {result['error']}")
    except Exception as e:
        print(f"❌ Error generating question: {e}")
    
    # Test 4: Test quality assessment
    print("\n4. Testing Quality Assessment...")
    try:
        test_question = "What is the difference between a list and a tuple in Python?"
        result = llm_service.assess_question_quality(
            question_text=test_question,
            skill="Python",
            level="beginner"
        )
        
        if result['success']:
            print(f"✅ Quality assessment successful")
            print(f"   Provider: {result['provider']}")
            print(f"   Assessment: {result['assessment']}")
        else:
            print(f"❌ Failed to assess quality: {result['error']}")
    except Exception as e:
        print(f"❌ Error assessing quality: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Gemini Integration Test Complete!")
    return True

def test_openai_fallback():
    """Test OpenAI fallback when Gemini is not available."""
    print("\n🧪 Testing OpenAI Fallback")
    print("=" * 50)
    
    try:
        llm_service = LLMQuestionService(preferred_provider='openai')
        print(f"✅ OpenAI fallback initialized")
        print(f"   Model: {llm_service.completion_model}")
        print(f"   Provider: {llm_service.provider}")
        
        # Test question generation with OpenAI
        prompt_template = "Generate a {level} level {skill} question."
        result = llm_service.generate_question(
            prompt_template=prompt_template,
            skill="JavaScript",
            level="advanced",
            question_type="technical",
            context="Frontend development"
        )
        
        if result['success']:
            print(f"✅ OpenAI question generation successful")
            print(f"   Provider: {result['question']['provider']}")
            print(f"   Question: {result['question']['text'][:100]}...")
        else:
            print(f"❌ OpenAI question generation failed: {result['error']}")
            
    except Exception as e:
        print(f"❌ OpenAI fallback test failed: {e}")

if __name__ == "__main__":
    print("🚀 Yogya HR Platform - AI Integration Test")
    print("=" * 60)
    
    # Check environment variables
    print("\n📋 Environment Check:")
    openai_key = os.getenv('OPENAI_API_KEY')
    gemini_key = os.getenv('GEMINI_API_KEY')
    
    print(f"   OpenAI API Key: {'✅ Set' if openai_key else '❌ Not set'}")
    print(f"   Gemini API Key: {'✅ Set' if gemini_key else '❌ Not set'}")
    
    if not openai_key and not gemini_key:
        print("\n❌ No API keys found! Please set either OPENAI_API_KEY or GEMINI_API_KEY")
        sys.exit(1)
    
    # Run tests
    gemini_success = test_gemini_integration()
    
    if not gemini_success and openai_key:
        test_openai_fallback()
    
    print("\n✨ Test completed!") 