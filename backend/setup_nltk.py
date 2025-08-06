#!/usr/bin/env python3
"""
NLTK Data Setup Script
Downloads required NLTK data to avoid runtime downloads
"""

import nltk
import ssl
import os

def download_nltk_data():
    """Download required NLTK data packages"""
    
    # Create data directory if it doesn't exist
    nltk_data_dir = os.path.expanduser('~/nltk_data')
    os.makedirs(nltk_data_dir, exist_ok=True)
    
    # Required NLTK packages
    packages = [
        'wordnet',
        'punkt',
        'averaged_perceptron_tagger',
        'maxent_ne_chunker',
        'words',
        'stopwords'
    ]
    
    print("🚀 Setting up NLTK data...")
    print(f"📁 Data directory: {nltk_data_dir}")
    
    # Try to create an unverified HTTPS context
    try:
        _create_unverified_https_context = ssl._create_unverified_context
    except AttributeError:
        pass
    else:
        ssl._create_default_https_context = _create_unverified_https_context
    
    for package in packages:
        try:
            print(f"📦 Downloading {package}...")
            nltk.download(package, quiet=True)
            print(f"✅ {package} downloaded successfully")
        except Exception as e:
            print(f"⚠️ Warning: Could not download {package}: {e}")
    
    print("🎉 NLTK setup complete!")

if __name__ == "__main__":
    download_nltk_data() 