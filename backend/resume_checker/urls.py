# hiring_app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobDescriptionViewSet, ResumeViewSet, CandidateViewSet, MatchViewSet, ApplicationViewSet, CandidatePortalViewSet, download_job_template, bulk_upload_jobs, debug_upload_request

# Create a router and register our viewsets with it.
# This automatically generates URL patterns for CRUD operations.
router = DefaultRouter()
router.register(r'job_descriptions', JobDescriptionViewSet)
router.register(r'resumes', ResumeViewSet)
router.register(r'candidates', CandidateViewSet)
router.register(r'matches', MatchViewSet)
router.register(r'applications', ApplicationViewSet)
router.register(r'candidate-portal', CandidatePortalViewSet, basename='candidate-portal')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('job_descriptions/download-template/', download_job_template, name='download_job_template'),
    path('job_descriptions/bulk-upload/', bulk_upload_jobs, name='bulk_upload_jobs'),
    path('debug/upload-request/', debug_upload_request, name='debug_upload_request'),
    path('', include(router.urls)),
]

