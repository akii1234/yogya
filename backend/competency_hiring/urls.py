from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'frameworks', views.CompetencyFrameworkViewSet)
router.register(r'competencies', views.CompetencyViewSet)
router.register(r'templates', views.InterviewTemplateViewSet)
router.register(r'questions', views.InterviewQuestionViewSet)
router.register(r'sessions', views.InterviewSessionViewSet)
router.register(r'evaluations', views.CompetencyEvaluationViewSet)
router.register(r'ai-sessions', views.AIInterviewSessionViewSet)
router.register(r'analytics', views.InterviewAnalyticsViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('recommend-framework/', views.FrameworkRecommendationView.as_view(), name='recommend-framework'),
] 