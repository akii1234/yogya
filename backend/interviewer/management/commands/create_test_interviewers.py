from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from interviewer.models import Interviewer

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test interviewers for development'

    def handle(self, *args, **options):
        interviewers_data = [
            {
                'first_name': 'Rahul',
                'last_name': 'Dravid',
                'email': 'rahul.dravid@yogya.com',
                'password': 'testpass123',
                'department': 'Technical Leadership',
                'title': 'Senior Technical Interviewer',
                'technical_skills': ['Python', 'Java', 'System Design', 'Architecture'],
                'interview_types': ['technical', 'system_design', 'leadership'],
                'experience_years': 12,
                'max_interviews_per_week': 20
            },
            {
                'first_name': 'Sachin',
                'last_name': 'Tendulkar',
                'email': 'sachin.tendulkar@yogya.com',
                'password': 'testpass123',
                'department': 'Frontend Development',
                'title': 'Frontend Specialist',
                'technical_skills': ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'],
                'interview_types': ['frontend', 'technical', 'ui_ux'],
                'experience_years': 15,
                'max_interviews_per_week': 15
            },
            {
                'first_name': 'MS',
                'last_name': 'Dhoni',
                'email': 'ms.dhoni@yogya.com',
                'password': 'testpass123',
                'department': 'DevOps & Infrastructure',
                'title': 'DevOps Engineer',
                'technical_skills': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
                'interview_types': ['devops', 'infrastructure', 'technical'],
                'experience_years': 10,
                'max_interviews_per_week': 12
            },
            {
                'first_name': 'Rohit',
                'last_name': 'Sharma',
                'email': 'rohit.sharma@yogya.com',
                'password': 'testpass123',
                'department': 'Data Science',
                'title': 'Data Science Lead',
                'technical_skills': ['Python', 'Machine Learning', 'SQL', 'Statistics'],
                'interview_types': ['data_science', 'technical', 'analytics'],
                'experience_years': 8,
                'max_interviews_per_week': 18
            }
        ]

        for data in interviewers_data:
            # Create or get user
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                    'username': data['email'],
                    'role': 'interviewer',
                }
            )
            
            if created:
                user.set_password(data['password'])
                user.save()
                self.stdout.write(f'✅ Created user: {user.get_full_name()}')
            else:
                self.stdout.write(f'⚠️ User already exists: {user.get_full_name()}')

            # Create or update interviewer profile
            interviewer, created = Interviewer.objects.get_or_create(
                user=user,
                defaults={
                    'company': 'Yogya',
                    'department': data['department'],
                    'title': data['title'],
                    'phone': '',
                    'technical_skills': data['technical_skills'],
                    'interview_types': data['interview_types'],
                    'experience_years': data['experience_years'],
                    'is_active': True,
                    'max_interviews_per_week': data['max_interviews_per_week']
                }
            )

            if not created:
                # Update existing interviewer
                interviewer.company = 'Yogya'
                interviewer.department = data['department']
                interviewer.title = data['title']
                interviewer.technical_skills = data['technical_skills']
                interviewer.interview_types = data['interview_types']
                interviewer.experience_years = data['experience_years']
                interviewer.is_active = True
                interviewer.max_interviews_per_week = data['max_interviews_per_week']
                interviewer.save()
                self.stdout.write(f'✅ Updated interviewer profile for: {user.get_full_name()}')
            else:
                self.stdout.write(f'✅ Created interviewer profile for: {user.get_full_name()}')

        self.stdout.write(self.style.SUCCESS('🎯 Test interviewers created successfully!'))
        self.stdout.write('📧 Login credentials:')
        for data in interviewers_data:
            self.stdout.write(f'   - {data["email"]} / {data["password"]}')
