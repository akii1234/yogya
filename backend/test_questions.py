#!/usr/bin/env python
import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from resume_checker.enhanced_coding_questions import enhanced_coding_questions_manager

def test_question_loading():
    print("Testing question loading...")
    
    # Check if questions are loaded
    print(f"Total questions in database: {enhanced_coding_questions_manager._count_total_questions()}")
    
    # Check what technologies are available
    print("\nAvailable technologies:")
    if enhanced_coding_questions_manager.questions_db and 'questions' in enhanced_coding_questions_manager.questions_db:
        for tech in enhanced_coding_questions_manager.questions_db['questions'].keys():
            print(f"  - {tech}")
    else:
        print("  No questions database loaded")
    
    # Test finding Python questions
    print("\nTesting Python questions:")
    python_questions = enhanced_coding_questions_manager.get_questions_for_tech("python", "senior")
    print(f"Python senior questions found: {len(python_questions)}")
    for q in python_questions[:3]:
        print(f"  - {q.get('title', 'No title')}")
    
    # Test finding system_design questions
    print("\nTesting system_design questions:")
    system_questions = enhanced_coding_questions_manager.get_questions_for_tech("system_design", "senior")
    print(f"System design senior questions found: {len(system_questions)}")
    for q in system_questions[:3]:
        print(f"  - {q.get('title', 'No title')}")
    
    # Test finding devops questions
    print("\nTesting devops questions:")
    devops_questions = enhanced_coding_questions_manager.get_questions_for_tech("devops", "senior")
    print(f"DevOps senior questions found: {len(devops_questions)}")
    for q in devops_questions[:3]:
        print(f"  - {q.get('title', 'No title')}")
    
    # Check what experience levels are available for DevOps
    print("\nDevOps experience levels available:")
    if enhanced_coding_questions_manager.questions_db and 'questions' in enhanced_coding_questions_manager.questions_db:
        devops_data = enhanced_coding_questions_manager.questions_db['questions'].get('devops', {})
        for level in devops_data.keys():
            count = len(devops_data[level])
            print(f"  - {level}: {count} questions")
    else:
        print("  No questions database loaded")

if __name__ == "__main__":
    test_question_loading() 