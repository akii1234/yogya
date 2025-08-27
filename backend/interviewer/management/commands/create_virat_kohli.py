from django.core.management.base import BaseCommand
from user_management.models import User
from interviewer.models import Interviewer


class Command(BaseCommand):
    help = 'Create Virat Kohli as an interviewer'

    def handle(self, *args, **options):
        try:
            # Create or get user
            user, created = User.objects.get_or_create(
                email='virat.kohli@yogya.com',
                defaults={
                    'username': 'virat.kohli',
                    'first_name': 'Virat',
                    'last_name': 'Kohli',
                    'role': 'interviewer',
                    'status': 'active'
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created user: {user.get_full_name()}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠️ User already exists: {user.get_full_name()}')
                )
            
            # Create or update interviewer profile
            interviewer, created = Interviewer.objects.get_or_create(
                user=user,
                defaults={
                    'company': 'Yogya',
                    'department': 'Leadership & Strategy',
                    'title': 'Senior Leadership Interviewer',
                    'phone': '+91-98765-43210',
                    'technical_skills': ['Leadership', 'Strategy', 'Team Management', 'Decision Making'],
                    'interview_types': ['behavioral', 'leadership', 'strategic'],
                    'experience_years': 8,
                    'ai_assistance_enabled': True,
                    'ai_question_suggestions': True,
                    'ai_response_analysis': True,
                    'ai_followup_suggestions': True,
                    'is_active': True,
                    'max_interviews_per_week': 15
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Created interviewer profile for: {user.get_full_name()}')
                )
            else:
                # Update existing profile
                interviewer.company = 'Yogya'
                interviewer.department = 'Leadership & Strategy'
                interviewer.title = 'Senior Leadership Interviewer'
                interviewer.technical_skills = ['Leadership', 'Strategy', 'Team Management', 'Decision Making']
                interviewer.interview_types = ['behavioral', 'leadership', 'strategic']
                interviewer.experience_years = 8
                interviewer.is_active = True
                interviewer.max_interviews_per_week = 15
                interviewer.save()
                
                self.stdout.write(
                    self.style.SUCCESS(f'✅ Updated interviewer profile for: {user.get_full_name()}')
                )
            
            self.stdout.write(
                self.style.SUCCESS(f'🎯 Virat Kohli is now available as an interviewer!')
            )
            self.stdout.write(f'   - Email: {user.email}')
            self.stdout.write(f'   - Department: {interviewer.department}')
            self.stdout.write(f'   - Skills: {", ".join(interviewer.technical_skills)}')
            self.stdout.write(f'   - Status: {"Active" if interviewer.is_active else "Inactive"}')
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error creating Virat Kohli: {str(e)}')
            )
