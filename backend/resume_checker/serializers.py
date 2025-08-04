# hiring_app/serializers.py
from rest_framework import serializers
from .models import JobDescription, Resume, Candidate, Match, Application

class JobDescriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for the JobDescription model.
    'processed_text' is read-only as it's generated internally.
    """
    class Meta:
        model = JobDescription
        fields = '__all__'
        read_only_fields = ('processed_text', 'created_at')

class CandidateSerializer(serializers.ModelSerializer):
    """
    Serializer for the Candidate model.
    """
    class Meta:
        model = Candidate
        fields = '__all__'

class ResumeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Resume model.
    'candidate_id' is used for input to link to a Candidate.
    'file' is a write-only field for file uploads.
    'parsed_text' is read-only as it's generated internally after file parsing.
    """
    # Use PrimaryKeyRelatedField to link a resume to an existing candidate by ID.
    # 'source='candidate'' maps it to the 'candidate' ForeignKey on the Resume model.
    # 'write_only=True' means this field is only for input, not output.
    candidate_id = serializers.PrimaryKeyRelatedField(
        queryset=Candidate.objects.all(),
        source='candidate',
        write_only=True,
        help_text="ID of the candidate this resume belongs to."
    )
    # FileField for uploading the resume file. 'write_only=True' as we don't return the file itself.
    file = serializers.FileField(
        write_only=True,
        help_text="Upload the resume file (PDF, DOCX, or TXT)."
    )

    class Meta:
        model = Resume
        # Include 'id' for referencing, 'uploaded_at' for context, and all processed fields for display
        fields = ['id', 'candidate_id', 'file', 'uploaded_at', 'parsed_text', 'processed_text', 'extracted_skills', 'processing_status']
        read_only_fields = ('parsed_text', 'processed_text', 'extracted_skills', 'uploaded_at') # Generated internally

class MatchSerializer(serializers.ModelSerializer):
    """
    Serializer for the Match model.
    Includes related JD title and candidate name for richer output.
    'score_percentage' is a custom field for user-friendly display.
    """
    # Read-only fields to display related information without requiring them for input
    job_description_title = serializers.CharField(source='job_description.title', read_only=True)
    candidate_name = serializers.CharField(source='resume.candidate.full_name', read_only=True)
    candidate_email = serializers.CharField(source='resume.candidate.email', read_only=True) # New: include email

    # Custom field to display the score as a percentage with 2 decimal places
    score_percentage = serializers.SerializerMethodField(
        help_text="Match score converted to a percentage (e.g., '85.23%')."
    )

    class Meta:
        model = Match
        # Define all fields to be included in the serialized output, including the new field
        fields = [
            'id', 'job_description', 'job_description_title',
            'resume', 'candidate_name', 'candidate_email', # Added candidate_email
            'overall_score', 'score_percentage',
            'is_invited_for_interview', 'matched_at' # Added is_invited_for_interview
        ]
        # 'overall_score' and 'matched_at' are set by the matching logic, 'is_invited_for_interview' can be updated
        read_only_fields = ('overall_score', 'matched_at')

    def get_score_percentage(self, obj):
        """
        Calculates and returns the match score as a formatted percentage string.
        """
        return f"{obj.overall_score:.2f}%"

class ApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Application model.
    Includes related information for comprehensive application tracking.
    """
    # Read-only fields for related information
    job_description_title = serializers.CharField(source='job_description.title', read_only=True)
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    match_score = serializers.CharField(source='match.overall_score', read_only=True)
    
    # Custom fields for better UX
    days_since_applied = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    conversion_from_match = serializers.ReadOnlyField()

    class Meta:
        model = Application
        fields = [
            'id', 'application_id', 'job_description', 'job_description_title',
            'candidate', 'candidate_name', 'candidate_email',
            'match', 'match_score', 'cover_letter', 'expected_salary', 'salary_currency',
            'status', 'source', 'is_shortlisted', 'is_interviewed', 'interview_rounds',
            'recruiter_notes', 'hiring_manager_notes', 'candidate_notes',
            'applied_at', 'status_updated_at', 'days_since_applied', 'is_active',
            'conversion_from_match'
        ]
        read_only_fields = ('application_id', 'applied_at', 'status_updated_at')

    def validate(self, data):
        """
        Custom validation for application data.
        """
        # Ensure candidate and job_description are provided
        if not data.get('candidate') and not data.get('job_description'):
            raise serializers.ValidationError("Both candidate and job description are required.")
        
        # Validate salary if provided
        expected_salary = data.get('expected_salary')
        if expected_salary is not None and expected_salary <= 0:
            raise serializers.ValidationError("Expected salary must be greater than 0.")
        
        return data

    def create(self, validated_data):
        """
        Custom create method to handle application creation logic.
        """
        # If this is an ATS match application, try to find the corresponding match
        if validated_data.get('source') == 'ats_match':
            job_description = validated_data.get('job_description')
            candidate = validated_data.get('candidate')
            
            # Try to find the best match for this candidate-job combination
            try:
                # Get the candidate's latest resume
                latest_resume = candidate.resumes.order_by('-uploaded_at').first()
                if latest_resume:
                    match = Match.objects.get(
                        job_description=job_description,
                        resume=latest_resume
                    )
                    validated_data['match'] = match
            except Match.DoesNotExist:
                # No match found, that's okay for direct applications
                pass
        
        return super().create(validated_data)