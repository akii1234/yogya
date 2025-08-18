from django.apps import AppConfig


class InterviewManagementConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'interview_management'
    verbose_name = 'Interview Management'
    
    def ready(self):
        """Import signals when the app is ready"""
        try:
            import interview_management.signals
        except ImportError:
            pass
