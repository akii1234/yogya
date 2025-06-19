from django.db import models


class JobDescription(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    # Store processed text if you want to avoid re-processing every time
    processed_text = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title

class Candidate(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    # Add other extracted fields as needed (e.g., skills, experience)

    def __str__(self):
        return self.name

class Resume(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='resumes')
    file = models.FileField(upload_to='resumes/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    # Store parsed text for NLP processing
    parsed_text = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Resume for {self.candidate.name}"

class Match(models.Model):
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE)
    resume = models.ForeignKey(Resume, on_delete=models.CASCADE)
    score = models.DecimalField(max_digits=5, decimal_places=2) # e.g., 0.85 for 85%
    matched_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job_description', 'resume') # A resume can only be matched to a JD once

    def __str__(self):
        return f"Match: {self.resume.candidate.name} with {self.job_description.title} - {self.score*100:.2f}%"