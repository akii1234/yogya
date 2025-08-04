from django.core.management.base import BaseCommand
from resume_checker.models import Resume


class Command(BaseCommand):
    help = 'Debug resume data to see what fields are populated'

    def handle(self, *args, **options):
        resumes = Resume.objects.all()
        
        self.stdout.write(f"Found {resumes.count()} total resumes")
        
        for resume in resumes:
            self.stdout.write(f"\nResume ID: {resume.id}")
            self.stdout.write(f"Has parsed_text: {bool(resume.parsed_text)}")
            self.stdout.write(f"Has processed_text: {bool(resume.processed_text)}")
            self.stdout.write(f"Parsed text length: {len(resume.parsed_text) if resume.parsed_text else 0}")
            self.stdout.write(f"Processed text length: {len(resume.processed_text) if resume.processed_text else 0}")
            
            if resume.parsed_text and not resume.processed_text:
                self.stdout.write("*** NEEDS PROCESSING ***")
            elif resume.processed_text:
                self.stdout.write("*** ALREADY PROCESSED ***")
            else:
                self.stdout.write("*** NO TEXT DATA ***") 