from django.core.management.base import BaseCommand
from django.utils import timezone
from resume_checker.models import Candidate, Resume
import os

class Command(BaseCommand):
    help = 'Update existing candidates with resume data and skills'

    def handle(self, *args, **options):
        candidates_data = [
            {
                'first_name': 'Rohit',
                'last_name': 'Sharma',
                'resume_file': 'Rohit_Sharma_Lead_Python_Developer.txt',
                'skills': ['Python', 'Django', 'Flask', 'FastAPI', 'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD', 'Microservices', 'Leadership', 'Team Management', 'Mentoring']
            },
            {
                'first_name': 'Steve',
                'last_name': 'Smith',
                'resume_file': 'Steve_Smith_Full_Stack_Developer.txt',
                'skills': ['React', 'Angular', 'Vue.js', 'TypeScript', 'JavaScript', 'Python', 'Node.js', 'Java', 'C#', 'PHP', 'Django', 'Flask', 'Express.js', 'Spring Boot', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Git', 'React Native', 'Flutter']
            },
            {
                'first_name': 'Jaspreet',
                'last_name': 'Bumrah',
                'resume_file': 'Jasprit_Bumrah_DevOps_Developer.txt',
                'skills': ['Java', 'Python', 'JavaScript', 'Spring Boot', 'Django', 'Flask', 'React', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Ansible', 'Git', 'CI/CD', 'DevOps', 'Microservices']
            },
            {
                'first_name': 'Shubhman',
                'last_name': 'Gill',
                'resume_file': 'Shubhman_Gill_Entry_Level.txt',
                'skills': ['Python', 'JavaScript', 'Java', 'C++', 'React', 'Django', 'Flask', 'Bootstrap', 'MySQL', 'SQLite', 'MongoDB', 'Git', 'HTML5', 'CSS3', 'Data Structures', 'Algorithms', 'Object-Oriented Programming']
            },
            {
                'first_name': 'Joe',
                'last_name': 'Root',
                'resume_file': 'Joe_Root_Architect.txt',
                'skills': ['Java', 'Python', 'C#', 'JavaScript', 'TypeScript', 'Spring Boot', '.NET Core', 'Django', 'React', 'Angular', 'Node.js', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Cassandra', 'Elasticsearch', 'Microservices', 'Event-Driven Architecture', 'Domain-Driven Design', 'API Design', 'System Architecture', 'Cloud Architecture', 'Leadership', 'Team Management']
            }
        ]

        candidates_updated = 0
        
        for candidate_data in candidates_data:
            try:
                # Find existing candidate
                candidate = Candidate.objects.get(
                    first_name=candidate_data['first_name'],
                    last_name=candidate_data['last_name']
                )

                # Read resume file
                resume_file_path = os.path.join(
                    '/Users/akhiltripathi/dev/yogya/sample_resumes',
                    candidate_data['resume_file']
                )
                
                if os.path.exists(resume_file_path):
                    with open(resume_file_path, 'r', encoding='utf-8') as f:
                        resume_content = f.read()
                    
                    # Delete existing resume if any
                    Resume.objects.filter(candidate=candidate).delete()
                    
                    # Create new resume
                    resume = Resume.objects.create(
                        candidate=candidate,
                        file_name=candidate_data['resume_file'],
                        file_content=resume_content,
                        file_type='txt',
                        upload_date=timezone.now(),
                        status='processed'
                    )
                    
                    # Update candidate with skills
                    candidate.extracted_skills = candidate_data['skills']
                    candidate.save()
                    
                    candidates_updated += 1
                    self.stdout.write(f"✅ Updated {candidate.first_name} {candidate.last_name} - {candidate.current_title}")
                else:
                    self.stdout.write(f"❌ Resume file not found: {resume_file_path}")
                    
            except Candidate.DoesNotExist:
                self.stdout.write(f"❌ Candidate not found: {candidate_data['first_name']} {candidate_data['last_name']}")
            except Exception as e:
                self.stdout.write(f"❌ Error updating {candidate_data['first_name']} {candidate_data['last_name']}: {str(e)}")

        self.stdout.write(
            self.style.SUCCESS(f'🎉 Successfully updated {candidates_updated} candidate profiles!')
        )
        
        # Show summary
        self.stdout.write(f'📊 Updated Candidates:')
        for candidate in Candidate.objects.filter(first_name__in=['Rohit', 'Steve', 'Jaspreet', 'Shubhman', 'Joe']):
            resume_count = Resume.objects.filter(candidate=candidate).count()
            skills_count = len(candidate.extracted_skills) if candidate.extracted_skills else 0
            self.stdout.write(f'   • {candidate.first_name} {candidate.last_name} - {candidate.current_title} ({candidate.total_experience_years}+ years) - Resume: {resume_count}, Skills: {skills_count}')
        
        self.stdout.write(f'🎯 Total Candidates: {Candidate.objects.count()}')
        self.stdout.write(f'📄 Total Resumes: {Resume.objects.count()}')

