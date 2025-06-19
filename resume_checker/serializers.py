from rest_framework import serializers
from .models import JobDescription, Resume, Candidate, Match

class JobDescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDescription
        fields = '__all__'
        read_only_fields = ('processed_text',) # Will be set internally

class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidate
        fields = '__all__'

class ResumeSerializer(serializers.ModelSerializer):
    # candidate = CandidateSerializer(read_only=True) # If you want to embed candidate data
    candidate_id = serializers.PrimaryKeyRelatedField(
        queryset=Candidate.objects.all(), source='candidate', write_only=True
    )
    file = serializers.FileField(write_only=True) # For file upload

    class Meta:
        model = Resume
        fields = ['id', 'candidate_id', 'file', 'uploaded_at', 'parsed_text']
        read_only_fields = ('parsed_text',) # Will be set internally

class MatchSerializer(serializers.ModelSerializer):
    job_description_title = serializers.CharField(source='job_description.title', read_only=True)
    candidate_name = serializers.CharField(source='resume.candidate.name', read_only=True)
    score_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['id', 'job_description', 'job_description_title', 'resume', 'candidate_name', 'score', 'score_percentage', 'matched_at']
        read_only_fields = ('score', 'matched_at')

    def get_score_percentage(self, obj):
        return f"{obj.score * 100:.2f}%"