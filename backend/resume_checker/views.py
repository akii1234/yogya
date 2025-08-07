# hiring_app/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
import os
import logging
from .models import JobDescription, Resume, Candidate, Match, Application
from .serializers import JobDescriptionSerializer, ResumeSerializer, CandidateSerializer, MatchSerializer, ApplicationSerializer
from .nlp_utils import extract_text_from_file, preprocess_text, extract_skills_from_text, calculate_ats_similarity, calculate_skill_based_similarity
import pandas as pd
import io
import csv
from django.http import HttpResponse
from django.core.exceptions import ValidationError
from rest_framework import permissions
import uuid
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes

# Set up logging
logger = logging.getLogger(__name__)

# Custom pagination class for job descriptions
class JobDescriptionPagination(PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000

class JobDescriptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Job Descriptions.
    Includes custom actions for matching resumes and extracting skills.
    """
    queryset = JobDescription.objects.all()
    serializer_class = JobDescriptionSerializer
    ordering = ['-created_at']
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = JobDescriptionPagination

    def perform_create(self, serializer):
        """Override to automatically process text and extract skills."""
        instance = serializer.save()
        
        # Combine description and requirements for processing
        combined_text = f"{instance.description} {instance.requirements or ''}"
        
        # Preprocess text for NLP operations
        processed_text = preprocess_text(combined_text)
        instance.processed_text = processed_text
        
        # Extract skills from the combined text
        extracted_skills = extract_skills_from_text(combined_text)
        instance.extracted_skills = extracted_skills
        
        instance.save()

    def perform_update(self, serializer):
        """Override to update processed text and skills when job description is updated."""
        instance = serializer.save()
        
        # Re-process text and extract skills
        combined_text = f"{instance.description} {instance.requirements or ''}"
        processed_text = preprocess_text(combined_text)
        instance.processed_text = processed_text
        
        extracted_skills = extract_skills_from_text(combined_text)
        instance.extracted_skills = extracted_skills
        
        instance.save()

    @action(detail=True, methods=['get'], url_path='matches')
    def get_matches_for_jd(self, request, pk=None):
        """
        Get existing matches for a specific job description (read-only).
        Returns existing match results without recalculating.
        """
        job_description = self.get_object()
        
        # Get existing matches for this job description
        existing_matches = Match.objects.filter(job_description=job_description).select_related('resume__candidate')
        
        matches = []
        for match in existing_matches:
            matches.append({
                'resume_id': match.resume.id,
                'candidate_name': match.resume.candidate.full_name,
                'candidate_email': match.resume.candidate.email,
                'match_score': float(match.overall_score),
                'match_id': match.id,
                'is_high_match': match.overall_score >= 80,
                'is_medium_match': 60 <= match.overall_score < 80,
                'is_low_match': match.overall_score < 60,
                'matched_at': match.matched_at,
            })
        
        # Sort by score (highest first)
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        return Response({
            'job_description': {
                'id': job_description.id,
                'title': job_description.title,
                'company': job_description.company,
                'department': job_description.department,
            },
            'total_resumes_matched': len(matches),
            'high_matches': len([m for m in matches if m['is_high_match']]),
            'medium_matches': len([m for m in matches if m['is_medium_match']]),
            'low_matches': len([m for m in matches if m['is_low_match']]),
            'matches': matches,
            'note': 'These are existing matches. Use POST /match-all-resumes/ to recalculate.'
        })

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_jobs(self, request):
        """
        Get all job descriptions without pagination
        """
        jobs = JobDescription.objects.all().order_by('-created_at')
        serializer = self.get_serializer(jobs, many=True)
        return Response({
            'count': jobs.count(),
            'results': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='match-all-resumes')
    def match_all_resumes_to_jd(self, request, pk=None):
        """
        Match all available resumes against a specific job description.
        Returns detailed match results with scores.
        """
        job_description = self.get_object()
        # Include resumes that have been processed (have processed_text) regardless of status
        resumes = Resume.objects.filter(processed_text__isnull=False).exclude(processed_text='')
        
        matches = []
        for resume in resumes:
            # Use candidate skills for matching
            candidate_skills = resume.candidate.skills or []
            jd_skills = job_description.extracted_skills or []
            
            # Initialize similarity_score with a default value
            similarity_score = 0.0
            
            try:
                if candidate_skills and jd_skills:
                    similarity_score = calculate_skill_based_similarity(jd_skills, candidate_skills) / 100.0
                else:
                    # Fallback to text-based matching if skills not available
                    resume_processed = resume.processed_text if resume.processed_text else preprocess_text(resume.parsed_text)
                    similarity_score = calculate_ats_similarity(resume_processed, job_description.processed_text)
            except Exception as e:
                # If any error occurs during matching, use default score
                print(f"Error matching resume {resume.id}: {e}")
                similarity_score = 0.0
            
            # Convert to percentage
            overall_score = round(similarity_score * 100, 2)
            
            # Create or update match
            match, created = Match.objects.get_or_create(
                job_description=job_description,
                resume=resume,
                defaults={
                    'overall_score': overall_score,
                    'skill_score': overall_score,  # For now, use overall score for skill score
                    'experience_score': 0,
                    'technical_score': 0,
                    'semantic_score': 0,
                    'education_score': 0,
                }
            )
            
            if not created:
                match.overall_score = overall_score
                match.skill_score = overall_score
                match.save()
            
            matches.append({
                'resume_id': resume.id,
                'candidate_name': resume.candidate.full_name,
                'candidate_email': resume.candidate.email,
                'match_score': overall_score,
                'match_id': match.id,
                'is_high_match': overall_score >= 80,
                'is_medium_match': 60 <= overall_score < 80,
                'is_low_match': overall_score < 60,
            })
        
        # Sort by score (highest first)
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        return Response({
            'job_description': {
                'id': job_description.id,
                'title': job_description.title,
                'company': job_description.company,
                'department': job_description.department,
            },
            'total_resumes_matched': len(matches),
            'high_matches': len([m for m in matches if m['is_high_match']]),
            'medium_matches': len([m for m in matches if m['is_medium_match']]),
            'low_matches': len([m for m in matches if m['is_low_match']]),
            'matches': matches
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def download_template(self, request):
        """
        Download CSV template for bulk job creation
        """
        try:
            # Create CSV content
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            headers = [
                'title', 'company', 'department', 'location', 'description', 
                'requirements', 'experience_level', 'employment_type', 
                'min_experience_years', 'status'
            ]
            writer.writerow(headers)
            
            # Write sample data
            sample_data = [
                'Python Backend Developer',
                'Tech Corp',
                'Engineering',
                'Remote',
                'We are looking for a passionate Python Backend Developer to design and implement backend systems that power our scalable web applications.',
                '3+ years of experience with Python\nStrong knowledge of Django or FastAPI\nExperience with PostgreSQL or other RDBMS',
                'mid',
                'full_time',
                '3',
                'active'
            ]
            writer.writerow(sample_data)
            
            # Create response
            response = HttpResponse(
                output.getvalue(),
                content_type='text/csv'
            )
            response['Content-Disposition'] = 'attachment; filename="job_template.csv"'
            
            return response

        except Exception as e:
            return Response(
                {'error': f'Template download failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ResumeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Resumes.
    Includes custom actions for matching with job descriptions and file processing.
    """
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    ordering = ['-uploaded_at']

    def create(self, request, *args, **kwargs):
        """Override to handle file upload and text extraction."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Extract text from uploaded file
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            parsed_text = extract_text_from_file(file_obj)
            processed_text = preprocess_text(parsed_text)
            extracted_skills = extract_skills_from_text(parsed_text)
            
            # Save resume with extracted information
            resume_instance = serializer.save(
                parsed_text=parsed_text,
                processed_text=processed_text,
                extracted_skills=extracted_skills,
                processing_status='completed',
                processed_at=timezone.now()
            )
            
            # Auto-populate candidate skills from resume
            candidate = resume_instance.candidate
            if extracted_skills:
                current_skills = set(candidate.skills or [])
                resume_skills_lower = set(skill.lower() for skill in extracted_skills)
                current_skills_lower = set(skill.lower() for skill in current_skills)
                new_skills = []
                for skill in extracted_skills:
                    if skill.lower() not in current_skills_lower:
                        new_skills.append(skill)
                
                # Update candidate skills with new skills from resume
                if new_skills:
                    updated_skills = list(current_skills) + new_skills
                    candidate.skills = updated_skills
                    candidate.save()
            
            # Return the created resume
            response_serializer = self.get_serializer(resume_instance)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': f'Error processing file: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'], url_path='matches')
    def get_matches_for_resume(self, request, pk=None):
        """
        Get existing matches for a specific resume (read-only).
        Returns existing match results without recalculating.
        """
        resume = self.get_object()
        
        # Get existing matches for this resume
        existing_matches = Match.objects.filter(resume=resume).select_related('job_description')
        
        matches = []
        for match in existing_matches:
            matches.append({
                'job_description_id': match.job_description.id,
                'job_title': match.job_description.title,
                'company': match.job_description.company,
                'department': match.job_description.department,
                'match_score': float(match.overall_score),
                'match_id': match.id,
                'is_high_match': match.overall_score >= 80,
                'is_medium_match': 60 <= match.overall_score < 80,
                'is_low_match': match.overall_score < 60,
                'matched_at': match.matched_at,
            })
        
        # Sort by score (highest first)
        matches.sort(key=lambda x: x['match_score'], reverse=True)
        
        return Response({
            'resume': {
                'id': resume.id,
                'candidate_name': resume.candidate.full_name,
                'candidate_email': resume.candidate.email,
            },
            'total_jobs_matched': len(matches),
            'high_matches': len([m for m in matches if m['is_high_match']]),
            'medium_matches': len([m for m in matches if m['is_medium_match']]),
            'low_matches': len([m for m in matches if m['is_low_match']]),
            'matches': matches,
            'note': 'These are existing matches. Use POST /match-with-jd/ to recalculate with a specific job.'
        })

    @action(detail=True, methods=['post'], url_path='match-with-jd')
    def match_with_jd(self, request, pk=None):
        """
        Match a specific resume with a job description.
        Requires job_description_id in request body.
        """
        resume = self.get_object()
        job_description_id = request.data.get('job_description_id')
        
        if not job_description_id:
            return Response(
                {"detail": "A 'job_description_id' is required in the request body to perform matching."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            job_description = JobDescription.objects.get(id=job_description_id)
        except JobDescription.DoesNotExist:
            return Response(
                {"detail": f"Job Description with id {job_description_id} does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Use candidate skills for matching
        candidate_skills = resume.candidate.skills or []
        jd_skills = job_description.extracted_skills or []
        
        if candidate_skills and jd_skills:
            similarity_score = calculate_skill_based_similarity(jd_skills, candidate_skills) / 100.0
        else:
            # Fallback to text-based matching if skills not available
            resume_processed = resume.processed_text if resume.processed_text else preprocess_text(resume.parsed_text)
            similarity_score = calculate_ats_similarity(resume_processed, job_description.processed_text)
        
        # Convert to percentage
        overall_score = round(similarity_score * 100, 2)
        
        # Create or update match
        match, created = Match.objects.get_or_create(
            job_description=job_description,
            resume=resume,
            defaults={
                'overall_score': overall_score,
                'skill_score': overall_score,
                'experience_score': 0,
                'technical_score': 0,
                'semantic_score': 0,
                'education_score': 0,
            }
        )
        
        if not created:
            match.overall_score = overall_score
            match.skill_score = overall_score
            match.save()
        
        return Response({
            'resume_id': resume.id,
            'candidate_name': resume.candidate.full_name,
            'candidate_email': resume.candidate.email,
            'job_description_id': job_description.id,
            'job_title': job_description.title,
            'company': job_description.company,
            'department': job_description.department,
            'match_score': overall_score,
            'match_id': match.id,
            'is_high_match': overall_score >= 80,
            'is_medium_match': 60 <= overall_score < 80,
            'is_low_match': overall_score < 60,
            'matched_skills': match.matched_skills,
            'missing_skills': match.missing_skills,
        })

class CandidateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Candidates.
    Includes custom actions for skill management.
    """
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer
    ordering = ['-created_at']

    @action(detail=True, methods=['post'], url_path='manage-skills')
    def manage_skills(self, request, pk=None):
        """
        Custom action to add or remove skills for a candidate.
        Allows candidates to manage their skill profile after auto-population from resume.
        """
        candidate = self.get_object()
        action_type = request.data.get('action')
        skills = request.data.get('skills', [])
        
        if not action_type or action_type not in ['add', 'remove']:
            return Response(
                {'error': 'Action must be either "add" or "remove"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not skills or not isinstance(skills, list):
            return Response(
                {'error': 'Skills must be a non-empty list'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        current_skills = list(candidate.skills or [])
        
        if action_type == 'add':
            # Add new skills (avoid duplicates)
            current_skills_lower = [skill.lower() for skill in current_skills]
            for skill in skills:
                if skill.lower() not in current_skills_lower:
                    current_skills.append(skill)
            
            candidate.skills = current_skills
            candidate.save()
            
            return Response({
                'message': f'Successfully added {len(skills)} skill(s)',
                'total_skills': len(current_skills),
                'skills': current_skills
            })
        
        elif action_type == 'remove':
            # Remove specified skills
            current_skills_lower = [skill.lower() for skill in current_skills]
            skills_to_remove_lower = [skill.lower() for skill in skills]
            
            # Keep skills that are not in the removal list
            updated_skills = [
                skill for skill in current_skills 
                if skill.lower() not in skills_to_remove_lower
            ]
            
            candidate.skills = updated_skills
            candidate.save()
            
            return Response({
                'message': f'Successfully removed {len(skills)} skill(s)',
                'total_skills': len(updated_skills),
                'skills': updated_skills
            })

    @action(detail=True, methods=['get'], url_path='skills')
    def get_skills(self, request, pk=None):
        """
        Get all skills for a candidate.
        """
        candidate = self.get_object()
        return Response({
            'candidate_id': candidate.candidate_id,
            'candidate_name': candidate.full_name,
            'skills': candidate.skills or [],
            'total_skills': len(candidate.skills or [])
        })

class MatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Matches.
    """
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    ordering = ['-overall_score']
    
    def list(self, request, *args, **kwargs):
        """
        List matches with optional filtering by job_description_id and resume_id.
        """
        queryset = self.get_queryset()
        
        # Filter by job description ID
        job_description_id = request.query_params.get('job_description_id')
        if job_description_id:
            queryset = queryset.filter(job_description_id=job_description_id)
        
        # Filter by resume ID
        resume_id = request.query_params.get('resume_id')
        if resume_id:
            queryset = queryset.filter(resume_id=resume_id)
        
        # Filter by score range
        min_score = request.query_params.get('min_score')
        if min_score:
            queryset = queryset.filter(overall_score__gte=float(min_score))
        
        max_score = request.query_params.get('max_score')
        if max_score:
            queryset = queryset.filter(overall_score__lte=float(max_score))
        
        # Apply ordering
        queryset = queryset.order_by('-overall_score')
        
        # Serialize the filtered queryset
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class ApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Applications.
    Includes analytics and conversion tracking.
    """
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer
    ordering = ['-applied_at']

    @action(detail=False, methods=['get'], url_path='analytics')
    def analytics(self, request):
        """
        Get comprehensive analytics about applications and conversions.
        """
        # Get date range from query parameters
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Filter applications by date range
        recent_applications = Application.objects.filter(applied_at__gte=start_date)
        
        # Calculate key metrics
        total_applications = recent_applications.count()
        ats_match_applications = recent_applications.filter(source='ats_match').count()
        direct_applications = recent_applications.filter(source='direct_apply').count()
        
        # Conversion rates
        conversion_rate = 0
        if Match.objects.filter(matched_at__gte=start_date).count() > 0:
            conversion_rate = (ats_match_applications / Match.objects.filter(matched_at__gte=start_date).count()) * 100
        
        # Status breakdown
        status_breakdown = recent_applications.values('status').annotate(count=Count('id'))
        
        # Source breakdown
        source_breakdown = recent_applications.values('source').annotate(count=Count('id'))
        
        # Average time to application (for ATS matches)
        avg_time_to_application = None
        ats_applications_with_match = recent_applications.filter(
            source='ats_match', 
            match__isnull=False
        )
        if ats_applications_with_match.exists():
            time_diffs = []
            for app in ats_applications_with_match:
                if app.match:
                    time_diff = (app.applied_at - app.match.matched_at).days
                    time_diffs.append(time_diff)
            if time_diffs:
                avg_time_to_application = sum(time_diffs) / len(time_diffs)
        
        return Response({
            'period': f'Last {days} days',
            'total_applications': total_applications,
            'ats_match_applications': ats_match_applications,
            'direct_applications': direct_applications,
            'conversion_rate': round(conversion_rate, 2),
            'avg_time_to_application_days': round(avg_time_to_application, 1) if avg_time_to_application else None,
            'status_breakdown': list(status_breakdown),
            'source_breakdown': list(source_breakdown),
        })

    @action(detail=True, methods=['post'], url_path='update-status')
    def update_status(self, request, pk=None):
        """
        Update application status with additional tracking.
        """
        application = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status and relevant timestamps
        application.status = new_status
        
        if new_status == 'shortlisted' and not application.is_shortlisted:
            application.is_shortlisted = True
            application.shortlisted_at = timezone.now()
        elif new_status == 'interviewed' and not application.is_interviewed:
            application.is_interviewed = True
            application.interviewed_at = timezone.now()
            application.interview_rounds += 1
        elif new_status == 'offer_made':
            application.offer_made_at = timezone.now()
        elif new_status == 'offer_accepted':
            application.offer_accepted_at = timezone.now()
        elif new_status == 'rejected':
            application.rejected_at = timezone.now()
        
        # Update notes based on user role
        user_role = request.data.get('user_role', 'recruiter')
        if user_role == 'recruiter':
            application.recruiter_notes = notes
        elif user_role == 'hiring_manager':
            application.hiring_manager_notes = notes
        elif user_role == 'candidate':
            application.candidate_notes = notes
        
        application.save()
        
        return Response({
            'message': f'Application status updated to {new_status}',
            'application_id': application.application_id,
            'status': application.status,
            'updated_at': application.status_updated_at
        })

    @action(detail=False, methods=['get'], url_path='conversion-metrics')
    def conversion_metrics(self, request):
        """
        Get detailed conversion metrics from matches to applications.
        """
        days = int(request.query_params.get('days', 30))
        start_date = timezone.now() - timedelta(days=days)
        
        # Get all matches in the period
        recent_matches = Match.objects.filter(matched_at__gte=start_date)
        total_matches = recent_matches.count()
        
        # Get applications from matches
        match_applications = Application.objects.filter(
            source='ats_match',
            match__in=recent_matches
        )
        
        # Calculate conversion metrics
        high_match_applications = match_applications.filter(match__overall_score__gte=80).count()
        medium_match_applications = match_applications.filter(
            match__overall_score__gte=60, 
            match__overall_score__lt=80
        ).count()
        low_match_applications = match_applications.filter(match__overall_score__lt=60).count()
        
        # Conversion rates by match quality
        high_matches = recent_matches.filter(overall_score__gte=80).count()
        medium_matches = recent_matches.filter(overall_score__gte=60, overall_score__lt=80).count()
        low_matches = recent_matches.filter(overall_score__lt=60).count()
        
        high_conversion_rate = (high_match_applications / high_matches * 100) if high_matches > 0 else 0
        medium_conversion_rate = (medium_match_applications / medium_matches * 100) if medium_matches > 0 else 0
        low_conversion_rate = (low_match_applications / low_matches * 100) if low_matches > 0 else 0
        
        return Response({
            'period': f'Last {days} days',
            'total_matches': total_matches,
            'total_applications_from_matches': match_applications.count(),
            'overall_conversion_rate': round((match_applications.count() / total_matches * 100), 2) if total_matches > 0 else 0,
            'conversion_by_match_quality': {
                'high_matches': {
                    'total': high_matches,
                    'applications': high_match_applications,
                    'conversion_rate': round(high_conversion_rate, 2)
                },
                'medium_matches': {
                    'total': medium_matches,
                    'applications': medium_match_applications,
                    'conversion_rate': round(medium_conversion_rate, 2)
                },
                'low_matches': {
                    'total': low_matches,
                    'applications': low_match_applications,
                    'conversion_rate': round(low_conversion_rate, 2)
                }
            }
        })

class CandidatePortalViewSet(viewsets.ViewSet):
    """
    ViewSet for candidate portal functionality.
    Handles job browsing, application submission, and profile management.
    """
    
    @action(detail=False, methods=['get'], url_path='browse-jobs')
    def browse_jobs(self, request):
        """
        Browse available jobs with filtering and search capabilities.
        Includes ATS match scores for the candidate.
        Now supports filtering by minimum match score (50%+ by default).
        """
        # Get query parameters
        search = request.query_params.get('search', '')
        location = request.query_params.get('location', '')
        experience = request.query_params.get('experience', '')
        skills = request.query_params.get('skills', '')
        candidate_id = request.query_params.get('candidate_id')
        min_match_score = request.query_params.get('min_match_score', '50')  # Default 50%
        show_only_matches = request.query_params.get('show_only_matches', 'true').lower() == 'true'  # Default true
        
        # Start with active jobs only
        queryset = JobDescription.objects.filter(status='active')
        
        # Apply search filter
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(company__icontains=search) |
                Q(department__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Apply location filter
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Apply experience filter
        if experience:
            try:
                experience_years = int(experience)
                queryset = queryset.filter(min_experience_years__lte=experience_years)
            except ValueError:
                pass
        
        # Apply skills filter
        if skills:
            skill_list = [skill.strip() for skill in skills.split(',')]
            for skill in skill_list:
                queryset = queryset.filter(extracted_skills__contains=[skill])
        
        # Serialize jobs
        serializer = JobDescriptionSerializer(queryset, many=True)
        jobs_data = serializer.data
        
        # Calculate match scores if candidate_id is provided or user is authenticated
        candidate = None
        if candidate_id:
            try:
                # First try to get by ID (for backward compatibility)
                try:
                    candidate = Candidate.objects.get(id=candidate_id)
                except Candidate.DoesNotExist:
                    # If not found by ID, try to find by email (for authenticated users)
                    # This handles the case where the frontend sends a hardcoded ID
                    # but we need to find the actual candidate record for the logged-in user
                    if request.user and request.user.is_authenticated:
                        candidate = Candidate.objects.get(email=request.user.email)
                    else:
                        raise Candidate.DoesNotExist
            except Candidate.DoesNotExist:
                pass
        elif request.user and request.user.is_authenticated and request.user.role == 'candidate':
            # If no candidate_id provided but user is authenticated as candidate
            try:
                candidate = Candidate.objects.get(email=request.user.email)
            except Candidate.DoesNotExist:
                pass
        # Calculate match scores if we found a candidate
        if candidate:
            try:
                # Get candidate's latest resume
                try:
                    resume = candidate.resumes.latest('uploaded_at')
                    candidate_skills = resume.extracted_skills or candidate.skills or []
                    candidate_experience = candidate.total_experience_years or 0
                    candidate_education = candidate.highest_education or ''
                    
                    for job_data in jobs_data:
                        # Calculate match score
                        match_score = self._calculate_match_score(
                            job_data, 
                            candidate_skills, 
                            candidate_experience, 
                            candidate_education
                        )
                        job_data['match_score'] = match_score
                        job_data['match_level'] = self._get_match_level(match_score)
                        
                except Resume.DoesNotExist:
                    # No resume, use candidate skills only
                    candidate_skills = candidate.skills or []
                    candidate_experience = candidate.total_experience_years or 0
                    candidate_education = candidate.highest_education or ''
                    
                    for job_data in jobs_data:
                        match_score = self._calculate_match_score(
                            job_data, 
                            candidate_skills, 
                            candidate_experience, 
                            candidate_education
                        )
                        job_data['match_score'] = match_score
                        job_data['match_level'] = self._get_match_level(match_score)
                        
            except Exception as e:
                print(f"Error calculating match scores: {e}")
                # Return jobs without match scores on error
                for job_data in jobs_data:
                    job_data['match_score'] = None
                    job_data['match_level'] = None
        else:
            # No candidate found, return jobs without match scores
            for job_data in jobs_data:
                job_data['match_score'] = None
                job_data['match_level'] = None
        
        # Filter jobs by minimum match score if enabled and we have a candidate
        if show_only_matches and candidate and min_match_score:
            try:
                min_score = float(min_match_score)
                filtered_jobs = []
                for job_data in jobs_data:
                    if job_data.get('match_score') is not None and job_data['match_score'] >= min_score:
                        filtered_jobs.append(job_data)
                jobs_data = filtered_jobs
            except ValueError:
                # Invalid min_match_score, return all jobs
                pass
        
        return Response({
            'jobs': jobs_data,
            'total_count': len(jobs_data),
            'total_available': queryset.count(),
            'filters_applied': {
                'search': search,
                'location': location,
                'experience': experience,
                'skills': skills,
                'candidate_id': candidate_id,
                'min_match_score': min_match_score,
                'show_only_matches': show_only_matches
            }
        })
    
    def _calculate_match_score(self, job_data, candidate_skills, candidate_experience, candidate_education):
        """
        Calculate ATS match score between candidate and job.
        Returns a score between 0 and 100.
        """
        try:
            # Skill matching (40% weight)
            job_skills = job_data.get('extracted_skills', [])
            if job_skills and candidate_skills:
                # Convert to lowercase for comparison
                job_skills_lower = [skill.lower() for skill in job_skills]
                candidate_skills_lower = [skill.lower() for skill in candidate_skills]
                
                # Find matching skills
                matching_skills = set(job_skills_lower) & set(candidate_skills_lower)
                skill_score = (len(matching_skills) / len(job_skills_lower)) * 100 if job_skills_lower else 0
            else:
                skill_score = 0
            
            # Experience matching (30% weight)
            job_experience = job_data.get('min_experience_years', 0)
            if candidate_experience >= job_experience:
                experience_score = 100
            elif candidate_experience > 0:
                experience_score = min(100, (candidate_experience / job_experience) * 100)
            else:
                experience_score = 0
            
            # Education matching (20% weight)
            education_score = 0
            job_education = job_data.get('experience_level', '')
            if candidate_education:
                education_mapping = {
                    'high_school': 25,
                    'associate': 50,
                    'bachelor': 75,
                    'master': 90,
                    'phd': 100
                }
                candidate_education_score = education_mapping.get(candidate_education, 0)
                
                if job_education == 'entry':
                    education_score = min(100, candidate_education_score)
                elif job_education == 'junior':
                    education_score = min(100, candidate_education_score * 1.1)
                elif job_education == 'mid':
                    education_score = min(100, candidate_education_score * 1.2)
                elif job_education == 'senior':
                    education_score = min(100, candidate_education_score * 1.3)
                elif job_education == 'lead':
                    education_score = min(100, candidate_education_score * 1.4)
                else:
                    education_score = candidate_education_score
            
            # Location matching (10% weight)
            location_score = 100  # Default to 100, can be enhanced with location matching
            
            # Calculate weighted average
            total_score = (
                (skill_score * 0.4) +
                (experience_score * 0.3) +
                (education_score * 0.2) +
                (location_score * 0.1)
            )
            
            return round(total_score, 1)
            
        except Exception as e:
            print(f"Error calculating match score: {e}")
            return 0
    
    def _get_match_level(self, score):
        """Get match level based on score."""
        if score is None:
            return None
        elif score >= 80:
            return 'excellent'
        elif score >= 60:
            return 'good'
        elif score >= 40:
            return 'fair'
        else:
            return 'poor'
    
    @action(detail=False, methods=['post'], url_path='apply-job')
    def apply_job(self, request):
        """
        Submit a job application.
        """
        job_id = request.data.get('job_id')
        candidate_id = request.data.get('candidate_id')
        cover_letter = request.data.get('cover_letter', '')
        expected_salary = request.data.get('expected_salary')
        source = request.data.get('source', 'direct_apply')
        
        if not job_id:
            return Response({
                'error': 'job_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find candidate by ID or by authenticated user's email
        candidate = None
        if candidate_id:
            try:
                candidate = Candidate.objects.get(id=candidate_id)
            except Candidate.DoesNotExist:
                pass
        
        # If no candidate found by ID or no ID provided, try to find by authenticated user's email
        if not candidate and request.user and request.user.is_authenticated:
            try:
                candidate = Candidate.objects.get(email=request.user.email)
            except Candidate.DoesNotExist:
                return Response({
                    'error': 'Candidate profile not found. Please complete your profile first.'
                }, status=status.HTTP_404_NOT_FOUND)
        
        if not candidate:
            return Response({
                'error': 'Candidate not found. Please provide candidate_id or ensure you are logged in.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            job = JobDescription.objects.get(id=job_id, status='active')
        except JobDescription.DoesNotExist:
            return Response({
                'error': 'Job not found or not active'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Check if application already exists
        existing_application = Application.objects.filter(
            job_description=job,
            candidate=candidate
        ).first()
        
        if existing_application:
            return Response({
                'error': 'Application already exists for this job',
                'application_id': existing_application.application_id
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new application
        application_data = {
            'job_description': job,
            'candidate': candidate,
            'cover_letter': cover_letter,
            'source': source,
            'status': 'applied'
        }
        
        if expected_salary:
            application_data['expected_salary'] = expected_salary
        
        application = Application.objects.create(**application_data)
        
        # Try to find existing match
        try:
            resume = candidate.resumes.latest('uploaded_at')
            match = Match.objects.filter(
                job_description=job,
                resume=resume
            ).first()
            
            if match:
                application.match = match
                application.save()
        except Resume.DoesNotExist:
            pass
        
        serializer = ApplicationSerializer(application)
        return Response({
            'message': 'Application submitted successfully',
            'application': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], url_path='my-applications')
    def my_applications(self, request):
        """
        Get applications for a specific candidate.
        """
        candidate_id = request.query_params.get('candidate_id')
        
        # Find candidate by ID or by authenticated user's email
        candidate = None
        if candidate_id:
            try:
                candidate = Candidate.objects.get(id=candidate_id)
            except Candidate.DoesNotExist:
                pass
        
        # If no candidate found by ID or no ID provided, try to find by authenticated user's email
        if not candidate and request.user and request.user.is_authenticated:
            try:
                candidate = Candidate.objects.get(email=request.user.email)
            except Candidate.DoesNotExist:
                return Response({
                    'error': 'Candidate profile not found. Please complete your profile first.'
                }, status=status.HTTP_404_NOT_FOUND)
        
        if not candidate:
            return Response({
                'error': 'Candidate not found. Please provide candidate_id or ensure you are logged in.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        applications = Application.objects.filter(candidate=candidate).select_related(
            'job_description'
        ).order_by('-applied_at')
        
        # Format applications for frontend
        formatted_applications = []
        for app in applications:
            # Create timeline based on status
            timeline = [
                {
                    'step': 'Application Submitted',
                    'date': app.applied_at.strftime('%Y-%m-%d'),
                    'completed': True
                }
            ]
            
            if app.status in ['under_review', 'shortlisted', 'interview_scheduled', 'interviewed', 'offer_made', 'offer_accepted']:
                timeline.append({
                    'step': 'Under Review',
                    'date': app.applied_at.strftime('%Y-%m-%d'),
                    'completed': True
                })
            
            if app.status in ['shortlisted', 'interview_scheduled', 'interviewed', 'offer_made', 'offer_accepted']:
                timeline.append({
                    'step': 'Shortlisted',
                    'date': app.shortlisted_at.strftime('%Y-%m-%d') if app.shortlisted_at else None,
                    'completed': True
                })
            
            if app.status in ['interview_scheduled', 'interviewed', 'offer_made', 'offer_accepted']:
                timeline.append({
                    'step': 'Interview Scheduled',
                    'date': None,  # Would need interview model for actual date
                    'completed': True
                })
            
            if app.status in ['interviewed', 'offer_made', 'offer_accepted']:
                timeline.append({
                    'step': 'Interviewed',
                    'date': app.interviewed_at.strftime('%Y-%m-%d') if app.interviewed_at else None,
                    'completed': True
                })
            
            if app.status in ['offer_made', 'offer_accepted']:
                timeline.append({
                    'step': 'Offer Made',
                    'date': app.offer_made_at.strftime('%Y-%m-%d') if app.offer_made_at else None,
                    'completed': True
                })
            
            if app.status == 'offer_accepted':
                timeline.append({
                    'step': 'Offer Accepted',
                    'date': app.offer_accepted_at.strftime('%Y-%m-%d') if app.offer_accepted_at else None,
                    'completed': True
                })
            
            if app.status == 'rejected':
                timeline.append({
                    'step': 'Application Closed',
                    'date': app.rejected_at.strftime('%Y-%m-%d') if app.rejected_at else None,
                    'completed': True
                })
            
            # Calculate match score if match exists
            match_score = None
            if app.match:
                match_score = float(app.match.overall_score)
            
            formatted_applications.append({
                'id': app.id,
                'jobTitle': app.job_description.title,
                'company': app.job_description.company,
                'appliedDate': app.applied_at.strftime('%Y-%m-%d'),
                'status': app.status,
                'statusDate': app.status_updated_at.strftime('%Y-%m-%d'),
                'matchScore': match_score,
                'nextStep': self._get_next_step(app.status),
                'timeline': timeline
            })
        
        return Response({
            'applications': formatted_applications,
            'total_count': len(formatted_applications)
        })
    
    def _get_next_step(self, status):
        """Helper method to determine next step based on current status."""
        status_steps = {
            'applied': 'Under Review',
            'under_review': 'Shortlisting Decision',
            'shortlisted': 'Interview Scheduling',
            'interview_scheduled': 'Interview Preparation',
            'interviewed': 'Final Decision',
            'offer_made': 'Offer Review',
            'offer_accepted': 'Onboarding',
            'offer_declined': 'Application Closed',
            'rejected': 'Application Closed',
            'withdrawn': 'Application Closed'
        }
        return status_steps.get(status, 'Application Processing')
    
    @action(detail=False, methods=['get'], url_path='job-details')
    def job_details(self, request):
        """
        Get detailed information about a specific job.
        """
        job_id = request.query_params.get('job_id')
        
        if not job_id:
            return Response({
                'error': 'job_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            job = JobDescription.objects.get(id=job_id, status='active')
        except JobDescription.DoesNotExist:
            return Response({
                'error': 'Job not found or not active'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = JobDescriptionSerializer(job)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='candidate-profile')
    def candidate_profile(self, request):
        """
        Get candidate profile information.
        """
        # Find candidate by authenticated user's email
        try:
            candidate = Candidate.objects.get(email=request.user.email)
        except Candidate.DoesNotExist:
            return Response({
                'error': 'Candidate profile not found. Please complete your profile first.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CandidateSerializer(candidate)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put'], url_path='update-profile')
    def update_profile(self, request):
        """
        Update candidate profile information.
        """
        # Find candidate by authenticated user's email
        try:
            candidate = Candidate.objects.get(email=request.user.email)
        except Candidate.DoesNotExist:
            return Response({
                'error': 'Candidate profile not found. Please complete your profile first.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Update candidate fields
        update_fields = [
            'first_name', 'last_name', 'email', 'phone', 'city', 'state', 'country',
            'current_title', 'current_company', 'total_experience_years',
            'highest_education', 'degree_field', 'skills'
        ]
        
        for field in update_fields:
            if field in request.data:
                setattr(candidate, field, request.data[field])
        
        candidate.save()
        
        serializer = CandidateSerializer(candidate)
        return Response({
            'message': 'Profile updated successfully',
            'profile': serializer.data
        })

    @action(detail=False, methods=['post'], url_path='upload-resume')
    def upload_resume(self, request):
        """
        Upload resume/CV for a candidate.
        """
        file_obj = request.FILES.get('resume_file')
        
        if not file_obj:
            return Response({
                'error': 'resume_file is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate file type
        allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
        file_extension = os.path.splitext(file_obj.name)[1].lower()
        if file_extension not in allowed_extensions:
            return Response({
                'error': f'File type not supported. Allowed types: {", ".join(allowed_extensions)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create candidate based on authenticated user
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Find or create Candidate based on user email
        try:
            candidate = Candidate.objects.get(email=user.email)
        except Candidate.DoesNotExist:
            # Create new candidate from user data
            candidate = Candidate.objects.create(
                first_name=user.first_name,
                last_name=user.last_name,
                email=user.email,
                phone=user.phone_number or '',
                status='active'
            )
        
        try:
            # Extract text from uploaded file
            parsed_text = extract_text_from_file(file_obj)
            processed_text = preprocess_text(parsed_text)
            extracted_skills = extract_skills_from_text(parsed_text)
            
            # Create resume instance
            resume_data = {
                'candidate': candidate,
                'file': file_obj,
                'file_name': file_obj.name,
                'file_type': file_extension[1:],  # Remove the dot
                'parsed_text': parsed_text,
                'processed_text': processed_text,
                'extracted_skills': extracted_skills,
                'processing_status': 'completed',
                'processed_at': timezone.now()
            }
            
            resume = Resume.objects.create(**resume_data)
            
            # Auto-populate candidate skills from resume
            if extracted_skills:
                current_skills = set(candidate.skills or [])
                resume_skills_lower = set(skill.lower() for skill in extracted_skills)
                current_skills_lower = set(skill.lower() for skill in current_skills)
                new_skills = []
                for skill in extracted_skills:
                    if skill.lower() not in current_skills_lower:
                        new_skills.append(skill)
                
                # Update candidate skills with new skills from resume
                if new_skills:
                    updated_skills = list(current_skills) + new_skills
                    candidate.skills = updated_skills
                    candidate.save()
            
            # Return success response
            return Response({
                'message': 'Resume uploaded successfully',
                'resume': {
                    'id': resume.id,
                    'file_name': resume.file_name,
                    'file_type': resume.file_type,
                    'uploaded_at': resume.uploaded_at,
                    'processing_status': resume.processing_status,
                    'extracted_skills': resume.extracted_skills,
                    'skills_added_to_profile': new_skills if 'new_skills' in locals() else []
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Error processing resume: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='my-resumes')
    def my_resumes(self, request):
        """
        Get all resumes for the authenticated user.
        """
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Authentication required'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Find candidate based on user email
        try:
            candidate = Candidate.objects.get(email=user.email)
        except Candidate.DoesNotExist:
            # Return empty result if no candidate profile exists yet
            return Response({
                'resumes': [],
                'total_count': 0
            })
        
        resumes = Resume.objects.filter(candidate=candidate).order_by('-uploaded_at')
        
        resume_data = []
        for resume in resumes:
            resume_data.append({
                'id': resume.id,
                'file_name': resume.file_name,
                'file_type': resume.file_type,
                'uploaded_at': resume.uploaded_at.strftime('%Y-%m-%d %H:%M'),
                'processing_status': resume.processing_status,
                'extracted_skills': resume.extracted_skills,
                'file_size': resume.file.size if resume.file else 0
            })
        
        return Response({
            'resumes': resume_data,
            'total_count': len(resume_data)
        })

    @action(detail=False, methods=['delete'], url_path='delete-resume')
    def delete_resume(self, request):
        """
        Delete a resume for a candidate.
        """
        resume_id = request.data.get('resume_id')
        candidate_id = request.data.get('candidate_id')
        
        if not resume_id or not candidate_id:
            return Response({
                'error': 'resume_id and candidate_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            candidate = Candidate.objects.get(id=candidate_id)
        except Candidate.DoesNotExist:
            return Response({
                'error': 'Candidate not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            resume = Resume.objects.get(id=resume_id, candidate=candidate)
        except Resume.DoesNotExist:
            return Response({
                'error': 'Resume not found or does not belong to this candidate'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Store resume info before deletion for response
        resume_info = {
            'id': resume.id,
            'file_name': resume.file_name,
            'uploaded_at': resume.uploaded_at.strftime('%Y-%m-%d %H:%M')
        }
        
        # Delete the resume
        resume.delete()
        
        return Response({
            'message': 'Resume deleted successfully',
            'deleted_resume': resume_info
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='analyze-resume')
    def analyze_resume(self, request):
        """
        Analyze candidate's resume against a provided job description.
        """
        job_description_text = request.data.get('job_description')
        
        if not job_description_text:
            return Response({
                'error': 'job_description is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find candidate by authenticated user's email
        try:
            candidate = Candidate.objects.get(email=request.user.email)
        except Candidate.DoesNotExist:
            return Response({
                'error': 'Candidate profile not found. Please complete your profile first.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get candidate's latest resume
        try:
            resume = Resume.objects.filter(candidate=candidate, processing_status='completed').latest('uploaded_at')
        except Resume.DoesNotExist:
            return Response({
                'error': 'No completed resume found. Please upload a resume first.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            # Extract skills from job description
            job_skills = extract_skills_from_text(job_description_text)
            logger.info(f"Extracted {len(job_skills)} skills from job description: {job_skills}")
            
            # Ensure job skills were extracted
            if not job_skills:
                return Response({
                    'error': 'Could not extract skills from the job description. Please provide a more detailed job description.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get candidate skills
            candidate_skills = candidate.skills or []
            logger.info(f"Candidate has {len(candidate_skills)} skills: {candidate_skills}")
            
            # Ensure candidate has skills
            if not candidate_skills:
                return Response({
                    'error': 'No skills found in your profile. Please upload a resume to extract skills first.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Calculate skills match
            matched_skills = [skill for skill in candidate_skills if skill.lower() in [js.lower() for js in job_skills]]
            missing_skills = [skill for skill in job_skills if skill.lower() not in [cs.lower() for cs in candidate_skills]]
            
            skills_score = (len(matched_skills) / len(job_skills)) * 100 if job_skills else 0
            
            # Calculate experience match (simplified)
            # Extract years of experience from job description (basic regex)
            import re
            experience_match = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)', job_description_text.lower())
            required_experience = int(experience_match[0]) if experience_match else 0
            candidate_experience = candidate.total_experience_years or 0
            
            experience_score = min(100, (candidate_experience / required_experience) * 100) if required_experience > 0 else 100
            
            # Calculate location match with remote job detection
            job_description_lower = job_description_text.lower()
            remote_keywords = ['remote', 'work from home', 'wfh', 'virtual', 'telecommute', 'distributed']
            
            # Check if job is remote
            is_remote_job = any(keyword in job_description_lower for keyword in remote_keywords)
            
            if is_remote_job:
                location_score = 100  # Perfect match for remote jobs
                job_location_type = 'Remote'
            else:
                location_score = 80  # Default score for non-remote jobs
                job_location_type = 'On-site/Hybrid'
            
            # Calculate overall score
            overall_score = (skills_score * 0.6) + (experience_score * 0.3) + (location_score * 0.1)
            
            # Generate recommendations
            recommendations = []
            if missing_skills:
                recommendations.append(f"Add {', '.join(missing_skills[:3])} to your skills")
            if candidate_experience < required_experience:
                recommendations.append(f"Consider gaining more experience (you have {candidate_experience} years, job requires {required_experience}+ years)")
            if skills_score < 50:
                recommendations.append("Focus on developing skills that match the job requirements")
            if overall_score < 60:
                recommendations.append("Consider applying to jobs that better match your current profile")
            
            if not recommendations:
                recommendations.append("Your profile looks great for this position!")
            
            result = {
                'overall_score': round(overall_score, 1),
                'skills_match': {
                    'score': round(skills_score, 1),
                    'matched': matched_skills,
                    'missing': missing_skills,
                    'total': len(job_skills)
                },
                'experience_match': {
                    'score': round(experience_score, 1),
                    'required': required_experience,
                    'candidate': candidate_experience,
                    'match': 'Good' if experience_score >= 80 else 'Fair' if experience_score >= 60 else 'Poor'
                },
                'location_match': {
                    'score': location_score,
                    'candidate': f"{candidate.city or ''}, {candidate.state or ''}, {candidate.country or ''}".strip(', ') or 'Not specified',
                    'job': job_location_type
                },
                'recommendations': recommendations
            }
            
            return Response(result, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error analyzing resume: {str(e)}")
            return Response({
                'error': f'Failed to analyze resume: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def download_job_template(request):
    """
    Download CSV template for bulk job creation
    """
    try:
        # Create CSV content
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        headers = [
            'title', 'company', 'department', 'location', 'description', 
            'requirements', 'experience_level', 'employment_type', 
            'min_experience_years', 'status'
        ]
        writer.writerow(headers)
        
        # Write sample data
        sample_data = [
            'Python Backend Developer',
            'Tech Corp',
            'Engineering',
            'Remote',
            'We are looking for a passionate Python Backend Developer to design and implement backend systems that power our scalable web applications.',
            '3+ years of experience with Python\nStrong knowledge of Django or FastAPI\nExperience with PostgreSQL or other RDBMS',
            'mid',
            'full_time',
            '3',
            'active'
        ]
        writer.writerow(sample_data)
        
        # Create response
        response = HttpResponse(
            output.getvalue(),
            content_type='text/csv'
        )
        response['Content-Disposition'] = 'attachment; filename="job_template.csv"'
        
        return response

    except Exception as e:
        return Response(
            {'error': f'Template download failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def bulk_upload_jobs(request):
    """
    Bulk create job descriptions from CSV/Excel file
    """
    # Log request details
    logger.info(f"Bulk upload request received from user: {request.user.username}")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request content type: {request.content_type}")
    logger.info(f"Request headers: {dict(request.headers)}")
    
    try:
        # Log files in request
        logger.info(f"Files in request: {list(request.FILES.keys())}")
        
        if 'file' not in request.FILES:
            logger.error("No file provided in request")
            logger.error(f"Available files: {list(request.FILES.keys())}")
            return Response(
                {'error': 'No file provided. Please upload a CSV or Excel file with the required columns.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        file = request.FILES['file']
        logger.info(f"File received: {file.name}")
        logger.info(f"File size: {file.size} bytes")
        logger.info(f"File content type: {file.content_type}")
        
        # Validate file type
        logger.info(f"Validating file type for: {file.name}")
        if not file.name.endswith(('.csv', '.xlsx', '.xls')):
            logger.error(f"Invalid file type: {file.name}")
            logger.error(f"Supported formats: .csv, .xlsx, .xls")
            return Response(
                {
                    'error': 'Invalid file type. Please upload CSV or Excel file.',
                    'supported_formats': ['CSV (.csv)', 'Excel (.xlsx, .xls)'],
                    'file_name': file.name
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Read file based on type
        logger.info(f"Attempting to read file: {file.name}")
        try:
            if file.name.endswith('.csv'):
                logger.info("Reading CSV file with pandas")
                df = pd.read_csv(file)
            else:
                logger.info("Reading Excel file with pandas")
                df = pd.read_excel(file)
            
            logger.info(f"File read successfully. Shape: {df.shape}")
            logger.info(f"Columns found: {list(df.columns)}")
            
        except Exception as e:
            logger.error(f"Failed to read file: {str(e)}")
            logger.error(f"File name: {file.name}")
            logger.error(f"File size: {file.size}")
            logger.error(f"Exception type: {type(e).__name__}")
            return Response(
                {
                    'error': f'Failed to read file: {str(e)}',
                    'file_name': file.name,
                    'file_size': file.size
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if file is empty
        logger.info(f"Checking if file is empty. Rows: {len(df)}")
        if df.empty:
            logger.error(f"File is empty: {file.name}")
            return Response(
                {
                    'error': 'The uploaded file is empty or contains no data.',
                    'file_name': file.name
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate required columns
        required_columns = ['title', 'company', 'department', 'description', 'requirements']
        logger.info(f"Required columns: {required_columns}")
        logger.info(f"Available columns: {list(df.columns)}")
        
        missing_columns = [col for col in required_columns if col not in df.columns]
        logger.info(f"Missing columns: {missing_columns}")
        
        if missing_columns:
            logger.error(f"Missing required columns: {missing_columns}")
            logger.error(f"Available columns: {list(df.columns)}")
            return Response(
                {
                    'error': f'Missing required columns: {", ".join(missing_columns)}',
                    'required_columns': required_columns,
                    'available_columns': list(df.columns),
                    'file_name': file.name,
                    'row_count': len(df)
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Process each row
        logger.info(f"Starting to process {len(df)} rows")
        success_count = 0
        failed_count = 0
        failed_jobs = []

        for index, row in df.iterrows():
            logger.info(f"Processing row {index + 1}: {row.get('title', 'No title')}")
            try:
                # Log row data for debugging
                logger.debug(f"Row {index + 1} data: {row.to_dict()}")
                
                # Prepare job data
                job_data = {
                    'job_id': f"JOB-{uuid.uuid4().hex[:8].upper()}",
                    'title': str(row['title']).strip(),
                    'company': str(row['company']).strip(),
                    'department': str(row['department']).strip(),
                    'location': str(row.get('location', '')).strip(),
                    'description': str(row['description']).strip(),
                    'requirements': str(row['requirements']).strip(),
                    'experience_level': str(row.get('experience_level', 'mid')).strip(),
                    'employment_type': str(row.get('employment_type', 'full_time')).strip(),
                    'min_experience_years': int(row.get('min_experience_years', 3)),
                    'status': str(row.get('status', 'active')).strip(),
                    'posted_date': datetime.now(),
                }

                logger.debug(f"Prepared job data for row {index + 1}: {job_data}")

                # Validate data
                if not job_data['title'] or not job_data['company'] or not job_data['description']:
                    logger.error(f"Validation failed for row {index + 1}: Missing required fields")
                    logger.error(f"Title: '{job_data['title']}', Company: '{job_data['company']}', Description: '{job_data['description'][:50]}...'")
                    raise ValidationError('Title, company, and description are required')

                # Create job description
                logger.info(f"Creating job description for row {index + 1}: {job_data['title']}")
                job = JobDescription.objects.create(**job_data)
                logger.info(f"Successfully created job with ID: {job.id}")
                
                success_count += 1

            except Exception as e:
                logger.error(f"Failed to process row {index + 1}: {str(e)}")
                logger.error(f"Exception type: {type(e).__name__}")
                failed_count += 1
                failed_jobs.append({
                    'row': index + 2,  # +2 because of 0-based index and header row
                    'error': str(e)
                })

        logger.info(f"Bulk upload processing completed. Success: {success_count}, Failed: {failed_count}")
        
        return Response({
            'message': f'Bulk upload completed. {success_count} jobs created successfully.',
            'success_count': success_count,
            'failed_count': failed_count,
            'failed_jobs': failed_jobs
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Unexpected error in bulk upload: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        logger.error(f"Exception traceback:", exc_info=True)
        return Response(
            {'error': f'Upload failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def debug_upload_request(request):
    """
    Debug endpoint to inspect upload request details
    """
    logger.info("=== DEBUG UPLOAD REQUEST ===")
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request content type: {request.content_type}")
    logger.info(f"Request user: {request.user.username}")
    logger.info(f"Request headers: {dict(request.headers)}")
    logger.info(f"Request body: {request.body[:500]}...")  # First 500 chars
    logger.info(f"Files in request: {list(request.FILES.keys())}")
    
    for key, file in request.FILES.items():
        logger.info(f"File '{key}': {file.name}, size: {file.size}, type: {file.content_type}")
    
    logger.info("=== END DEBUG ===")
    
    return Response({
        'message': 'Request details logged',
        'files_count': len(request.FILES),
        'file_names': list(request.FILES.keys()),
        'content_type': request.content_type,
        'method': request.method
    })