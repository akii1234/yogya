from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db.models import Q, Avg, Max, Min
import json
import logging

from .models import CandidateRanking, RankingBatch, RankingCriteria
from .services import CandidateRankingService
from resume_checker.models import JobDescription, Candidate
from user_management.models import User

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
@login_required
def rank_candidates_for_job(request):
    """
    Rank candidates for a specific job.
    
    POST /api/candidate-ranking/rank/
    {
        "job_id": "JOB-XXXXXX",
        "candidate_ids": ["CAN-XXXXXX", "CAN-YYYYYY"],
        "criteria_id": "optional-criteria-id"
    }
    """
    try:
        data = json.loads(request.body)
        job_id = data.get('job_id')
        candidate_ids = data.get('candidate_ids', [])
        criteria_id = data.get('criteria_id')
        
        if not job_id:
            return JsonResponse({
                'success': False,
                'error': 'job_id is required'
            }, status=400)
        
        # Get job description
        job_description = get_object_or_404(JobDescription, job_id=job_id)
        
        # Get candidates
        candidates = Candidate.objects.filter(candidate_id__in=candidate_ids)
        if not candidates.exists():
            return JsonResponse({
                'success': False,
                'error': 'No valid candidates found'
            }, status=400)
        
        # Get criteria if specified
        criteria = None
        if criteria_id:
            try:
                criteria = RankingCriteria.objects.get(id=criteria_id, is_active=True)
            except RankingCriteria.DoesNotExist:
                return JsonResponse({
                    'success': False,
                    'error': 'Invalid criteria_id'
                }, status=400)
        
        # Initialize ranking service
        ranking_service = CandidateRankingService(criteria)
        
        # Perform ranking
        batch = ranking_service.rank_candidates_for_job(
            job_description=job_description,
            candidates=list(candidates),
            created_by=request.user
        )
        
        # Get top candidates for response
        top_candidates = ranking_service.get_top_candidates(job_description, limit=10)
        
        return JsonResponse({
            'success': True,
            'batch_id': batch.batch_id,
            'job_id': job_id,
            'total_candidates': batch.total_candidates,
            'ranked_candidates': batch.ranked_candidates,
            'failed_rankings': batch.failed_rankings,
            'processing_time_seconds': batch.processing_time_seconds,
            'top_candidates': [
                {
                    'ranking_id': ranking.ranking_id,
                    'candidate_id': ranking.candidate.candidate_id,
                    'candidate_name': ranking.candidate.full_name,
                    'rank_position': ranking.rank_position,
                    'overall_score': float(ranking.overall_score),
                    'skill_match_score': float(ranking.skill_match_score),
                    'experience_match_score': float(ranking.experience_match_score),
                    'education_match_score': float(ranking.education_match_score),
                    'location_match_score': float(ranking.location_match_score),
                    'matched_skills': ranking.matched_skills,
                    'missing_skills': ranking.missing_skills,
                    'experience_gap': ranking.experience_gap,
                    'is_shortlisted': ranking.is_shortlisted,
                    'is_rejected': ranking.is_rejected
                }
                for ranking in top_candidates
            ]
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        logger.error(f"Error in rank_candidates_for_job: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Internal server error'
        }, status=500)


@require_http_methods(["GET"])
@login_required
def get_job_rankings(request, job_id):
    """
    Get all rankings for a specific job.
    
    GET /api/candidate-ranking/job/{job_id}/
    Query params: page, limit, status, min_score, max_score
    """
    try:
        # Get job description
        job_description = get_object_or_404(JobDescription, job_id=job_id)
        
        # Get query parameters
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)  # Max 100 per page
        status = request.GET.get('status', 'active')
        min_score = request.GET.get('min_score')
        max_score = request.GET.get('max_score')
        
        # Build queryset
        queryset = CandidateRanking.objects.filter(
            job_description=job_description,
            status=status
        ).select_related('candidate', 'application')
        
        # Apply score filters
        if min_score:
            queryset = queryset.filter(overall_score__gte=float(min_score))
        if max_score:
            queryset = queryset.filter(overall_score__lte=float(max_score))
        
        # Order by rank position
        queryset = queryset.order_by('rank_position')
        
        # Paginate
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        
        return JsonResponse({
            'success': True,
            'job_id': job_id,
            'job_title': job_description.title,
            'total_rankings': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page,
            'rankings': [
                {
                    'ranking_id': ranking.ranking_id,
                    'candidate_id': ranking.candidate.candidate_id,
                    'candidate_name': ranking.candidate.full_name,
                    'candidate_email': ranking.candidate.email,
                    'candidate_location': f"{ranking.candidate.city}, {ranking.candidate.state}" if ranking.candidate.city else None,
                    'rank_position': ranking.rank_position,
                    'total_candidates': ranking.total_candidates,
                    'overall_score': float(ranking.overall_score),
                    'skill_match_score': float(ranking.skill_match_score),
                    'experience_match_score': float(ranking.experience_match_score),
                    'education_match_score': float(ranking.education_match_score),
                    'location_match_score': float(ranking.location_match_score),
                    'matched_skills': ranking.matched_skills,
                    'missing_skills': ranking.missing_skills,
                    'skill_gap_percentage': float(ranking.skill_gap_percentage),
                    'experience_years': ranking.experience_years,
                    'required_experience_years': ranking.required_experience_years,
                    'experience_gap': ranking.experience_gap,
                    'experience_status': ranking.experience_status,
                    'is_top_candidate': ranking.is_top_candidate,
                    'is_high_match': ranking.is_high_match,
                    'is_medium_match': ranking.is_medium_match,
                    'is_low_match': ranking.is_low_match,
                    'is_shortlisted': ranking.is_shortlisted,
                    'is_rejected': ranking.is_rejected,
                    'hr_notes': ranking.hr_notes,
                    'has_application': ranking.application is not None,
                    'application_status': ranking.application.status if ranking.application else None,
                    'created_at': ranking.created_at.isoformat(),
                    'last_ranked_at': ranking.last_ranked_at.isoformat()
                }
                for ranking in page_obj
            ]
        })
        
    except Exception as e:
        logger.error(f"Error in get_job_rankings: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Internal server error'
        }, status=500)


@require_http_methods(["GET"])
@login_required
def get_candidate_rankings(request, candidate_id):
    """
    Get all rankings for a specific candidate.
    
    GET /api/candidate-ranking/candidate/{candidate_id}/
    Query params: page, limit, status
    """
    try:
        # Get candidate
        candidate = get_object_or_404(Candidate, candidate_id=candidate_id)
        
        # Get query parameters
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        status = request.GET.get('status', 'active')
        
        # Build queryset
        queryset = CandidateRanking.objects.filter(
            candidate=candidate,
            status=status
        ).select_related('job_description', 'application')
        
        # Order by overall score (descending)
        queryset = queryset.order_by('-overall_score')
        
        # Paginate
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        
        return JsonResponse({
            'success': True,
            'candidate_id': candidate_id,
            'candidate_name': candidate.full_name,
            'total_rankings': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page,
            'rankings': [
                {
                    'ranking_id': ranking.ranking_id,
                    'job_id': ranking.job_description.job_id,
                    'job_title': ranking.job_description.title,
                    'company': ranking.job_description.company,
                    'department': ranking.job_description.department,
                    'location': ranking.job_description.location,
                    'rank_position': ranking.rank_position,
                    'total_candidates': ranking.total_candidates,
                    'overall_score': float(ranking.overall_score),
                    'skill_match_score': float(ranking.skill_match_score),
                    'experience_match_score': float(ranking.experience_match_score),
                    'education_match_score': float(ranking.education_match_score),
                    'location_match_score': float(ranking.location_match_score),
                    'matched_skills': ranking.matched_skills,
                    'missing_skills': ranking.missing_skills,
                    'skill_gap_percentage': float(ranking.skill_gap_percentage),
                    'experience_gap': ranking.experience_gap,
                    'experience_status': ranking.experience_status,
                    'is_top_candidate': ranking.is_top_candidate,
                    'is_high_match': ranking.is_high_match,
                    'is_medium_match': ranking.is_medium_match,
                    'is_low_match': ranking.is_low_match,
                    'is_shortlisted': ranking.is_shortlisted,
                    'is_rejected': ranking.is_rejected,
                    'has_application': ranking.application is not None,
                    'application_status': ranking.application.status if ranking.application else None,
                    'created_at': ranking.created_at.isoformat(),
                    'last_ranked_at': ranking.last_ranked_at.isoformat()
                }
                for ranking in page_obj
            ]
        })
        
    except Exception as e:
        logger.error(f"Error in get_candidate_rankings: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Internal server error'
        }, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
@login_required
def update_ranking_status(request, ranking_id):
    """
    Update HR actions on a ranking.
    
    PUT /api/candidate-ranking/ranking/{ranking_id}/status/
    {
        "is_shortlisted": true/false,
        "is_rejected": true/false,
        "hr_notes": "Optional notes"
    }
    """
    try:
        # Get ranking
        ranking = get_object_or_404(CandidateRanking, ranking_id=ranking_id)
        
        data = json.loads(request.body)
        is_shortlisted = data.get('is_shortlisted')
        is_rejected = data.get('is_rejected')
        hr_notes = data.get('hr_notes')
        
        # Update ranking
        ranking_service = CandidateRankingService()
        updated_ranking = ranking_service.update_ranking_status(
            ranking=ranking,
            is_shortlisted=is_shortlisted,
            is_rejected=is_rejected,
            hr_notes=hr_notes
        )
        
        return JsonResponse({
            'success': True,
            'ranking_id': ranking_id,
            'is_shortlisted': updated_ranking.is_shortlisted,
            'is_rejected': updated_ranking.is_rejected,
            'hr_notes': updated_ranking.hr_notes,
            'updated_at': updated_ranking.updated_at.isoformat()
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        logger.error(f"Error in update_ranking_status: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Internal server error'
        }, status=500)


@require_http_methods(["GET"])
@login_required
def get_ranking_batches(request):
    """
    Get ranking batches for a job or user.
    
    GET /api/candidate-ranking/batches/
    Query params: job_id, created_by, status, page, limit
    """
    try:
        # Get query parameters
        job_id = request.GET.get('job_id')
        created_by = request.GET.get('created_by')
        status = request.GET.get('status')
        page = int(request.GET.get('page', 1))
        limit = min(int(request.GET.get('limit', 20)), 100)
        
        # Build queryset
        queryset = RankingBatch.objects.select_related('job_description', 'created_by')
        
        # Apply filters
        if job_id:
            queryset = queryset.filter(job_description__job_id=job_id)
        if created_by:
            queryset = queryset.filter(created_by__email=created_by)
        if status:
            queryset = queryset.filter(status=status)
        
        # Order by started_at (descending)
        queryset = queryset.order_by('-started_at')
        
        # Paginate
        paginator = Paginator(queryset, limit)
        page_obj = paginator.get_page(page)
        
        return JsonResponse({
            'success': True,
            'total_batches': paginator.count,
            'total_pages': paginator.num_pages,
            'current_page': page,
            'batches': [
                {
                    'batch_id': batch.batch_id,
                    'job_id': batch.job_description.job_id,
                    'job_title': batch.job_description.title,
                    'status': batch.status,
                    'total_candidates': batch.total_candidates,
                    'ranked_candidates': batch.ranked_candidates,
                    'failed_rankings': batch.failed_rankings,
                    'success_rate': float(batch.success_rate),
                    'processing_time_seconds': batch.processing_time_seconds,
                    'created_by': batch.created_by.email if batch.created_by else None,
                    'started_at': batch.started_at.isoformat(),
                    'completed_at': batch.completed_at.isoformat() if batch.completed_at else None,
                    'error_message': batch.error_message
                }
                for batch in page_obj
            ]
        })
        
    except Exception as e:
        logger.error(f"Error in get_ranking_batches: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Internal server error'
        }, status=500)


@require_http_methods(["GET"])
@login_required
def get_ranking_criteria(request):
    """
    Get available ranking criteria.
    
    GET /api/candidate-ranking/criteria/
    """
    try:
        criteria = RankingCriteria.objects.filter(is_active=True).order_by('-is_default', 'name')
        
        return JsonResponse({
            'success': True,
            'criteria': [
                {
                    'id': criterion.id,
                    'name': criterion.name,
                    'description': criterion.description,
                    'is_default': criterion.is_default,
                    'skill_weight': float(criterion.skill_weight),
                    'experience_weight': float(criterion.experience_weight),
                    'education_weight': float(criterion.education_weight),
                    'location_weight': float(criterion.location_weight),
                    'total_weight': float(criterion.total_weight),
                    'created_at': criterion.created_at.isoformat()
                }
                for criterion in criteria
            ]
        })
        
    except Exception as e:
        logger.error(f"Error in get_ranking_criteria: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Internal server error'
        }, status=500)


@require_http_methods(["GET"])
@login_required
def get_ranking_analytics(request, job_id):
    """
    Get analytics for job rankings.
    
    GET /api/candidate-ranking/analytics/{job_id}/
    """
    try:
        # Get job description
        job_description = get_object_or_404(JobDescription, job_id=job_id)
        
        # Get all rankings for this job
        rankings = CandidateRanking.objects.filter(
            job_description=job_description,
            status='active'
        )
        
        if not rankings.exists():
            return JsonResponse({
                'success': True,
                'job_id': job_id,
                'total_candidates': 0,
                'analytics': {}
            })
        
        # Calculate analytics
        total_candidates = rankings.count()
        avg_score = rankings.aggregate(avg_score=models.Avg('overall_score'))['avg_score'] or 0
        max_score = rankings.aggregate(max_score=models.Max('overall_score'))['max_score'] or 0
        min_score = rankings.aggregate(min_score=models.Min('overall_score'))['min_score'] or 0
        
        # Score distribution
        high_matches = rankings.filter(overall_score__gte=80).count()
        medium_matches = rankings.filter(overall_score__gte=60, overall_score__lt=80).count()
        low_matches = rankings.filter(overall_score__lt=60).count()
        
        # Top candidates
        top_candidates = rankings.filter(is_top_candidate=True).count()
        shortlisted = rankings.filter(is_shortlisted=True).count()
        rejected = rankings.filter(is_rejected=True).count()
        
        # Experience analysis
        overqualified = rankings.filter(experience_gap__gte=2).count()
        well_matched_exp = rankings.filter(experience_gap__gte=-1, experience_gap__lt=2).count()
        underqualified = rankings.filter(experience_gap__lt=-1).count()
        
        return JsonResponse({
            'success': True,
            'job_id': job_id,
            'job_title': job_description.title,
            'total_candidates': total_candidates,
            'analytics': {
                'score_stats': {
                    'average_score': round(float(avg_score), 2),
                    'max_score': round(float(max_score), 2),
                    'min_score': round(float(min_score), 2),
                    'score_range': round(float(max_score - min_score), 2)
                },
                'score_distribution': {
                    'high_matches': high_matches,
                    'medium_matches': medium_matches,
                    'low_matches': low_matches,
                    'high_match_percentage': round((high_matches / total_candidates) * 100, 2) if total_candidates > 0 else 0,
                    'medium_match_percentage': round((medium_matches / total_candidates) * 100, 2) if total_candidates > 0 else 0,
                    'low_match_percentage': round((low_matches / total_candidates) * 100, 2) if total_candidates > 0 else 0
                },
                'candidate_status': {
                    'top_candidates': top_candidates,
                    'shortlisted': shortlisted,
                    'rejected': rejected,
                    'pending_review': total_candidates - shortlisted - rejected
                },
                'experience_analysis': {
                    'overqualified': overqualified,
                    'well_matched': well_matched_exp,
                    'underqualified': underqualified,
                    'overqualified_percentage': round((overqualified / total_candidates) * 100, 2) if total_candidates > 0 else 0,
                    'well_matched_percentage': round((well_matched_exp / total_candidates) * 100, 2) if total_candidates > 0 else 0,
                    'underqualified_percentage': round((underqualified / total_candidates) * 100, 2) if total_candidates > 0 else 0
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Error in get_ranking_analytics: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': 'Internal server error'
        }, status=500)
