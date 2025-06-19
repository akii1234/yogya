from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobDescriptionViewSet, ResumeViewSet, CandidateViewSet, MatchViewSet

router = DefaultRouter()
router.register(r'job_descriptions', JobDescriptionViewSet)
router.register(r'candidates', CandidateViewSet)
router.register(r'resumes', ResumeViewSet)
router.register(r'matches', MatchViewSet)

urlpatterns = [
    path('', include(router.urls)),
]