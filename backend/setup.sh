#!/bin/bash

echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing required packages from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Downloading SpaCy language model 'en_core_web_sm'..."
python -m spacy download en_core_web_sm

echo "Setup complete. Virtual environment 'venv' is ready."
