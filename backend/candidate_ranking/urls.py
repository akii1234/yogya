from django.urls import path
from . import views

app_name = 'candidate_ranking'

urlpatterns = [
    # Ranking operations
    path('api/candidate-ranking/rank/', views.rank_candidates_for_job, name='rank_candidates'),
    path('api/candidate-ranking/job/<str:job_id>/', views.get_job_rankings, name='get_job_rankings'),
    path('api/candidate-ranking/candidate/<str:candidate_id>/', views.get_candidate_rankings, name='get_candidate_rankings'),
    path('api/candidate-ranking/ranking/<str:ranking_id>/status/', views.update_ranking_status, name='update_ranking_status'),
    
    # Batch and criteria management
    path('api/candidate-ranking/batches/', views.get_ranking_batches, name='get_ranking_batches'),
    path('api/candidate-ranking/criteria/', views.get_ranking_criteria, name='get_ranking_criteria'),
    
    # Analytics
    path('api/candidate-ranking/analytics/<str:job_id>/', views.get_ranking_analytics, name='get_ranking_analytics'),
] 