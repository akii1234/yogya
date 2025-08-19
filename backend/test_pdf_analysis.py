#!/usr/bin/env python3
"""
Test script to analyze the problematic PDF file
"""

import os
import sys
from pathlib import Path

def test_pdf_file(pdf_path):
    """Test different PDF parsing methods on the file"""
    
    print(f"🔍 Analyzing PDF file: {pdf_path}")
    print("=" * 60)
    
    # Check if file exists
    if not os.path.exists(pdf_path):
        print(f"❌ File does not exist: {pdf_path}")
        return
    
    # Get file info
    file_size = os.path.getsize(pdf_path)
    print(f"📁 File size: {file_size} bytes")
    
    # Check file header
    try:
        with open(pdf_path, 'rb') as f:
            header = f.read(10)
            print(f"📄 File header: {header}")
            if header.startswith(b'%PDF'):
                print("✅ Valid PDF header found")
            else:
                print("❌ Invalid PDF header")
    except Exception as e:
        print(f"❌ Error reading file header: {e}")
    
    print("\n🧪 Testing PDF parsing methods:")
    print("-" * 40)
    
    # Method 1: PyPDF2
    print("1. Testing PyPDF2...")
    try:
        from PyPDF2 import PdfReader
        with open(pdf_path, 'rb') as f:
            reader = PdfReader(f)
            print(f"   ✅ Pages found: {len(reader.pages)}")
            for i, page in enumerate(reader.pages[:2]):  # Test first 2 pages
                text = page.extract_text()
                print(f"   📄 Page {i+1} text length: {len(text) if text else 0}")
                if text:
                    print(f"   📝 Preview: {text[:100]}...")
    except Exception as e:
        print(f"   ❌ PyPDF2 failed: {e}")
    
    # Method 2: pdfplumber
    print("\n2. Testing pdfplumber...")
    try:
        import pdfplumber
        with pdfplumber.open(pdf_path) as pdf:
            print(f"   ✅ Pages found: {len(pdf.pages)}")
            for i, page in enumerate(pdf.pages[:2]):  # Test first 2 pages
                text = page.extract_text()
                print(f"   📄 Page {i+1} text length: {len(text) if text else 0}")
                if text:
                    print(f"   📝 Preview: {text[:100]}...")
    except Exception as e:
        print(f"   ❌ pdfplumber failed: {e}")
    
    # Method 3: pymupdf (fitz)
    print("\n3. Testing PyMuPDF (fitz)...")
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(pdf_path)
        print(f"   ✅ Pages found: {len(doc)}")
        for i in range(min(2, len(doc))):  # Test first 2 pages
            page = doc[i]
            text = page.get_text()
            print(f"   📄 Page {i+1} text length: {len(text) if text else 0}")
            if text:
                print(f"   📝 Preview: {text[:100]}...")
        doc.close()
    except Exception as e:
        print(f"   ❌ PyMuPDF failed: {e}")
    
    # Method 4: Try to repair PDF
    print("\n4. Testing PDF repair...")
    try:
        # Try to read as binary and check for PDF structure
        with open(pdf_path, 'rb') as f:
            content = f.read()
            
        # Look for PDF markers
        pdf_markers = [b'%PDF', b'%%EOF', b'endobj', b'stream', b'endstream']
        for marker in pdf_markers:
            count = content.count(marker)
            print(f"   🔍 Found {count} instances of {marker}")
        
        # Check if file ends with EOF marker
        if content.endswith(b'%%EOF'):
            print("   ✅ File ends with proper EOF marker")
        else:
            print("   ❌ File does not end with EOF marker")
            # Try to find EOF marker
            eof_pos = content.rfind(b'%%EOF')
            if eof_pos != -1:
                print(f"   📍 EOF marker found at position {eof_pos}")
                # Try to truncate file to valid PDF
                print("   🔧 Attempting to repair by truncating...")
                try:
                    repaired_content = content[:eof_pos + 6]  # Include %%EOF
                    repaired_path = pdf_path.replace('.pdf', '_repaired.pdf')
                    with open(repaired_path, 'wb') as f:
                        f.write(repaired_content)
                    print(f"   ✅ Repaired file saved as: {repaired_path}")
                    
                    # Test repaired file
                    print("   🧪 Testing repaired file...")
                    with open(repaired_path, 'rb') as f:
                        reader = PdfReader(f)
                        text = ""
                        for page in reader.pages:
                            text += page.extract_text() or ""
                        print(f"   📄 Repaired file text length: {len(text)}")
                        if text:
                            print(f"   📝 Preview: {text[:200]}...")
                            
                except Exception as repair_error:
                    print(f"   ❌ Repair failed: {repair_error}")
            else:
                print("   ❌ No EOF marker found in file")
                
    except Exception as e:
        print(f"   ❌ PDF repair analysis failed: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 Summary:")
    print("1. Check if PDF file is corrupted")
    print("2. Try using the repaired PDF file if created")
    print("3. Consider converting PDF to text manually")

if __name__ == "__main__":
    # Test the problematic PDF
    pdf_path = "/Users/akhiltripathi/dev/anupam_sharma_resume.pdf"
    test_pdf_file(pdf_path)
