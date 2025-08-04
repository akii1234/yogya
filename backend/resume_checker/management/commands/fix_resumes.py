from django.core.management.base import BaseCommand
from resume_checker.models import Resume
from resume_checker.nlp_utils import preprocess_text


class Command(BaseCommand):
    help = 'Add processed_text to all resumes that only have parsed_text'

    def handle(self, *args, **options):
        resumes = Resume.objects.filter(processed_text__isnull=True).exclude(parsed_text__isnull=True)
        
        self.stdout.write(f"Found {resumes.count()} resumes without processed_text")
        
        for resume in resumes:
            if resume.parsed_text:
                processed_text = preprocess_text(resume.parsed_text)
                resume.processed_text = processed_text
                resume.save()
                self.stdout.write(f"Added processed_text to resume {resume.id}")
        
        self.stdout.write(self.style.SUCCESS(f"Successfully processed {resumes.count()} resumes")) 