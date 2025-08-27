from django.core.management.base import BaseCommand
from django.utils import timezone
from resume_checker.models import Candidate, Resume
import os

class Command(BaseCommand):
    help = 'Create test candidate profiles with resumes'

    def handle(self, *args, **options):
        candidates_data = [
            {
                'first_name': 'Rohit',
                'last_name': 'Sharma',
                'email': 'rohit.sharma@email.com',
                'phone': '+91-98765-43210',
                'city': 'Bangalore',
                'state': 'Karnataka',
                'country': 'India',
                'current_title': 'Lead Python Developer',
                'current_company': 'BigTech',
                'total_experience_years': 10,
                'resume_file': 'Rohit_Sharma_Lead_Python_Developer.txt',
                'skills': ['Python', 'Django', 'Flask', 'FastAPI', 'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'Redis', 'AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD', 'Microservices', 'Leadership', 'Team Management', 'Mentoring']
            },
            {
                'first_name': 'Steve',
                'last_name': 'Smith',
                'email': 'steve.smith@email.com',
                'phone': '+44-20-7123-4567',
                'city': 'London',
                'state': 'England',
                'country': 'UK',
                'current_title': 'Senior Full Stack Developer',
                'current_company': 'BigTech',
                'total_experience_years': 10,
                'resume_file': 'Steve_Smith_Full_Stack_Developer.txt',
                'skills': ['React', 'Angular', 'Vue.js', 'TypeScript', 'JavaScript', 'Python', 'Node.js', 'Java', 'C#', 'PHP', 'Django', 'Flask', 'Express.js', 'Spring Boot', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Git', 'React Native', 'Flutter']
            },
            {
                'first_name': 'Jaspreet',
                'last_name': 'Bumrah',
                'email': 'jaspreet.bumrah@email.com',
                'phone': '+91-98765-12345',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'country': 'India',
                'current_title': 'DevOps Engineer',
                'current_company': 'BigTech',
                'total_experience_years': 5,
                'resume_file': 'Jasprit_Bumrah_DevOps_Developer.txt',
                'skills': ['Java', 'Python', 'JavaScript', 'Spring Boot', 'Django', 'Flask', 'React', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform', 'Ansible', 'Git', 'CI/CD', 'DevOps', 'Microservices']
            },
            {
                'first_name': 'Shubhman',
                'last_name': 'Gill',
                'email': 'shubhman.gill@email.com',
                'phone': '+91-98765-67890',
                'city': 'Chandigarh',
                'state': 'Punjab',
                'country': 'India',
                'current_title': 'Entry Level Developer',
                'current_company': 'Fresh Graduate',
                'total_experience_years': 0,
                'resume_file': 'Shubhman_Gill_Entry_Level.txt',
                'skills': ['Python', 'JavaScript', 'Java', 'C++', 'React', 'Django', 'Flask', 'Bootstrap', 'MySQL', 'SQLite', 'MongoDB', 'Git', 'HTML5', 'CSS3', 'Data Structures', 'Algorithms', 'Object-Oriented Programming']
            },
            {
                'first_name': 'Joe',
                'last_name': 'Root',
                'email': 'joe.root@email.com',
                'phone': '+44-20-7123-7890',
                'city': 'London',
                'state': 'England',
                'country': 'UK',
                'current_title': 'Senior Solutions Architect',
                'current_company': 'BigTech',
                'total_experience_years': 10,
                'resume_file': 'Joe_Root_Architect.txt',
                'skills': ['Java', 'Python', 'C#', 'JavaScript', 'TypeScript', 'Spring Boot', '.NET Core', 'Django', 'React', 'Angular', 'Node.js', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Cassandra', 'Elasticsearch', 'Microservices', 'Event-Driven Architecture', 'Domain-Driven Design', 'API Design', 'System Architecture', 'Cloud Architecture', 'Leadership', 'Team Management']
            }
        ]

        candidates_created = 0
        
        for candidate_data in candidates_data:
            try:
                # Create candidate
                candidate = Candidate.objects.create(
                    first_name=candidate_data['first_name'],
                    last_name=candidate_data['last_name'],
                    email=candidate_data['email'],
                    phone=candidate_data['phone'],
                    city=candidate_data['city'],
                    state=candidate_data['state'],
                    country=candidate_data['country'],
                    current_title=candidate_data['current_title'],
                    current_company=candidate_data['current_company'],
                    total_experience_years=candidate_data['total_experience_years']
                )

                # Read resume file
                resume_file_path = os.path.join(
                    '/Users/akhiltripathi/dev/yogya/sample_resumes',
                    candidate_data['resume_file']
                )
                
                if os.path.exists(resume_file_path):
                    with open(resume_file_path, 'r', encoding='utf-8') as f:
                        resume_content = f.read()
                    
                    # Create resume
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
                    
                    candidates_created += 1
                    self.stdout.write(f"✅ Created {candidate.first_name} {candidate.last_name} - {candidate.current_title}")
                else:
                    self.stdout.write(f"❌ Resume file not found: {resume_file_path}")
                    
            except Exception as e:
                self.stdout.write(f"❌ Error creating {candidate_data['first_name']} {candidate_data['last_name']}: {str(e)}")

        self.stdout.write(
            self.style.SUCCESS(f'🎉 Successfully created {candidates_created} candidate profiles!')
        )
        
        # Show summary
        self.stdout.write(f'📊 Candidate Summary:')
        for candidate in Candidate.objects.all():
            self.stdout.write(f'   • {candidate.first_name} {candidate.last_name} - {candidate.current_title} ({candidate.total_experience_years}+ years)')
        
        self.stdout.write(f'🎯 Total Candidates: {Candidate.objects.count()}')
