#!/usr/bin/env python3
"""
Example script showing how to use Gemini AI integration in Yogya HR Platform.
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

def main():
    """Main example function."""
    print("🚀 Yogya HR Platform - Gemini AI Example")
    print("=" * 50)
    
    # Set your Gemini API key (you can also set it as environment variable)
    # os.environ['GEMINI_API_KEY'] = "YOUR_GEMINI_API_KEY_HERE"
    
    # Initialize the LLM service with Gemini preference
    print("\n1. Initializing LLM Service with Gemini...")
    llm_service = LLMQuestionService(preferred_provider='gemini')
    
    print(f"   Model: {llm_service.completion_model}")
    print(f"   Provider: {llm_service.provider}")
    
    # Example 1: Generate a technical question
    print("\n2. Generating a Technical Question...")
    prompt_template = "Create a {level} level {skill} question for a technical interview."
    
    result = llm_service.generate_question(
        prompt_template=prompt_template,
        skill="Python",
        level="intermediate",
        question_type="technical",
        context="Web development with Django"
    )
    
    if result['success']:
        print(f"✅ Question generated successfully!")
        print(f"   Provider: {result['question']['provider']}")
        print(f"   Model: {result['question']['model_used']}")
        print(f"   Question: {result['question']['text']}")
    else:
        print(f"❌ Failed to generate question: {result['error']}")
    
    # Example 2: Generate a behavioral question
    print("\n3. Generating a Behavioral Question...")
    behavioral_prompt = "Create a {level} level behavioral question about {skill}."
    
    result = llm_service.generate_question(
        prompt_template=behavioral_prompt,
        skill="team collaboration",
        level="senior",
        question_type="behavioral",
        context="Software development team"
    )
    
    if result['success']:
        print(f"✅ Behavioral question generated!")
        print(f"   Question: {result['question']['text']}")
    else:
        print(f"❌ Failed to generate behavioral question: {result['error']}")
    
    # Example 3: Assess question quality
    print("\n4. Assessing Question Quality...")
    test_question = "Explain the difference between synchronous and asynchronous programming in JavaScript."
    
    assessment = llm_service.assess_question_quality(
        question_text=test_question,
        skill="JavaScript",
        level="intermediate"
    )
    
    if assessment['success']:
        print(f"✅ Quality assessment completed!")
        print(f"   Provider: {assessment['provider']}")
        print(f"   Scores: {assessment['assessment']}")
    else:
        print(f"❌ Failed to assess quality: {assessment['error']}")
    
    # Example 4: Test model availability
    print("\n5. Testing Model Availability...")
    models_to_test = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
    
    for model in models_to_test:
        result = llm_service.test_model_availability(model, 'gemini')
        status = "✅ Available" if result['available'] else "❌ Not available"
        print(f"   {model}: {status}")
    
    print("\n" + "=" * 50)
    print("🎉 Gemini AI Example Complete!")
    print("\n💡 Tips:")
    print("   - Set GEMINI_API_KEY environment variable for automatic configuration")
    print("   - Use preferred_provider='auto' for automatic provider selection")
    print("   - Use preferred_provider='openai' to force OpenAI usage")
    print("   - Use preferred_provider='gemini' to force Gemini usage")

if __name__ == "__main__":
    main() 