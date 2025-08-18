"""
URL configuration for yogya project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse


@api_view(['GET'])
def api_root(request, format=None):
    """
    API Root - Lists all available endpoints
    """
    base_url = request.build_absolute_uri('/api/')
    
    return Response({
        # Resume Checker endpoints (from router)
        'job_descriptions': base_url + 'job_descriptions/',
        'resumes': base_url + 'resumes/',
        'candidates': base_url + 'candidates/',
        'matches': base_url + 'matches/',
        'applications': base_url + 'applications/',
        
        # Candidate Ranking endpoints
        'candidate_ranking': {
            'rank_candidates': base_url + 'candidate-ranking/rank/',
            'get_job_rankings': base_url + 'candidate-ranking/job/{job_id}/',
            'get_candidate_rankings': base_url + 'candidate-ranking/candidate/{candidate_id}/',
            'update_ranking_status': base_url + 'candidate-ranking/ranking/{ranking_id}/status/',
            'get_ranking_batches': base_url + 'candidate-ranking/batches/',
            'get_ranking_criteria': base_url + 'candidate-ranking/criteria/',
            'get_ranking_analytics': base_url + 'candidate-ranking/analytics/{job_id}/',
        },
        
        # Jobs endpoints
        'jobs': {
            'active_jobs': base_url + 'jobs/active/',
            'job_candidates': base_url + 'jobs/{job_id}/candidates/',
        },
        
        # Interview Management endpoints
        'interview_management': {
            'sessions': base_url + 'interview/sessions/',
            'session_detail': base_url + 'interview/sessions/{session_id}/',
            'start_interview': base_url + 'interview/sessions/start/',
            'end_interview': base_url + 'interview/sessions/end/',
            'competency_scores': base_url + 'interview/sessions/{session_id}/competency-scores/',
            'submit_competency_score': base_url + 'interview/sessions/{session_id}/competency-scores/submit/',
            'feedback': base_url + 'interview/sessions/{session_id}/feedback/',
            'submit_feedback': base_url + 'interview/sessions/{session_id}/feedback/submit/',
            'ask_question': base_url + 'interview/sessions/{session_id}/questions/ask/',
            'submit_response': base_url + 'interview/questions/{question_id}/response/',
            'competency_questions_screen': base_url + 'interview/sessions/{session_id}/competency-questions/',
            'mark_question_answered': base_url + 'interview/sessions/{session_id}/mark-answered/',
            'score_competency_live': base_url + 'interview/sessions/{session_id}/score-competency/',
            'add_followup_question': base_url + 'interview/sessions/{session_id}/add-followup/',
            'interview_progress': base_url + 'interview/sessions/{session_id}/progress/',
            'analytics': base_url + 'interview/analytics/',
        },
        
        # Authentication
        'token': base_url + 'token/',
        'token_refresh': base_url + 'token/refresh/',
        'token_verify': base_url + 'token/verify/',
    })


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('', api_root, name='api-root'),
        path('', include('resume_checker.urls')),
        path('users/', include('user_management.urls')),
        path('competency/', include('competency_hiring.urls')),
        path('code/', include('code_executor.urls')),
        path('', include('candidate_ranking.urls')),
        path('interview/', include('interview_management.urls')),
        # JWT Token endpoints
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    ])),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
