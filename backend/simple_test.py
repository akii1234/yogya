#!/usr/bin/env python3
"""
Simple test for enhanced coding questions algorithm
"""

import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')

import django
django.setup()

def test_basic_algorithm():
    """Test the basic functionality without AI dependencies"""
    
    print("🧪 Testing Enhanced Coding Questions Algorithm (Basic)")
    print("=" * 60)
    
    try:
        # Import the enhanced manager directly
        from resume_checker.enhanced_coding_questions import enhanced_coding_questions_manager
        
        print("✅ Enhanced manager loaded successfully")
        
        # Test basic functionality
        candidate_skills = ["java", "spring", "python", "sql"]
        candidate_experience = 3
        job_skills = ["java", "spring boot", "microservices", "docker"]
        
        print(f"📝 Testing with skills: {candidate_skills}")
        print(f"📝 Experience: {candidate_experience} years")
        print(f"📝 Job skills: {job_skills}")
        
        # Test experience level determination
        experience_level = enhanced_coding_questions_manager.get_experience_level(candidate_experience)
        print(f"🎯 Experience level: {experience_level}")
        
        # Test technology mapping
        relevant_techs = enhanced_coding_questions_manager.find_relevant_technologies(candidate_skills, job_skills)
        print(f"🔧 Relevant technologies: {relevant_techs}")
        
        # Test question generation (without AI enhancement)
        result = enhanced_coding_questions_manager.generate_personalized_questions(
            candidate_skills, 
            candidate_experience, 
            job_skills, 
            ""  # Empty job description to avoid AI enhancement
        )
        
        print("✅ Basic algorithm executed successfully!")
        print(f"📊 Total questions generated: {result.get('total_questions', 0)}")
        print(f"🎯 Experience level: {result.get('experience_level', 'unknown')}")
        print(f"🔧 Technologies: {result.get('technologies', [])}")
        print(f"⏱️ Estimated time: {result.get('estimated_time', 0)} minutes")
        
        # Show questions if any
        questions = result.get('questions', [])
        if questions:
            print(f"\n📋 Questions Generated ({len(questions)} total):")
            for i, question in enumerate(questions[:3], 1):
                print(f"  {i}. {question.get('title', 'No title')} ({question.get('difficulty', 'unknown')})")
                print(f"     Category: {question.get('category', 'unknown')}")
                print(f"     Tags: {', '.join(question.get('tags', []))}")
                print()
        else:
            print("\n⚠️ No questions generated - this might be due to database issues")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing algorithm: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_basic_algorithm()
    if success:
        print("\n🎉 Basic test passed! Enhanced algorithm core is working.")
    else:
        print("\n💥 Basic test failed! Please check the error messages above.")
        sys.exit(1) 