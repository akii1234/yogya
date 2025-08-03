# hiring_app/models.py
from django.db import models

class JobDescription(models.Model):
    """
    Model to store Job Descriptions.
    'description' holds the raw text, 'processed_text' stores its preprocessed version
    for faster NLP operations.
    """
    title = models.CharField(max_length=255)
    description = models.TextField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    # This field will store the preprocessed (cleaned and tokenized) version of the JD text.
    # It's populated automatically when a JD is saved/updated via the API.
    processed_text = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title

class Candidate(models.Model):
    """
    Model to store basic candidate information.
    """
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    # You can add more candidate-specific fields here (e.g., skills, experience summary)

    def __str__(self):
        return self.name

class Resume(models.Model):
    """
    Model to store uploaded resumes.
    'file' stores the actual file, 'parsed_text' stores the extracted and preprocessed text.
    Each resume is linked to a Candidate.
    """
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to='resumes/') # Files will be stored in 'media/resumes/'
    uploaded_at = models.DateTimeField(auto_now_add=True)
    # This field will store the extracted and preprocessed text from the resume file.
    # It's populated automatically when a resume is uploaded via the API.
    parsed_text = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Resume for {self.candidate.name} (ID: {self.id})"

class Match(models.Model):
    """
    Model to store the match results between a Job Description and a Resume.
    'score' holds the similarity score (e.g., 0.85 for 85%).
    'is_invited_for_interview' tracks if the candidate for this specific match has been invited.
    """
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE)
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)
    # DecimalField to store the similarity score with 2 decimal places (e.g., 0.65, 0.82)
    score = models.DecimalField(max_digits=5, decimal_places=2)
    matched_at = models.DateTimeField(auto_now_add=True)
    # New field: To track if the candidate has been invited for an interview for this specific match
    is_invited_for_interview = models.BooleanField(default=False)

    class Meta:
        # Ensures that a unique match record exists for each JD-Resume pair
        unique_together = ('job_description', 'resume')
        verbose_name_plural = "Matches" # Nicer name in Django Admin

    def __str__(self):
        status = "Invited" if self.is_invited_for_interview else "Not Invited"
        return (f"Match: {self.resume.candidate.name} ({self.resume.id}) with "
                f"{self.job_description.title} ({self.job_description.id}) - "
                f"{self.score*100:.2f}% ({status})")