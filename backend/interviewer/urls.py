from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'interviewer'

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'interviewers', views.InterviewerViewSet, basename='interviewer')
router.register(r'interviews', views.InterviewViewSet, basename='interview')

urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
] 