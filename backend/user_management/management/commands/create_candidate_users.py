from django.core.management.base import BaseCommand
from user_management.models import User

class Command(BaseCommand):
    help = 'Create user accounts for candidates with login credentials'

    def handle(self, *args, **options):
        candidates_data = [
            {
                'email': 'rohit.sharma@email.com',
                'first_name': 'Rohit',
                'last_name': 'Sharma',
                'password': 'rohit123',
                'role': 'candidate'
            },
            {
                'email': 'steve.smith@email.com',
                'first_name': 'Steve',
                'last_name': 'Smith',
                'password': 'steve123',
                'role': 'candidate'
            },
            {
                'email': 'jaspreet.bumrah@email.com',
                'first_name': 'Jaspreet',
                'last_name': 'Bumrah',
                'password': 'bumrah123',
                'role': 'candidate'
            },
            {
                'email': 'shubhman.gill@email.com',
                'first_name': 'Shubhman',
                'last_name': 'Gill',
                'password': 'gill123',
                'role': 'candidate'
            },
            {
                'email': 'joe.root@email.com',
                'first_name': 'Joe',
                'last_name': 'Root',
                'password': 'root123',
                'role': 'candidate'
            }
        ]

        users_created = 0
        
        for candidate_data in candidates_data:
            try:
                # Check if user already exists
                if User.objects.filter(email=candidate_data['email']).exists():
                    user = User.objects.get(email=candidate_data['email'])
                    user.set_password(candidate_data['password'])
                    user.save()
                    self.stdout.write(f"✅ Updated password for {user.first_name} {user.last_name}")
                else:
                    # Create new user
                    username = candidate_data['email'].split('@')[0]  # Use email prefix as username
                    user = User.objects.create_user(
                        username=username,
                        email=candidate_data['email'],
                        first_name=candidate_data['first_name'],
                        last_name=candidate_data['last_name'],
                        password=candidate_data['password'],
                        role=candidate_data['role']
                    )
                    self.stdout.write(f"✅ Created {user.first_name} {user.last_name}")
                
                users_created += 1
                
            except Exception as e:
                self.stdout.write(f"❌ Error creating {candidate_data['first_name']} {candidate_data['last_name']}: {str(e)}")

        self.stdout.write(
            self.style.SUCCESS(f'🎉 Successfully processed {users_created} candidate users!')
        )
        
        # Show login credentials
        self.stdout.write(f'\n📋 CANDIDATE LOGIN CREDENTIALS:')
        self.stdout.write(f'=' * 50)
        for candidate_data in candidates_data:
            self.stdout.write(f'👤 {candidate_data["first_name"]} {candidate_data["last_name"]}')
            self.stdout.write(f'   📧 Email: {candidate_data["email"]}')
            self.stdout.write(f'   🔑 Password: {candidate_data["password"]}')
            self.stdout.write(f'   👥 Role: {candidate_data["role"].title()}')
            self.stdout.write(f'   🔗 Login URL: http://localhost:5173/login')
            self.stdout.write(f'')
        
        self.stdout.write(f'🎯 Total Users: {User.objects.count()}')
        self.stdout.write(f'👥 Candidate Users: {User.objects.filter(role="candidate").count()}')
