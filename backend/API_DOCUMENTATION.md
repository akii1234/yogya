# Yogya Hiring System API Documentation

## 📚 Overview

This document provides comprehensive documentation for the Yogya Hiring System API, a Django REST Framework-based API for resume-to-job matching and competency-based hiring.

## 🚀 Quick Start

### View Interactive Documentation

1. **Open the HTML documentation:**
   ```bash
   # Navigate to the backend directory
   cd /Users/akhiltripathi/dev/yogya/backend
   
   # Open the HTML file in your browser
   open api_docs.html
   ```

2. **Or serve it with Python:**
   ```bash
   # Start a simple HTTP server
   python -m http.server 8080
   
   # Open in browser
   open http://localhost:8080/api_docs.html
   ```

### API Base URL

- **Development:** `http://127.0.0.1:8000/api/`
- **Production:** `https://api.yogya.com/api/`

## 📋 API Endpoints Overview

### 🔍 Job Descriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/job_descriptions/` | List all job descriptions |
| POST | `/job_descriptions/` | Create a new job description |
| GET | `/job_descriptions/{id}/` | Get specific job description |
| PUT | `/job_descriptions/{id}/` | Update job description |
| GET | `/job_descriptions/{id}/matches/` | Get existing matches (read-only) |
| POST | `/job_descriptions/{id}/match-all-resumes/` | Recalculate all matches |

### 👥 Candidates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/candidates/` | List all candidates |
| POST | `/candidates/` | Create a new candidate |
| GET | `/candidates/{id}/` | Get specific candidate |
| POST | `/candidates/{id}/manage-skills/` | Add/remove skills |
| GET | `/candidates/{id}/skills/` | Get candidate skills |

### 📄 Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/resumes/` | List all resumes |
| POST | `/resumes/` | Upload new resume |
| GET | `/resumes/{id}/` | Get specific resume |
| GET | `/resumes/{id}/matches/` | Get existing matches (read-only) |
| POST | `/resumes/{id}/match-with-jd/` | Match with specific job |

### 🎯 Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/matches/` | List all matches with filtering |
| GET | `/matches/?job_description_id=2` | Filter by job description |
| GET | `/matches/?resume_id=2` | Filter by resume |
| GET | `/matches/?min_score=50` | Filter by minimum score |

### 📝 Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/applications/` | List all applications |
| POST | `/applications/` | Create new application |
| GET | `/applications/analytics/` | Get application analytics |
| GET | `/applications/conversion-metrics/` | Get conversion metrics |
| POST | `/applications/{id}/update-status/` | Update application status |

## 🔧 Usage Examples

### 1. Create a Job Description

```bash
curl -X POST "http://127.0.0.1:8000/api/job_descriptions/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Python Developer",
    "company": "TechCorp Solutions",
    "department": "Engineering",
    "location": "San Francisco, CA",
    "description": "We are seeking a Senior Python Developer...",
    "requirements": "• 5+ years of experience in Python development...",
    "experience_level": "senior",
    "min_experience_years": 5,
    "employment_type": "full_time"
  }'
```

### 2. Create a Candidate

```bash
curl -X POST "http://127.0.0.1:8000/api/candidates/" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@email.com",
    "phone": "+1-555-0123",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "current_title": "Software Engineer",
    "current_company": "TechCorp",
    "total_experience_years": 5,
    "skills": ["Python", "Django", "React", "AWS"]
  }'
```

### 3. Upload a Resume

```bash
curl -X POST "http://127.0.0.1:8000/api/resumes/" \
  -F "candidate_id=1" \
  -F "file=@/path/to/resume.pdf"
```

### 4. View Matches for a Job Description

```bash
# Get existing matches (fast, read-only)
curl -X GET "http://127.0.0.1:8000/api/job_descriptions/2/matches/"

# Recalculate all matches (slower, updates database)
curl -X POST "http://127.0.0.1:8000/api/job_descriptions/2/match-all-resumes/"
```

### 5. Match a Specific Resume with a Job

```bash
curl -X POST "http://127.0.0.1:8000/api/resumes/2/match-with-jd/" \
  -H "Content-Type: application/json" \
  -d '{"job_description_id": 2}'
```

### 6. Filter Matches

```bash
# Get matches for a specific job description
curl -X GET "http://127.0.0.1:8000/api/matches/?job_description_id=2"

# Get high-scoring matches only
curl -X GET "http://127.0.0.1:8000/api/matches/?min_score=80"

# Get matches for a specific resume
curl -X GET "http://127.0.0.1:8000/api/matches/?resume_id=2"
```

### 7. Manage Candidate Skills

```bash
# Add skills
curl -X POST "http://127.0.0.1:8000/api/candidates/2/manage-skills/" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add",
    "skills": ["Python", "Django", "React"]
  }'

# Remove skills
curl -X POST "http://127.0.0.1:8000/api/candidates/2/manage-skills/" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "remove",
    "skills": ["React"]
  }'
```

### 8. Create an Application

```bash
curl -X POST "http://127.0.0.1:8000/api/applications/" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": 2,
    "candidate": 2,
    "cover_letter": "I am excited to apply for this position...",
    "expected_salary": 120000,
    "salary_currency": "USD",
    "source": "ats_match"
  }'
```

### 9. Get Analytics

```bash
# Get application analytics
curl -X GET "http://127.0.0.1:8000/api/applications/analytics/?days=30"

# Get conversion metrics
curl -X GET "http://127.0.0.1:8000/api/applications/conversion-metrics/"
```

## 🎯 Key Features

### Hybrid Matching System
- **GET endpoints**: Fast, read-only access to existing matches
- **POST endpoints**: Explicit recalculation and database updates
- **Filtering**: By job description, resume, or score range

### Automatic Skill Extraction
- Resumes are automatically processed to extract skills
- Job descriptions have skills extracted from requirements
- Skills are used for intelligent matching

### Multi-dimensional Scoring
- Skill-based matching (primary)
- Text-based similarity (fallback)
- Experience level consideration
- Technical term matching

### Application Tracking
- Complete application lifecycle management
- Status tracking and updates
- Analytics and conversion metrics
- Integration with match results

## 🔍 Response Examples

### Job Description Matches Response
```json
{
  "job_description": {
    "id": 2,
    "title": "Lead Software Engineer - Python & Microservices",
    "company": "TechCorp Solutions",
    "department": "Engineering"
  },
  "total_resumes_matched": 2,
  "high_matches": 0,
  "medium_matches": 1,
  "low_matches": 1,
  "matches": [
    {
      "resume_id": 2,
      "candidate_name": "Michael Chen",
      "candidate_email": "michael.chen@email.com",
      "match_score": 68.18,
      "match_id": 2,
      "is_high_match": false,
      "is_medium_match": true,
      "is_low_match": false,
      "matched_at": "2025-07-31T18:43:39.827913Z"
    }
  ],
  "note": "These are existing matches. Use POST /match-all-resumes/ to recalculate."
}
```

### Single Match Response
```json
{
  "resume_id": 2,
  "candidate_name": "Michael Chen",
  "candidate_email": "michael.chen@email.com",
  "job_description_id": 2,
  "job_title": "Lead Software Engineer - Python & Microservices",
  "company": "TechCorp Solutions",
  "department": "Engineering",
  "match_score": 68.18,
  "match_id": 2,
  "is_high_match": false,
  "is_medium_match": true,
  "is_low_match": false,
  "matched_skills": ["Python", "Django", "FastAPI"],
  "missing_skills": ["Kubernetes", "AWS"]
}
```

## 🛠️ Development

### Running the API
```bash
# Navigate to backend directory
cd /Users/akhiltripathi/dev/yogya/backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver
```

### Testing the API
```bash
# Test all endpoints
python manage.py test

# Test specific endpoint
curl -X GET "http://127.0.0.1:8000/api/"
```

## 📊 Data Models

### Job Description
- Unique job ID (e.g., JOB-5C628F)
- Company and department information
- Experience requirements
- Automatic skill extraction

### Candidate
- Unique candidate ID (e.g., CAN-CDF2F5)
- Professional information
- Skills management
- Experience tracking

### Resume
- File upload support (PDF, DOCX, TXT)
- Automatic text extraction
- Skill extraction
- Processing status tracking

### Match
- Multi-dimensional scoring
- Match quality indicators
- Interview invitation tracking
- Timestamp tracking

### Application
- Application lifecycle management
- Status tracking
- Source tracking
- Analytics integration

## 🔐 Security Notes

- Currently no authentication required (development mode)
- File upload validation for resumes
- Input validation for all endpoints
- Error handling and logging

## 📈 Performance

- GET endpoints are optimized for speed
- Database queries use select_related for efficiency
- Caching can be implemented for frequently accessed data
- Batch operations for large datasets

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation for API changes
4. Use meaningful commit messages

## 📞 Support

For questions or issues:
- **Developer**: Akhil Tripathi (django.devakhil21@gmail.com)
- Check the interactive API documentation
- Review the OpenAPI specification
- Test endpoints using the provided examples
- Check server logs for detailed error messages

---

**Happy API Development! 🚀** 