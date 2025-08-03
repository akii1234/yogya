# hiring_app/serializers.py
from rest_framework import serializers
from .models import JobDescription, Resume, Candidate, Match

class JobDescriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for the JobDescription model.
    'processed_text' is read-only as it's generated internally.
    """
    class Meta:
        model = JobDescription
        fields = '__all__'
        read_only_fields = ('processed_text', 'uploaded_at')

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
        # Include 'id' for referencing, 'uploaded_at' for context, and 'parsed_text' for display
        fields = ['id', 'candidate_id', 'file', 'uploaded_at', 'parsed_text']
        read_only_fields = ('parsed_text', 'uploaded_at') # Generated internally

class MatchSerializer(serializers.ModelSerializer):
    """
    Serializer for the Match model.
    Includes related JD title and candidate name for richer output.
    'score_percentage' is a custom field for user-friendly display.
    """
    # Read-only fields to display related information without requiring them for input
    job_description_title = serializers.CharField(source='job_description.title', read_only=True)
    candidate_name = serializers.CharField(source='resume.candidate.name', read_only=True)
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
            'score', 'score_percentage',
            'is_invited_for_interview', 'matched_at' # Added is_invited_for_interview
        ]
        # 'score' and 'matched_at' are set by the matching logic, 'is_invited_for_interview' can be updated
        read_only_fields = ('score', 'matched_at')

    def get_score_percentage(self, obj):
        """
        Calculates and returns the match score as a formatted percentage string.
        """
        return f"{obj.score * 100:.2f}%"