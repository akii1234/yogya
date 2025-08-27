from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Interviewer, Interview
from .serializers import InterviewerSerializer, InterviewSerializer
from user_management.models import User


class InterviewerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing interview panel members.
    """
    queryset = Interviewer.objects.all()
    serializer_class = InterviewerSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all for testing
    
    def get_queryset(self):
        queryset = Interviewer.objects.select_related('user').all()
        
        # Filter by availability
        availability = self.request.query_params.get('availability', None)
        if availability:
            if availability == 'available':
                queryset = queryset.filter(is_active=True)
            elif availability == 'busy':
                queryset = queryset.filter(is_active=False)
        
        # Filter by competency/skills
        competency = self.request.query_params.get('competency', None)
        if competency:
            queryset = queryset.filter(
                Q(technical_skills__icontains=competency) |
                Q(department__icontains=competency) |
                Q(title__icontains=competency)
            )
        
        # Search by name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search) |
                Q(department__icontains=search) |
                Q(title__icontains=search)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get interviewer statistics"""
        total_interviewers = Interviewer.objects.count()
        available_interviewers = Interviewer.objects.filter(is_active=True).count()
        
        # Calculate average rating from interviews
        avg_rating = Interview.objects.filter(
            interviewer__isnull=False
        ).aggregate(Avg('overall_score'))['overall_score__avg'] or 0
        
        # Count interviews this week
        week_ago = timezone.now() - timedelta(days=7)
        interviews_this_week = Interview.objects.filter(
            created_at__gte=week_ago
        ).count()
        
        return Response({
            'total_interviewers': total_interviewers,
            'available_interviewers': available_interviewers,
            'average_rating': round(avg_rating, 1) if avg_rating else 0,
            'interviews_this_week': interviews_this_week
        })
    
    @action(detail=False, methods=['post'])
    def create_interviewer(self, request):
        """Create a new interviewer from user data"""
        try:
            # Extract user data
            user_data = request.data.get('user', {})
            interviewer_data = request.data.get('interviewer', {})
            
            # Create or get user
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'username': user_data.get('username', user_data['email']),
                    'first_name': user_data.get('first_name', ''),
                    'last_name': user_data.get('last_name', ''),
                    'role': 'interviewer',
                    'status': 'active'
                }
            )
            
            # Create interviewer profile
            interviewer = Interviewer.objects.create(
                user=user,
                company=interviewer_data.get('company', ''),
                department=interviewer_data.get('department', ''),
                title=interviewer_data.get('title', ''),
                phone=interviewer_data.get('phone', ''),
                technical_skills=interviewer_data.get('technical_skills', []),
                interview_types=interviewer_data.get('interview_types', []),
                experience_years=interviewer_data.get('experience_years', 0),
                is_active=interviewer_data.get('is_active', True),
                max_interviews_per_week=interviewer_data.get('max_interviews_per_week', 10)
            )
            
            serializer = self.get_serializer(interviewer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def interviews(self, request, pk=None):
        """Get interviews conducted by this interviewer"""
        interviewer = self.get_object()
        interviews = Interview.objects.filter(interviewer=interviewer).order_by('-created_at')
        serializer = InterviewSerializer(interviews, many=True)
        return Response(serializer.data)


class InterviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing interviews.
    """
    queryset = Interview.objects.all()
    serializer_class = InterviewSerializer
    permission_classes = [permissions.AllowAny]  # Temporarily allow all for testing
    
    def get_queryset(self):
        queryset = Interview.objects.select_related('interviewer__user', 'candidate', 'job_posting').all()
        
        # Filter by interviewer
        interviewer_id = self.request.query_params.get('interviewer', None)
        if interviewer_id:
            queryset = queryset.filter(interviewer_id=interviewer_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset.order_by('-created_at')
