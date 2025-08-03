# hiring_app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobDescriptionViewSet, ResumeViewSet, CandidateViewSet, MatchViewSet

# Create a router and register our viewsets with it.
# This automatically generates URL patterns for CRUD operations.
router = DefaultRouter()
router.register(r'job_descriptions', JobDescriptionViewSet)
router.register(r'candidates', CandidateViewSet)
router.register(r'resumes', ResumeViewSet)
router.register(r'matches', MatchViewSet)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
]

