# Application Tracking System

## Overview

The Application Tracking System extends the existing ATS functionality to track the complete hiring pipeline from initial matching to final application outcomes. This system provides comprehensive analytics and conversion metrics to help recruiters understand the effectiveness of their hiring process.

## Key Features

### 1. Application Lifecycle Management
- **Complete Application Tracking**: From initial application to final outcome
- **Status Management**: Multiple status levels with automatic timestamp tracking
- **Source Tracking**: Distinguish between ATS matches and direct applications
- **Interview Process**: Track interview rounds and scheduling

### 2. Conversion Analytics
- **Match-to-Application Conversion**: Track how many matches result in applications
- **Quality-Based Analysis**: Conversion rates by match quality (high/medium/low)
- **Time-to-Application**: Average time between match and application
- **Source Breakdown**: Analytics by application source

### 3. Enhanced Candidate Management
- **Skill Auto-Population**: Automatic skill extraction from resumes
- **Manual Skill Management**: Candidates can add/remove skills
- **Comprehensive Profiles**: Rich candidate information for better matching

## Database Schema

### Application Model

```python
class Application(models.Model):
    # Unique identifiers
    application_id = models.CharField(max_length=10, unique=True)  # APP-XXXXXX
    
    # Relationships
    job_description = models.ForeignKey(JobDescription, ...)
    candidate = models.ForeignKey(Candidate, ...)
    match = models.ForeignKey(Match, blank=True, null=True)  # Optional link to match
    
    # Application details
    cover_letter = models.TextField(blank=True)
    expected_salary = models.DecimalField(...)
    salary_currency = models.CharField(max_length=3, default='USD')
    
    # Status and process
    status = models.CharField(choices=[
        ('applied', 'Applied'),
        ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('interviewed', 'Interviewed'),
        ('offer_made', 'Offer Made'),
        ('offer_accepted', 'Offer Accepted'),
        ('offer_declined', 'Offer Declined'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ])
    
    # Source tracking
    source = models.CharField(choices=[
        ('ats_match', 'ATS Match'),
        ('direct_apply', 'Direct Application'),
        ('referral', 'Referral'),
        ('job_board', 'Job Board'),
        ('linkedin', 'LinkedIn'),
        ('other', 'Other'),
    ])
    
    # Process tracking
    is_shortlisted = models.BooleanField(default=False)
    is_interviewed = models.BooleanField(default=False)
    interview_rounds = models.PositiveIntegerField(default=0)
    
    # Notes and feedback
    recruiter_notes = models.TextField(blank=True)
    hiring_manager_notes = models.TextField(blank=True)
    candidate_notes = models.TextField(blank=True)
    
    # Timestamps
    applied_at = models.DateTimeField(auto_now_add=True)
    status_updated_at = models.DateTimeField(auto_now=True)
    shortlisted_at = models.DateTimeField(blank=True, null=True)
    interviewed_at = models.DateTimeField(blank=True, null=True)
    offer_made_at = models.DateTimeField(blank=True, null=True)
    offer_accepted_at = models.DateTimeField(blank=True, null=True)
    rejected_at = models.DateTimeField(blank=True, null=True)
```

## API Endpoints

### Application Management

#### Create Application
```http
POST /api/applications/
Content-Type: application/json

{
    "job_description": 1,
    "candidate": 2,
    "cover_letter": "I am excited to apply for this position...",
    "expected_salary": 120000,
    "salary_currency": "USD",
    "source": "ats_match",
    "status": "applied"
}
```

#### Update Application Status
```http
POST /api/applications/{id}/update-status/
Content-Type: application/json

{
    "status": "shortlisted",
    "notes": "Candidate shows great potential",
    "user_role": "recruiter"
}
```

### Analytics Endpoints

#### General Analytics
```http
GET /api/applications/analytics/?days=30
```

**Response:**
```json
{
    "period": "Last 30 days",
    "total_applications": 45,
    "ats_match_applications": 32,
    "direct_applications": 13,
    "conversion_rate": 71.11,
    "avg_time_to_application_days": 2.3,
    "status_breakdown": [
        {"status": "applied", "count": 20},
        {"status": "shortlisted", "count": 15},
        {"status": "interviewed", "count": 8},
        {"status": "offer_made", "count": 2}
    ],
    "source_breakdown": [
        {"source": "ats_match", "count": 32},
        {"source": "direct_apply", "count": 13}
    ]
}
```

#### Conversion Metrics
```http
GET /api/applications/conversion-metrics/?days=30
```

**Response:**
```json
{
    "period": "Last 30 days",
    "total_matches": 150,
    "total_applications_from_matches": 32,
    "overall_conversion_rate": 21.33,
    "conversion_by_match_quality": {
        "high_matches": {
            "total": 45,
            "applications": 18,
            "conversion_rate": 40.0
        },
        "medium_matches": {
            "total": 75,
            "applications": 12,
            "conversion_rate": 16.0
        },
        "low_matches": {
            "total": 30,
            "applications": 2,
            "conversion_rate": 6.67
        }
    }
}
```

### Skill Management

#### Add Skills to Candidate
```http
POST /api/candidates/{id}/manage-skills/
Content-Type: application/json

{
    "action": "add",
    "skills": ["Machine Learning", "Data Science", "TensorFlow"]
}
```

#### Remove Skills from Candidate
```http
POST /api/candidates/{id}/manage-skills/
Content-Type: application/json

{
    "action": "remove",
    "skills": ["Data Science"]
}
```

#### Get Candidate Skills
```http
GET /api/candidates/{id}/skills/
```

## Business Logic

### 1. Application Creation Logic

When creating an application with `source: "ats_match"`:

1. **Automatic Match Linking**: The system automatically finds the corresponding match between the candidate and job description
2. **Match Validation**: Ensures the match exists and is valid
3. **Source Tracking**: Records whether the application came from an ATS match or direct application

### 2. Status Update Logic

When updating application status:

1. **Automatic Timestamp Updates**: Relevant timestamps are automatically updated based on status
2. **Process Tracking**: Boolean flags are updated (e.g., `is_shortlisted`, `is_interviewed`)
3. **Interview Round Counting**: Automatically increments interview rounds
4. **Role-Based Notes**: Notes are stored based on user role (recruiter, hiring manager, candidate)

### 3. Analytics Calculation

#### Conversion Rate Calculation
```
Conversion Rate = (Applications from ATS Matches / Total Matches) × 100
```

#### Quality-Based Conversion
- **High Matches**: Score ≥ 80%
- **Medium Matches**: Score 60-79%
- **Low Matches**: Score < 60%

#### Time-to-Application
Average time between match creation and application submission for ATS-sourced applications.

## Usage Examples

### Complete Pipeline Example

1. **Create Job Description**
   ```python
   jd_data = {
       "title": "Senior Python Developer",
       "company": "TechCorp",
       "department": "Engineering",
       "description": "We are looking for a Senior Python Developer...",
       "requirements": "Python, Django, FastAPI, PostgreSQL, AWS, 5+ years experience"
   }
   ```

2. **Create Candidate and Upload Resume**
   ```python
   candidate_data = {
       "first_name": "Alice",
       "last_name": "Johnson",
       "email": "alice@example.com",
       "skills": ["Python", "Django", "PostgreSQL"]
   }
   # Resume upload automatically extracts and adds skills
   ```

3. **Match Resumes with Job Description**
   ```python
   # POST /api/job_descriptions/{jd_id}/match-all-resumes/
   # Returns match scores and creates Match records
   ```

4. **Create Application from Match**
   ```python
   application_data = {
       "job_description": jd_id,
       "candidate": candidate_id,
       "source": "ats_match",  # Links to existing match
       "cover_letter": "I am excited to apply...",
       "expected_salary": 120000
   }
   ```

5. **Update Application Status**
   ```python
   status_update = {
       "status": "shortlisted",
       "notes": "Strong technical background",
       "user_role": "recruiter"
   }
   ```

6. **View Analytics**
   ```python
   # GET /api/applications/analytics/
   # GET /api/applications/conversion-metrics/
   ```

## Benefits

### For Recruiters
- **Pipeline Visibility**: Complete view of candidate journey
- **Conversion Insights**: Understand match-to-application effectiveness
- **Quality Metrics**: Focus on high-converting match categories
- **Process Optimization**: Identify bottlenecks in hiring process

### For Candidates
- **Skill Management**: Easy addition/removal of skills
- **Application Tracking**: Clear status updates
- **Professional Profile**: Rich skill and experience data

### For the System
- **Data-Driven Decisions**: Analytics inform matching algorithm improvements
- **Process Efficiency**: Automated status tracking and timestamp management
- **Scalability**: Structured data model supports growth

## Integration Points

### With Existing ATS Features
- **Match Records**: Applications can link to existing matches
- **Skill Extraction**: Leverages existing NLP skill extraction
- **Resume Processing**: Builds on existing resume parsing capabilities

### Future Enhancements
- **Email Notifications**: Status change notifications
- **Dashboard Views**: Visual analytics and reporting
- **Integration APIs**: Connect with external job boards and LinkedIn
- **Advanced Analytics**: Predictive modeling for conversion rates

## Testing

Use the provided test script to validate the complete pipeline:

```bash
python test_application_tracking.py
```

This script demonstrates:
- Job description creation
- Candidate and resume management
- Matching and application creation
- Status updates and analytics
- Skill management functionality

## Conclusion

The Application Tracking System provides a comprehensive solution for tracking the complete hiring pipeline from initial matching to final outcomes. With rich analytics and conversion metrics, it enables data-driven hiring decisions and process optimization. 