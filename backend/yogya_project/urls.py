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
    return Response({
        # Resume Checker endpoints (from router)
        'job_descriptions': reverse('jobdescription-list', request=request, format=format),
        'resumes': reverse('resume-list', request=request, format=format),
        'candidates': reverse('candidate-list', request=request, format=format),
        'matches': reverse('match-list', request=request, format=format),
        'applications': reverse('application-list', request=request, format=format),
        
        # Candidate Ranking endpoints
        'candidate_ranking': {
            'rank_candidates': reverse('rank_candidates', request=request, format=format),
            'get_job_rankings': reverse('get_job_rankings', request=request, format=format),
            'get_candidate_rankings': reverse('get_candidate_rankings', request=request, format=format),
            'update_ranking_status': reverse('update_ranking_status', request=request, format=format),
            'get_ranking_batches': reverse('get_ranking_batches', request=request, format=format),
            'get_ranking_criteria': reverse('get_ranking_criteria', request=request, format=format),
            'get_ranking_analytics': reverse('get_ranking_analytics', request=request, format=format),
        },
        
        # Jobs endpoints
        'jobs': {
            'active_jobs': reverse('get_active_jobs', request=request, format=format),
            'job_candidates': reverse('get_candidates_for_job', request=request, format=format),
        },
        
        # Authentication
        'token': reverse('token_obtain_pair', request=request, format=format),
        'token_refresh': reverse('token_refresh', request=request, format=format),
        'token_verify': reverse('token_verify', request=request, format=format),
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
        # JWT Token endpoints
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    ])),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
