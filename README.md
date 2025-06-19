# Django REST API Setup

This project uses Django and Django REST Framework along with NLP and document processing libraries.

## Included Libraries

- Django REST Framework
- PyPDF2
- python-docx
- nltk
- scikit-learn
- spaCy

## Setup Instructions

1. Make sure you have Python 3 installed.
2. Run the setup script to create a virtual environment, install dependencies, and download the necessary spaCy model:

```bash
chmod +x setup.sh
./setup.sh
```

3. Activate the virtual environment:

```bash
source venv/bin/activate
```

4. You can now start building your Django project:

```bash
django-admin startproject myproject
cd myproject
python manage.py runserver
```

## NLP Model

This setup includes downloading the `en_core_web_sm` spaCy English language model.
