#!/usr/bin/env python3
"""
Script to fix text file uploads with PDF extensions
"""

import os
import sys

def extract_text_from_fake_pdf(file_path):
    """Extract text from a file that has .pdf extension but is actually text"""
    
    print(f"🔍 Processing file: {file_path}")
    
    try:
        # Read the file as text (not binary)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print(f"✅ Successfully read {len(content)} characters")
        print(f"📄 Content preview: {content[:200]}...")
        
        return content
        
    except UnicodeDecodeError:
        # Try different encodings
        encodings = ['latin-1', 'cp1252', 'iso-8859-1']
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    content = f.read()
                print(f"✅ Successfully read with {encoding} encoding")
                return content
            except UnicodeDecodeError:
                continue
        
        print("❌ Failed to decode file with any encoding")
        return ""
    
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return ""

def test_the_file():
    """Test the problematic file"""
    
    file_path = "/Users/akhiltripathi/dev/anupam_sharma_resume.pdf"
    
    print("🧪 Testing file content extraction...")
    print("=" * 50)
    
    # Extract text content
    text_content = extract_text_from_fake_pdf(file_path)
    
    if text_content:
        print(f"\n📝 Extracted text length: {len(text_content)} characters")
        print(f"📄 Full content:")
        print("-" * 40)
        print(text_content)
        print("-" * 40)
        
        # Now test skill extraction
        print(f"\n🔧 Testing skill extraction...")
        try:
            from resume_checker.nlp_utils import extract_skills_from_text
            skills = extract_skills_from_text(text_content)
            print(f"✅ Extracted {len(skills)} skills: {skills}")
        except Exception as e:
            print(f"❌ Skill extraction failed: {e}")
    else:
        print("❌ No text content extracted")

if __name__ == "__main__":
    test_the_file()
