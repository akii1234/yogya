# Yogya API Documentation

## 🚀 **Overview**

The Yogya API provides comprehensive endpoints for AI-powered resume analysis, job matching, candidate management, and interview preparation. All endpoints return JSON responses and use standard HTTP status codes.

**Base URL**: `http://localhost:8001/api/`

## 🔐 **Authentication**

### **JWT Authentication**
All protected endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### **Token Endpoints**
- `POST /api/users/auth/register/` - User registration
- `POST /api/users/auth/login/` - User authentication
- `POST /api/users/auth/refresh/` - Refresh JWT token

## 👥 **Candidate Portal Endpoints**

### **1. Resume Analysis**
```http
POST /api/candidate-portal/analyze-resume/
```

**Description**: Analyze resume and extract skills, experience, and other relevant information.

**Request**:
```bash
curl -X POST http://localhost:8001/api/candidate-portal/analyze-resume/ \
  -H "Authorization: Bearer <token>" \
  -F "resume_file=@resume.pdf"
```

**Response**:
```json
{
  "success": true,
  "message": "Resume analyzed successfully",
  "data": {
    "extracted_skills": ["Python", "Django", "React"],
    "experience_years": 5,
    "education": "Bachelor's Degree",
    "location": "New York, NY",
    "processing_status": "completed"
  }
}
```

### **2. Browse Jobs**
```http
GET /api/candidate-portal/browse-jobs/
```

**Description**: Get filtered job listings based on candidate profile and preferences.

**Query Parameters**:
- `min_match_score` (int): Minimum match score filter (default: 50)
- `show_only_matches` (bool): Show only jobs with good match scores
- `page` (int): Page number for pagination
- `page_size` (int): Number of jobs per page

**Response**:
```json
{
  "jobs": [
    {
      "id": 1,
      "title": "Senior Python Developer",
      "company": "Tech Corp",
      "location": "Remote",
      "match_score": 85.5,
      "match_level": "excellent",
      "skills_required": ["Python", "Django", "PostgreSQL"],
      "experience_required": 5,
      "employment_type": "full_time"
    }
  ],
  "total_count": 100,
  "page": 1,
  "page_size": 20
}
```

### **3. Apply for Job**
```http
POST /api/candidate-portal/apply-job/
```

**Description**: Submit a job application.

**Request**:
```json
{
  "job_id": 1,
  "cover_letter": "I am excited to apply for this position...",
  "resume_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application_id": 123
}
```

### **4. My Applications**
```http
GET /api/candidate-portal/my-applications/
```

**Description**: Get all applications submitted by the candidate.

**Response**:
```json
{
  "applications": [
    {
      "id": 123,
      "job": {
        "id": 1,
        "title": "Senior Python Developer",
        "company": "Tech Corp"
      },
      "status": "applied",
      "applied_at": "2024-01-15T10:30:00Z",
      "match_score": 85.5,
      "next_step": "Application under review"
    }
  ],
  "total_count": 5
}
```

### **5. Detailed Match Analysis**
```http
POST /api/candidate-portal/detailed-match-analysis/
```

**Description**: Get comprehensive analysis of candidate-job compatibility.

**Request**:
```json
{
  "job_id": 1
}
```

**Response**:
```json
{
  "job_info": {
    "id": 1,
    "title": "Senior Python Developer",
    "company": "Tech Corp",
    "location": "Remote",
    "experience_level": "senior",
    "min_experience_years": 5
  },
  "candidate_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "location": "New York, NY",
    "total_skills": 15,
    "experience_years": 5,
    "education": "Bachelor's"
  },
  "detailed_analysis": {
    "overall_score": 85.5,
    "skill_analysis": {
      "score": 90.0,
      "matched_skills": ["Python", "Django"],
      "missing_skills": ["Kubernetes"],
      "recommendations": ["Learn Kubernetes to improve your match"]
    },
    "experience_analysis": {
      "score": 100.0,
      "required_years": 5,
      "candidate_years": 5,
      "status": "exceeds"
    },
    "education_analysis": {
      "score": 75.0,
      "status": "suitable"
    },
    "location_analysis": {
      "score": 100.0,
      "status": "remote"
    }
  },
  "improvement_plan": {
    "priority_areas": ["Skill Development"],
    "skill_development": ["Learn Kubernetes"],
    "timeline": "3-6 months",
    "estimated_score_improvement": 15
  },
  "ai_enhancement": {
    "ai_enhanced": true,
    "insights": {
      "career_recommendations": ["Focus on cloud technologies"],
      "industry_insights": ["Python developers are in high demand"],
      "interview_tips": ["Prepare for system design questions"]
    },
    "confidence_score": 0.85
  },
  "interview_prep": {
    "ai_generated": true,
    "interview_guide": {
      "technical_questions": ["Explain Django ORM", "Design a REST API"],
      "behavioral_questions": ["Tell me about a challenging project"],
      "questions_to_ask": ["What does success look like in this role?"]
    }
  },
  "coding_questions": {
    "total_questions": 15,
    "technologies": ["python", "django"],
    "experience_level": "senior",
    "estimated_time": 120,
    "questions": [
      {
        "id": "python_senior_1",
        "title": "Design LRU Cache",
        "description": "Implement LRU cache using OrderedDict",
        "difficulty": "hard",
        "time_limit": 35,
        "category": "data_structures",
        "tags": ["python", "lru_cache", "ordereddict"],
        "sample_input": "put(1,1), put(2,2), get(1), put(3,3), get(2)",
        "sample_output": "1, -1",
        "hint": "Use OrderedDict.move_to_end() to update access order",
        "solution": "from collections import OrderedDict..."
      }
    ]
  },
  "match_level": "excellent"
}
```

### **6. Candidate Profile**
```http
GET /api/candidate-portal/candidate-profile/
```

**Description**: Get current candidate profile information.

**Response**:
```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "skills": ["Python", "Django", "React"],
  "total_experience_years": 5,
  "highest_education": "bachelor",
  "current_company": "Previous Corp",
  "resume_count": 2
}
```

### **7. Update Profile**
```http
PUT /api/candidate-portal/update-profile/
```

**Description**: Update candidate profile information.

**Request**:
```json
{
  "full_name": "John Doe",
  "phone": "+1234567890",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "total_experience_years": 5,
  "highest_education": "bachelor",
  "current_company": "Previous Corp"
}
```

### **8. Upload Resume**
```http
POST /api/candidate-portal/upload-resume/
```

**Description**: Upload and process a new resume.

**Request**:
```bash
curl -X POST http://localhost:8001/api/candidate-portal/upload-resume/ \
  -H "Authorization: Bearer <token>" \
  -F "resume_file=@resume.pdf"
```

### **9. My Resumes**
```http
GET /api/candidate-portal/my-resumes/
```

**Description**: Get all resumes uploaded by the candidate.

**Response**:
```json
{
  "resumes": [
    {
      "id": 1,
      "filename": "resume.pdf",
      "uploaded_at": "2024-01-15T10:30:00Z",
      "processing_status": "completed",
      "extracted_skills": ["Python", "Django"],
      "file_size": 1024000
    }
  ],
  "total_count": 2
}
```

## 🏢 **HR Management Endpoints**

### **1. Job Descriptions**

#### **List Jobs**
```http
GET /api/job_descriptions/
```

**Query Parameters**:
- `page` (int): Page number
- `page_size` (int): Items per page (max: 1000)
- `search` (string): Search in title, company, description
- `status` (string): Filter by status (active, inactive, draft)

#### **Create Job**
```http
POST /api/job_descriptions/
```

**Request**:
```json
{
  "title": "Senior Python Developer",
  "company": "Tech Corp",
  "department": "Engineering",
  "location": "Remote",
  "description": "We are looking for a senior Python developer...",
  "requirements": "5+ years of Python experience...",
  "experience_level": "senior",
  "employment_type": "full_time",
  "min_experience_years": 5,
  "status": "active"
}
```

#### **Bulk Upload Jobs**
```http
POST /api/job_descriptions/bulk-upload/
```

**Description**: Upload multiple jobs via CSV file.

**Request**:
```bash
curl -X POST http://localhost:8001/api/job_descriptions/bulk-upload/ \
  -H "Authorization: Bearer <token>" \
  -F "csv_file=@jobs.csv"
```

#### **Download Template**
```http
GET /api/job_descriptions/download-template/
```

**Description**: Download CSV template for bulk job upload.

### **2. Applications**

#### **List Applications**
```http
GET /api/applications/
```

**Query Parameters**:
- `job_id` (int): Filter by job
- `status` (string): Filter by status
- `page` (int): Page number

#### **Application Analytics**
```http
GET /api/applications/analytics/
```

**Response**:
```json
{
  "total_applications": 150,
  "applications_by_status": {
    "applied": 50,
    "reviewing": 30,
    "interviewing": 20,
    "offered": 10,
    "hired": 5,
    "rejected": 35
  },
  "conversion_rates": {
    "applied_to_interview": 40.0,
    "interview_to_offer": 50.0,
    "offer_to_hire": 50.0
  },
  "average_match_score": 75.5
}
```

#### **Update Application Status**
```http
POST /api/applications/{id}/update-status/
```

**Request**:
```json
{
  "status": "interviewing",
  "notes": "Candidate passed initial screening"
}
```

### **3. Resume Matching**

#### **Match Resume to Job**
```http
POST /api/resumes/{id}/match-with-jd/
```

**Request**:
```json
{
  "job_description_id": 1
}
```

**Response**:
```json
{
  "resume_id": 1,
  "job_description_id": 1,
  "overall_score": 87.34,
  "is_high_match": true,
  "detailed_breakdown": {
    "skill_score": 85.0,
    "experience_score": 90.0,
    "education_score": 80.0,
    "location_score": 100.0
  }
}
```

#### **Match All Resumes to Job**
```http
POST /api/job_descriptions/{id}/match-all-resumes/
```

**Description**: Match all available resumes to a specific job description.

## 👤 **User Management Endpoints**

### **1. Authentication**

#### **Register User**
```http
POST /api/users/auth/register/
```

**Request**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "confirm_password": "securepassword123",
  "role": "candidate"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "role": "candidate",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

#### **Login User**
```http
POST /api/users/auth/login/
```

**Request**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "role": "candidate",
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

### **2. Profile Management**

#### **Get My Profile**
```http
GET /api/users/candidate-profiles/my_profile/
```

#### **Update Profile**
```http
PUT /api/users/candidate-profiles/my_profile/
```

## 📊 **Analytics Endpoints**

### **1. Conversion Metrics**
```http
GET /api/applications/conversion-metrics/
```

**Response**:
```json
{
  "funnel_data": {
    "applications": 100,
    "screening": 80,
    "interviews": 40,
    "offers": 20,
    "hires": 10
  },
  "conversion_rates": {
    "application_to_screening": 80.0,
    "screening_to_interview": 50.0,
    "interview_to_offer": 50.0,
    "offer_to_hire": 50.0
  },
  "time_to_hire": {
    "average_days": 15.5,
    "median_days": 12.0
  }
}
```

## 🔧 **Utility Endpoints**

### **1. Health Check**
```http
GET /api/health/
```

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

### **2. Debug Upload**
```http
POST /api/debug-upload/
```

**Description**: Debug endpoint for testing file uploads.

## 📝 **Error Responses**

All endpoints return consistent error responses:

```json
{
  "error": "Error message description",
  "detail": "Additional error details",
  "code": "ERROR_CODE"
}
```

### **Common HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 **Testing Examples**

### **Test Resume Analysis**
```bash
curl -X POST http://localhost:8001/api/candidate-portal/analyze-resume/ \
  -H "Authorization: Bearer <token>" \
  -F "resume_file=@sample_resume.pdf"
```

### **Test Job Browsing**
```bash
curl -X GET "http://localhost:8001/api/candidate-portal/browse-jobs/?min_match_score=70" \
  -H "Authorization: Bearer <token>"
```

### **Test Detailed Analysis**
```bash
curl -X POST http://localhost:8001/api/candidate-portal/detailed-match-analysis/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"job_id": 1}'
```

## 🔒 **Rate Limiting**

API endpoints are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **Resume analysis**: 10 requests per hour
- **General endpoints**: 100 requests per minute

## 📚 **Additional Resources**

- [User Guide](../docs/USER_GUIDE.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)
- [Troubleshooting](../docs/TROUBLESHOOTING.md)
- [Sample Data](../sample/)

---

**Yogya API** - Empowering smarter hiring decisions through AI-powered competency assessment. 🚀 