# hiring_app/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action # For custom actions on viewsets
from rest_framework.response import Response # For custom API responses
from django.shortcuts import get_object_or_404 # Helper for retrieving objects or raising 404
import io # For handling file streams

from .models import JobDescription, Resume, Candidate, Match
from .serializers import JobDescriptionSerializer, ResumeSerializer, CandidateSerializer, MatchSerializer
from .nlp_utils import (
    extract_text_from_pdf,
    extract_text_from_docx,
    preprocess_text,
    calculate_similarity # Default similarity calculation using TF-IDF and Cosine Similarity
    # calculate_semantic_similarity_spacy # Uncomment if you want to use SpaCy for semantic similarity
)

class JobDescriptionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Job Descriptions to be viewed or edited.
    Automatically preprocesses the description text when created or updated.
    """
    queryset = JobDescription.objects.all().order_by('-uploaded_at') # Order by most recent
    serializer_class = JobDescriptionSerializer

    def perform_create(self, serializer):
        """
        Overrides the create method to preprocess the JD description before saving.
        """
        description = serializer.validated_data['description']
        processed_text = preprocess_text(description) # Call NLP utility for preprocessing
        serializer.save(processed_text=processed_text) # Save with the processed text

    def perform_update(self, serializer):
        """
        Overrides the update method to re-preprocess the JD description if it changes.
        """
        # Get the new description or keep the old one if not provided in the update
        description = serializer.validated_data.get('description', serializer.instance.description)
        processed_text = preprocess_text(description) # Re-preprocess
        serializer.save(processed_text=processed_text) # Save with updated processed text

    @action(detail=True, methods=['post'], url_path='match-all-resumes')
    def match_all_resumes_to_jd(self, request, pk=None):
        """
        Custom action to match ALL uploaded resumes against a specific Job Description.
        This will create or update Match records for all resumes.
        """
        job_description = self.get_object() # Get the JD based on the URL's pk

        if not job_description.processed_text:
            return Response(
                {"detail": "Job Description text not processed. Please ensure the JD is saved correctly."},
                status=status.HTTP_400_BAD_REQUEST
            )

        all_resumes = Resume.objects.all()
        results = []

        for resume in all_resumes:
            if not resume.parsed_text:
                results.append({
                    "resume_id": resume.id,
                    "candidate_name": resume.candidate.name,
                    "status": "Skipped",
                    "message": "Resume text not parsed. Uploaded resume file might be problematic."
                })
                continue # Skip if resume text is not parsed

            # Calculate similarity
            similarity_score = calculate_similarity(resume.parsed_text, job_description.processed_text)

            # Store or update the match result
            match_instance, created = Match.objects.update_or_create(
                job_description=job_description,
                resume=resume,
                defaults={'score': similarity_score}
            )
            
            results.append({
                "resume_id": resume.id,
                "candidate_name": resume.candidate.name,
                "job_description_id": job_description.id,
                "job_description_title": job_description.title,
                "match_score": f"{similarity_score * 100:.2f}%",
                "is_match_above_60_percent": similarity_score * 100 >= 60,
                "status": "Created" if created else "Updated"
            })
        
        return Response(results, status=status.HTTP_200_OK)


class CandidateViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Candidates to be viewed or edited.
    """
    queryset = Candidate.objects.all().order_by('name')
    serializer_class = CandidateSerializer


class ResumeViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Resumes to be uploaded, viewed, or deleted.
    Handles file parsing (PDF, DOCX, TXT) and preprocessing upon upload.
    Includes a custom action to match a resume against a job description.
    """
    queryset = Resume.objects.all().order_by('-uploaded_at') # Order by most recent
    serializer_class = ResumeSerializer

    def create(self, request, *args, **kwargs):
        """
        Custom create method to handle file upload, text extraction, and preprocessing.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True) # Validate input data

        # Extract file from validated data
        file = serializer.validated_data.get('file')
        
        parsed_text = None
        if file:
            # Determine file extension to call the correct parser
            file_extension = file.name.split('.')[-1].lower()
            # Read the file content into a BytesIO object for parsers
            file_obj = io.BytesIO(file.read())

            if file_extension == 'pdf':
                parsed_text = extract_text_from_pdf(file_obj)
            elif file_extension == 'docx':
                parsed_text = extract_text_from_docx(file_obj)
            elif file_extension == 'txt':
                # For .txt files, simply decode the content
                parsed_text = file_obj.read().decode('utf-8')
            else:
                # Return error for unsupported file types
                return Response(
                    {"detail": "Unsupported file format. Only PDF, DOCX, and TXT are supported."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if not parsed_text:
            # Return error if text extraction failed
            return Response(
                {"detail": "Could not extract text from the resume file. The file might be corrupted or empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Preprocess the extracted text
        processed_text = preprocess_text(parsed_text)
        # Save the resume instance with the processed text
        serializer.save(parsed_text=processed_text)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'], url_path='match') # Changed url_path from 'match-single-jd' to 'match'
    def match_with_jd(self, request, pk=None):
        """
        Custom action to match a specific resume (identified by pk)
        against a Job Description (identified by job_description_id in request body).
        """
        resume = self.get_object() # Get the resume instance based on the URL's pk

        job_description_id = request.data.get('job_description_id')
        if not job_description_id:
            return Response(
                {"detail": "A 'job_description_id' is required in the request body to perform matching."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Retrieve the Job Description or return a 404 error
        job_description = get_object_or_404(JobDescription, pk=job_description_id)

        # Ensure both resume and JD have processed text before attempting similarity
        if not resume.parsed_text or not job_description.processed_text:
            return Response(
                {"detail": "Resume or Job Description text not processed. Ensure files are uploaded correctly and JDs are saved and processed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # --- Calculate Similarity ---
        similarity_score = calculate_similarity(resume.parsed_text, job_description.processed_text)

        # Convert score to percentage
        match_percentage = similarity_score * 100

        # Store or update the match result in the database
        match_instance, created = Match.objects.update_or_create(
            job_description=job_description,
            resume=resume,
            defaults={'score': similarity_score} # Update score if match already exists
        )

        # Serialize the match instance for a detailed response
        match_serializer = MatchSerializer(match_instance)

        response_data = {
            "resume_id": resume.id,
            "job_description_id": job_description.id,
            "match_score": f"{match_percentage:.2f}%",
            "is_match_above_60_percent": match_percentage >= 60, # Check if score meets criteria
            "match_details": match_serializer.data # Include full match details
        }

        return Response(response_data, status=status.HTTP_200_OK)


class MatchViewSet(viewsets.ModelViewSet): # Changed to ModelViewSet to allow partial updates (for invite status)
    """
    API endpoint that allows Match records to be viewed and updated (e.g., invite status).
    Provides a custom action to filter matches by Job Description, showing all candidates.
    """
    queryset = Match.objects.all().order_by('-score') # Default ordering by highest score
    serializer_class = MatchSerializer

    # Allow PUT/PATCH for invite_for_interview action.
    # We still want to control creation/deletion of Match objects.
    http_method_names = ['get', 'patch'] # Only allow GET and PATCH on matches

    @action(detail=False, methods=['get'], url_path='all-for-jd')
    def all_for_jd(self, request):
        """
        Filters match results for a specific Job Description, showing ALL candidates
        (matched and not matched).
        Requires 'job_description_id' as a query parameter (e.g., ?job_description_id=1).
        """
        job_description_id = request.query_params.get('job_description_id')

        if not job_description_id:
            return Response(
                {"detail": "The 'job_description_id' query parameter is required to filter matches."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify that the Job Description exists
        job_description = get_object_or_404(JobDescription, pk=job_description_id)

        # Get all matches for this JD, ordered by score descending
        matches = Match.objects.filter(
            job_description=job_description
        ).order_by('-score')

        serializer = self.get_serializer(matches, many=True)
        
        # Optionally, you might want to identify resumes that haven't been matched yet
        # This requires a more complex query if you want to explicitly list "unmatched" resumes
        # that exist but have no Match entry for this specific JD.
        # For simplicity, this endpoint only returns existing Match entries.

        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='invite')
    def invite_for_interview(self, request, pk=None):
        """
        Marks a specific Match record as 'invited for interview'.
        Uses PATCH method to update a single field.
        """
        match_instance = self.get_object() # Get the Match instance based on the URL's pk

        # Update the 'is_invited_for_interview' field to True
        match_instance.is_invited_for_interview = True
        match_instance.save()

        serializer = self.get_serializer(match_instance)
        return Response(serializer.data, status=status.HTTP_200_OK)