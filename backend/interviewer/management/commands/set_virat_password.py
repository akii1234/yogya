from django.core.management.base import BaseCommand
from user_management.models import User


class Command(BaseCommand):
    help = 'Set password for Virat Kohli'

    def handle(self, *args, **options):
        try:
            # Find Virat Kohli user
            user = User.objects.get(email='virat.kohli@yogya.com')
            
            # Set password
            password = 'virat123'  # Simple password for testing
            user.set_password(password)
            user.save()
            
            self.stdout.write(
                self.style.SUCCESS(f'✅ Password set for Virat Kohli!')
            )
            self.stdout.write(f'   - Email: {user.email}')
            self.stdout.write(f'   - Password: {password}')
            self.stdout.write(f'   - Role: {user.get_role_display_name()}')
            self.stdout.write(f'   - Status: {user.get_status_display()}')
            
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'❌ Virat Kohli user not found. Run create_virat_kohli first.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error setting password: {str(e)}')
            )
