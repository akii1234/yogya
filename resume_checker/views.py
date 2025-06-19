from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import io

from .models import JobDescription, Resume, Candidate, Match
from .serializers import JobDescriptionSerializer, ResumeSerializer, CandidateSerializer, MatchSerializer
from .nlp_utils import (
    extract_text_from_pdf, extract_text_from_docx,
    preprocess_text, calculate_similarity # or calculate_semantic_similarity_spacy
)

class JobDescriptionViewSet(viewsets.ModelViewSet):
    queryset = JobDescription.objects.all()
    serializer_class = JobDescriptionSerializer

    def perform_create(self, serializer):
        # Preprocess JD description upon creation
        description = serializer.validated_data['description']
        processed_text = preprocess_text(description)
        serializer.save(processed_text=processed_text)

    def perform_update(self, serializer):
        # Re-preprocess JD description upon update
        description = serializer.validated_data.get('description', serializer.instance.description)
        processed_text = preprocess_text(description)
        serializer.save(processed_text=processed_text)


class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.all()
    serializer_class = CandidateSerializer


class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        candidate_id = serializer.validated_data.get('candidate').id
        file = serializer.validated_data.get('file')

        parsed_text = None
        if file:
            file_extension = file.name.split('.')[-1].lower()
            file_obj = io.BytesIO(file.read()) # Read file content into BytesIO for parsing

            if file_extension == 'pdf':
                parsed_text = extract_text_from_pdf(file_obj)
            elif file_extension == 'docx':
                parsed_text = extract_text_from_docx(file_obj)
            elif file_extension == 'txt':
                parsed_text = file_obj.read().decode('utf-8')
            else:
                return Response(
                    {"detail": "Unsupported file format. Only PDF, DOCX, and TXT are supported."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if not parsed_text:
            return Response(
                {"detail": "Could not extract text from the resume file."},
                status=status.HTTP_400_BAD_REQUEST
            )

        processed_text = preprocess_text(parsed_text)
        serializer.save(parsed_text=processed_text) # Save the processed text

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'])
    def match_with_jd(self, request, pk=None):
        """
        Matches a specific resume with a given Job Description.
        Requires 'job_description_id' in the request body.
        """
        resume = self.get_object()
        job_description_id = request.data.get('job_description_id')

        if not job_description_id:
            return Response(
                {"detail": "job_description_id is required in the request body."},
                status=status.HTTP_400_BAD_REQUEST
            )

        job_description = get_object_or_404(JobDescription, pk=job_description_id)

        if not resume.parsed_text or not job_description.processed_text:
            return Response(
                {"detail": "Resume or Job Description text not processed. Please ensure files are uploaded correctly and JDs are saved."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate similarity
        # Choose one of the similarity functions:
        similarity_score = calculate_similarity(resume.parsed_text, job_description.processed_text)
        # Or for semantic similarity (requires larger spacy model for best results):
        # similarity_score = calculate_semantic_similarity_spacy(resume.parsed_text, job_description.processed_text)

        # Convert to percentage and check against 60%
        match_percentage = similarity_score * 100

        # Store the match result
        match_instance, created = Match.objects.update_or_create(
            job_description=job_description,
            resume=resume,
            defaults={'score': similarity_score}
        )

        serializer = MatchSerializer(match_instance)

        response_data = {
            "resume": ResumeSerializer(resume).data,
            "job_description": JobDescriptionSerializer(job_description).data,
            "match_score": f"{match_percentage:.2f}%",
            "is_match": match_percentage >= 60,
            "match_details": serializer.data
        }

        return Response(response_data, status=status.HTTP_200_OK)


class MatchViewSet(viewsets.ReadOnlyModelViewSet): # Read-only as matches are generated
    queryset = Match.objects.all().order_by('-score') # Order by score descending
    serializer_class = MatchSerializer

    @action(detail=False, methods=['get'])
    def filter_by_jd(self, request):
        """
        Filters matches for a specific Job Description with score >= 60%.
        Requires 'job_description_id' as a query parameter.
        """
        job_description_id = request.query_params.get('job_description_id')

        if not job_description_id:
            return Response(
                {"detail": "job_description_id query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Ensure the JD exists
        get_object_or_404(JobDescription, pk=job_description_id)

        # Filter matches for the specific JD and score >= 0.60
        matches = Match.objects.filter(
            job_description_id=job_description_id,
            score__gte=0.60
        ).order_by('-score') # Order by score to show best matches first

        serializer = self.get_serializer(matches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)