#!/usr/bin/env python3
"""
Simple test script for Perplexity API integration
"""

import os
import pplx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_perplexity_api():
    """Test Perplexity API with a simple question generation"""
    
    # Get API key
    api_key = os.getenv('PERPLEXITY_API_KEY')
    if not api_key:
        print("❌ PERPLEXITY_API_KEY not found in environment variables")
        print("Please add your Perplexity API key to the .env file")
        return False
    
    try:
        # Initialize client
        client = pplx.Perplexity(api_key=api_key)
        print("✅ Perplexity client initialized successfully")
        
        # Test with a simple prompt
        print("\n🧪 Testing question generation...")
        
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are an expert technical interviewer. Generate a clear, practical question."},
                {"role": "user", "content": "Generate a medium-level Python question for a developer."}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        question = response.choices[0].message.content
        print(f"✅ Question generated successfully!")
        print(f"📝 Question: {question}")
        
        # Test with a more advanced model
        print("\n🧪 Testing with advanced model...")
        
        response = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert technical interviewer specializing in Python."},
                {"role": "user", "content": "Generate a hard-level Python question about system design and optimization."}
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        advanced_question = response.choices[0].message.content
        print(f"✅ Advanced question generated successfully!")
        print(f"📝 Question: {advanced_question}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing Perplexity API: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Perplexity API Integration")
    print("=" * 50)
    
    success = test_perplexity_api()
    
    if success:
        print("\n🎉 Perplexity API integration test completed successfully!")
        print("You can now use Perplexity models in your LLM Question Generator.")
    else:
        print("\n❌ Perplexity API integration test failed.")
        print("Please check your API key and try again.") 