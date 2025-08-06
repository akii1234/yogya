from django.core.management.base import BaseCommand
import nltk
import ssl
import os

class Command(BaseCommand):
    help = 'Download and setup NLTK data to avoid runtime downloads'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Setting up NLTK data...'))
        
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
        
        self.stdout.write(f'📁 Data directory: {nltk_data_dir}')
        
        # Try to create an unverified HTTPS context
        try:
            _create_unverified_https_context = ssl._create_unverified_context
        except AttributeError:
            pass
        else:
            ssl._create_default_https_context = _create_unverified_https_context
        
        for package in packages:
            try:
                self.stdout.write(f'📦 Downloading {package}...')
                nltk.download(package, quiet=True)
                self.stdout.write(
                    self.style.SUCCESS(f'✅ {package} downloaded successfully')
                )
            except Exception as e:
                self.stdout.write(
                    self.style.WARNING(f'⚠️ Warning: Could not download {package}: {e}')
                )
        
        self.stdout.write(
            self.style.SUCCESS('🎉 NLTK setup complete!')
        ) 