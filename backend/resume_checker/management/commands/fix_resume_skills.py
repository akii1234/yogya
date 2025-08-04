from django.core.management.base import BaseCommand
from resume_checker.models import Resume
from resume_checker.nlp_utils import extract_skills_from_text


class Command(BaseCommand):
    help = 'Add extracted_skills to all resumes that only have parsed_text'

    def handle(self, *args, **options):
        resumes = Resume.objects.filter(extracted_skills__isnull=True).exclude(parsed_text__isnull=True)
        # Also get resumes with empty extracted_skills lists
        empty_skills_resumes = Resume.objects.filter(extracted_skills=[]).exclude(parsed_text__isnull=True)
        resumes = list(resumes) + list(empty_skills_resumes)
        
        self.stdout.write(f"Found {len(resumes)} resumes without extracted_skills")
        
        for resume in resumes:
            if resume.parsed_text:
                extracted_skills = extract_skills_from_text(resume.parsed_text)
                resume.extracted_skills = extracted_skills
                resume.save()
                self.stdout.write(f"Added extracted_skills to resume {resume.id}: {extracted_skills}")
        
        self.stdout.write(self.style.SUCCESS(f"Successfully processed {len(resumes)} resumes")) 