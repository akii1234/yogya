# Candidate Portal Documentation

## Overview
The Candidate Portal is a comprehensive platform that allows candidates to manage their job applications, view detailed match analysis, practice coding questions, and track their interview progress.

## Features

### 1. Job Browsing & Application
- **Browse Available Jobs**: View all active job postings with company details, requirements, and match scores
- **Apply to Jobs**: Submit applications with one-click functionality
- **Application Tracking**: Monitor application status and timeline
- **Match Score Display**: See percentage match based on skills, experience, and location

### 2. Detailed Match Analysis
- **Skill Analysis**: Detailed breakdown of skill matches and gaps
- **Experience Analysis**: Years of experience comparison
- **Location Analysis**: Geographic proximity assessment
- **AI-Enhanced Insights**: Personalized recommendations and improvement suggestions
- **Interview Preparation**: Tips and resources for interview success

### 3. Coding Playground
- **Personalized Questions**: AI-generated coding questions based on job requirements
- **Multiple Technologies**: Support for Python, Java, JavaScript, SQL, DevOps, Cloud, System Design
- **Difficulty Levels**: Easy, Medium, Hard questions based on experience
- **Gamification**: XP points, achievements, and progress tracking
- **Real-time Feedback**: Immediate scoring and performance analysis

### 4. Profile Management
- **Resume Upload**: PDF resume parsing with automatic skill extraction
- **Skill Management**: Add, edit, and manage technical skills
- **Experience Details**: Work history and project information
- **Personal Information**: Contact details and preferences

### 5. Interview Management
- **Interview Scheduling**: View and manage interview appointments
- **Interview Feedback**: Access feedback from completed interviews
- **Interview Preparation**: Resources and tips for upcoming interviews

## API Endpoints

### Authentication
```
POST /api/auth/login/
POST /api/auth/register/
POST /api/auth/logout/
GET  /api/auth/user/
```

### Job Management
```
GET    /api/job-descriptions/                    # List all jobs
GET    /api/job-descriptions/{id}/               # Get specific job
POST   /api/job-descriptions/{id}/apply/         # Apply to job
GET    /api/job-descriptions/{id}/matches/       # Get matches for job
```

### Application Management
```
GET    /api/applications/                        # List user applications
GET    /api/applications/{id}/                   # Get specific application
PUT    /api/applications/{id}/                   # Update application
DELETE /api/applications/{id}/                   # Withdraw application
```

### Match Analysis
```
POST   /api/candidate-portal/detailed-match-analysis/    # Get detailed analysis
GET    /api/candidate-portal/match-scores/               # Get all match scores
```

### Coding Questions
```
POST   /api/candidate-portal/enhanced-coding-questions/  # Get personalized questions
GET    /api/candidate-portal/question-history/           # Get question history
POST   /api/candidate-portal/submit-answer/              # Submit answer
```

### Profile Management
```
GET    /api/candidates/profile/                  # Get candidate profile
PUT    /api/candidates/profile/                  # Update profile
POST   /api/candidates/upload-resume/            # Upload resume
GET    /api/candidates/skills/                   # Get candidate skills
PUT    /api/candidates/skills/                   # Update skills
```

### Interview Management
```
GET    /api/interviews/                          # List interviews
GET    /api/interviews/{id}/                     # Get specific interview
POST   /api/interviews/{id}/schedule/            # Schedule interview
GET    /api/interviews/{id}/feedback/            # Get interview feedback
```

## Data Models

### Candidate Model
```python
class Candidate(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    skills = models.JSONField(default=list)
    total_experience_years = models.IntegerField(default=0)
    current_location = models.CharField(max_length=255, blank=True)
    resume = models.FileField(upload_to='resumes/', blank=True)
    extracted_skills = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### JobDescription Model
```python
class JobDescription(models.Model):
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField(blank=True)
    location = models.CharField(max_length=255)
    min_experience_years = models.IntegerField(default=0)
    max_experience_years = models.IntegerField(default=10)
    salary_range = models.CharField(max_length=100, blank=True)
    extracted_skills = models.JSONField(default=list)
    processed_text = models.TextField(blank=True)
    posted_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
```

### Application Model
```python
class Application(models.Model):
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE)
    job_description = models.ForeignKey(JobDescription, on_delete=models.CASCADE)
    applied_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='applied')
    match_score = models.FloatField(default=0.0)
    notes = models.TextField(blank=True)
```

## Frontend Components

### Core Components
- `JobBrowse.jsx` - Job listing and application interface
- `DetailedAnalysisModal.jsx` - Match analysis display
- `CodingPlayground.jsx` - Coding questions interface
- `CandidateProfile.jsx` - Profile management
- `ApplicationTracker.jsx` - Application status tracking
- `InterviewScheduler.jsx` - Interview management

### Service Files
- `candidateService.js` - API calls for candidate operations
- `jobService.js` - Job-related API calls
- `authService.js` - Authentication services

## API Response Examples

### Detailed Match Analysis Response
```json
{
  "overall_score": 85.5,
  "skill_analysis": {
    "score": 90.0,
    "matched_skills": ["Python", "Django", "AWS"],
    "missing_skills": ["Kubernetes"],
    "total_required": 4,
    "match_percentage": 75.0,
    "strengths": ["Strong Python skills", "Good Django experience"],
    "weaknesses": ["Missing Kubernetes experience"],
    "recommendations": ["Learn Kubernetes basics", "Practice system design"]
  },
  "experience_analysis": {
    "score": 95.0,
    "candidate_years": 5,
    "required_years": 3,
    "match_percentage": 100.0
  },
  "location_analysis": {
    "score": 70.0,
    "candidate_location": "New York",
    "job_location": "Remote",
    "match_percentage": 70.0
  }
}
```

### Enhanced Coding Questions Response
```json
{
  "questions": [
    {
      "id": "python_senior_001",
      "title": "Microservices Communication",
      "description": "Design a communication system between microservices...",
      "difficulty": "hard",
      "category": "system_design",
      "tags": ["microservices", "api", "design"],
      "time_limit": 45,
      "solution": "Use message queues and API gateways...",
      "test_cases": [...],
      "hints": ["Consider message queues", "Think about scalability"]
    }
  ],
  "total_questions": 15,
  "technologies": ["python", "system_design", "devops"],
  "experience_level": "senior",
  "estimated_time": 120,
  "difficulty_breakdown": {
    "easy": 3,
    "medium": 7,
    "hard": 5
  }
}
```

## Troubleshooting

### Common Issues

#### 1. "No Questions Available" in Playground
**Cause**: No applications to jobs or missing job skills
**Solution**: 
- Apply to at least one job
- Ensure job descriptions have extracted skills
- Check candidate skills are properly set

#### 2. Low Match Scores
**Cause**: Missing skills or experience data
**Solution**:
- Upload resume to extract skills automatically
- Manually add missing skills to profile
- Update experience information

#### 3. API Authentication Errors
**Cause**: Expired or invalid JWT token
**Solution**:
- Refresh the page to get new token
- Log out and log back in
- Check token expiration time

### Debug Information

#### Check Candidate Skills
```python
# Backend script
from resume_checker.models import Candidate
candidate = Candidate.objects.get(email='user@example.com')
print(f"Skills: {candidate.skills}")
print(f"Skills count: {len(candidate.skills) if candidate.skills else 0}")
```

#### Check Job Skills
```python
# Backend script
from resume_checker.models import JobDescription
job = JobDescription.objects.get(id=job_id)
print(f"Job skills: {job.extracted_skills}")
print(f"Job description: {job.description[:200]}...")
```

#### Test Question Generation
```python
# Backend script
from resume_checker.enhanced_coding_questions import enhanced_coding_questions_manager
result = enhanced_coding_questions_manager.generate_personalized_questions(
    candidate_skills, candidate_experience, job_skills, job_description
)
print(f"Generated {len(result['questions'])} questions")
```

## Performance Considerations

### Database Optimization
- Index on frequently queried fields (email, skills, experience)
- Use select_related() for foreign key relationships
- Implement pagination for large datasets

### Caching Strategy
- Cache match analysis results for 24 hours
- Cache coding questions for 1 hour
- Use Redis for session storage

### API Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per user
- Implement exponential backoff for retries

## Security Considerations

### Data Protection
- Encrypt sensitive candidate data
- Implement proper access controls
- Regular security audits

### API Security
- JWT token validation
- CORS configuration
- Input validation and sanitization

### File Upload Security
- File type validation
- Virus scanning for uploads
- Secure file storage

---

**Last Updated**: January 2025
**Version**: 1.4
**Maintainer**: Development Team
