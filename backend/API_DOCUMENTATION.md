# Yogya - AI-Powered Technical Hiring Platform API Documentation

## 📚 Overview

This document provides comprehensive documentation for the Yogya AI-Powered Technical Hiring Platform API, a Django REST Framework-based API that combines traditional HR tools with cutting-edge AI capabilities for intelligent hiring.

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

- **Development:** `http://127.0.0.1:8001/api/`
- **Production:** `https://api.yogya.com/api/`

## 🔐 Authentication

Currently, the API uses JWT authentication with the following endpoints:

- **Token Obtain:** `POST /api/token/`
- **Token Refresh:** `POST /api/token/refresh/`
- **Token Verify:** `POST /api/token/verify/`

For development, most endpoints allow anonymous access.

## 📋 API Endpoints Overview

### 🔐 Authentication & User Management (`/api/users/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/` | Register new user |
| POST | `/auth/login/` | User login |
| POST | `/auth/logout/` | User logout |
| POST | `/auth/password-reset/` | Request password reset |
| POST | `/auth/password-reset/confirm/` | Confirm password reset |
| GET | `/profiles/` | List user profiles |
| GET | `/profiles/me/` | Get current user profile |
| PUT | `/profiles/update_profile/` | Update user profile |
| POST | `/profiles/change_password/` | Change password |
| GET | `/hr-profiles/` | List HR profiles |
| GET | `/hr-profiles/my_profile/` | Get current HR profile |
| GET | `/candidate-profiles/` | List candidate profiles |
| GET | `/candidate-profiles/my_profile/` | Get current candidate profile |
| GET | `/sessions/` | List user sessions |
| POST | `/sessions/{id}/terminate/` | Terminate session |
| GET | `/activities/` | List user activities |
| GET | `/admin/users/` | Admin: List all users |
| POST | `/admin/users/{id}/activate/` | Admin: Activate user |
| POST | `/admin/users/{id}/suspend/` | Admin: Suspend user |
| POST | `/admin/users/{id}/deactivate/` | Admin: Deactivate user |

### 🔍 Job Matching System (`/api/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/job_descriptions/` | List all job descriptions |
| POST | `/job_descriptions/` | Create new job description |
| GET | `/job_descriptions/{id}/` | Get specific job description |
| PUT | `/job_descriptions/{id}/` | Update job description |
| DELETE | `/job_descriptions/{id}/` | Delete job description |
| GET | `/job_descriptions/{id}/matches/` | Get existing matches (read-only) |
| POST | `/job_descriptions/{id}/match-all-resumes/` | Recalculate all matches |
| GET | `/candidates/` | List all candidates |
| POST | `/candidates/` | Create new candidate |
| GET | `/candidates/{id}/` | Get specific candidate |
| PUT | `/candidates/{id}/` | Update candidate |
| DELETE | `/candidates/{id}/` | Delete candidate |
| POST | `/candidates/{id}/manage-skills/` | Add/remove skills |
| GET | `/candidates/{id}/skills/` | Get candidate skills |
| GET | `/resumes/` | List all resumes |
| POST | `/resumes/` | Upload new resume |
| GET | `/resumes/{id}/` | Get specific resume |
| PUT | `/resumes/{id}/` | Update resume |
| DELETE | `/resumes/{id}/` | Delete resume |
| GET | `/resumes/{id}/matches/` | Get existing matches (read-only) |
| POST | `/resumes/{id}/match-with-jd/` | Match with specific job |
| GET | `/matches/` | List all matches with filtering |
| GET | `/applications/` | List all applications |
| POST | `/applications/` | Create new application |
| GET | `/applications/analytics/` | Get application analytics |
| GET | `/applications/conversion-metrics/` | Get conversion metrics |
| POST | `/applications/{id}/update-status/` | Update application status |

### 🎯 Competency Management (`/api/competency/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/frameworks/` | List competency frameworks |
| POST | `/frameworks/` | Create competency framework |
| GET | `/frameworks/{id}/` | Get specific framework |
| PUT | `/frameworks/{id}/` | Update framework |
| DELETE | `/frameworks/{id}/` | Delete framework |
| GET | `/frameworks/{id}/competencies/` | Get framework competencies |
| POST | `/frameworks/{id}/add_competency/` | Add competency to framework |
| GET | `/competencies/` | List competencies |
| POST | `/competencies/` | Create competency |
| GET | `/competencies/{id}/` | Get specific competency |
| PUT | `/competencies/{id}/` | Update competency |
| DELETE | `/competencies/{id}/` | Delete competency |
| GET | `/templates/` | List interview templates |
| POST | `/templates/` | Create interview template |
| GET | `/templates/{id}/` | Get specific template |
| PUT | `/templates/{id}/` | Update template |
| DELETE | `/templates/{id}/` | Delete template |
| GET | `/templates/{id}/questions/` | Get template questions |
| POST | `/templates/{id}/add_question/` | Add question to template |
| GET | `/questions/` | List interview questions |
| POST | `/questions/` | Create interview question |
| GET | `/questions/{id}/` | Get specific question |
| PUT | `/questions/{id}/` | Update question |
| DELETE | `/questions/{id}/` | Delete question |

### 🤖 AI Recommendation Engine (`/api/competency/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/question-bank/` | List question bank |
| POST | `/question-bank/` | Create question in bank |
| GET | `/question-bank/{id}/` | Get specific question |
| PUT | `/question-bank/{id}/` | Update question |
| DELETE | `/question-bank/{id}/` | Delete question |
| GET | `/question-bank/recommended_questions/` | Get AI recommendations |
| POST | `/question-bank/advanced_recommendations/` | Get advanced AI recommendations |
| POST | `/question-bank/{id}/increment_usage/` | Increment question usage |
| POST | `/question-bank/{id}/update_success_rate/` | Update success rate |
| POST | `/recommend-framework/` | Recommend competency framework |

### 🧠 LLM Question Generator (`/api/competency/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/llm-prompts/` | List LLM prompts |
| POST | `/llm-prompts/` | Create LLM prompt |
| GET | `/llm-prompts/{id}/` | Get specific prompt |
| PUT | `/llm-prompts/{id}/` | Update prompt |
| DELETE | `/llm-prompts/{id}/` | Delete prompt |
| POST | `/llm-prompts/{id}/generate_question/` | Generate single question |
| POST | `/llm-prompts/{id}/batch_generate/` | Generate multiple questions |
| GET | `/llm-generations/` | List generated questions |
| GET | `/llm-generations/{id}/` | Get specific generation |
| POST | `/llm-generations/{id}/approve/` | Approve generated question |
| POST | `/llm-generations/{id}/reject/` | Reject generated question |
| GET | `/question-embeddings/` | List question embeddings |
| GET | `/question-embeddings/{id}/` | Get specific embedding |
| POST | `/question-embeddings/semantic_search/` | Semantic search questions |
| POST | `/question-embeddings/generate_embeddings/` | Generate embeddings |

### 📊 Interview Management (`/api/competency/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sessions/` | List interview sessions |
| POST | `/sessions/` | Create interview session |
| GET | `/sessions/{id}/` | Get specific session |
| PUT | `/sessions/{id}/` | Update session |
| DELETE | `/sessions/{id}/` | Delete session |
| GET | `/sessions/{id}/evaluations/` | Get session evaluations |
| POST | `/sessions/{id}/add_evaluation/` | Add evaluation to session |
| POST | `/sessions/{id}/calculate_overall_score/` | Calculate overall score |
| POST | `/sessions/{id}/start_ai_interview/` | Start AI interview |
| GET | `/evaluations/` | List competency evaluations |
| POST | `/evaluations/` | Create evaluation |
| GET | `/evaluations/{id}/` | Get specific evaluation |
| PUT | `/evaluations/{id}/` | Update evaluation |
| DELETE | `/evaluations/{id}/` | Delete evaluation |
| GET | `/ai-sessions/` | List AI interview sessions |
| POST | `/ai-sessions/` | Create AI session |
| GET | `/ai-sessions/{id}/` | Get specific AI session |
| PUT | `/ai-sessions/{id}/` | Update AI session |
| DELETE | `/ai-sessions/{id}/` | Delete AI session |
| POST | `/ai-sessions/{id}/submit_response/` | Submit AI interview response |
| POST | `/ai-sessions/{id}/complete_interview/` | Complete AI interview |
| GET | `/analytics/` | List interview analytics |
| GET | `/analytics/{id}/` | Get specific analytics |
| GET | `/analytics/dashboard_stats/` | Get dashboard statistics |

### 👥 Candidate Portal (`/api/`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/browse-jobs/` | Browse available jobs |
| POST | `/apply-job/` | Apply for a job |
| GET | `/my-applications/` | View my applications |
| GET | `/job-details/` | Get job details |
| GET | `/candidate-profile/` | Get candidate profile |
| PUT | `/update-profile/` | Update candidate profile |
| POST | `/upload-resume/` | Upload resume |
| GET | `/my-resumes/` | View my resumes |
| DELETE | `/delete-resume/` | Delete resume |
| POST | `/analyze-resume/` | Analyze resume against job description |

## 🔧 Usage Examples

### 1. User Authentication

```bash
# Register a new user
curl -X POST "http://127.0.0.1:8001/api/users/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "candidate"
  }'

# Login
curl -X POST "http://127.0.0.1:8001/api/users/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'

# Get JWT token
curl -X POST "http://127.0.0.1:8001/api/token/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

### 2. Create a Job Description

```bash
curl -X POST "http://127.0.0.1:8001/api/job_descriptions/" \
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

### 3. Create a Competency Framework

```bash
curl -X POST "http://127.0.0.1:8001/api/competency/frameworks/" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python Development Framework",
    "description": "Comprehensive framework for Python developers",
    "technology": "Python",
    "level": "senior",
    "version": "1.0",
    "is_active": true
  }'
```

### 4. Get AI Question Recommendations

```bash
curl -X POST "http://127.0.0.1:8001/api/competency/question-bank/advanced_recommendations/" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": {
      "title": "Senior Python Developer",
      "requirements": "Python, Django, React, AWS",
      "experience_level": "senior"
    },
    "candidate_profile": {
      "skills": ["Python", "Django", "PostgreSQL"],
      "experience_years": 5
    },
    "framework_id": 1,
    "interview_type": "technical",
    "question_count": 10
  }'
```

### 5. Generate Questions with LLM

```bash
curl -X POST "http://127.0.0.1:8001/api/competency/llm-prompts/1/generate_question/" \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "Python",
    "level": "senior",
    "question_type": "technical",
    "context": "Web development with Django"
  }'
```

### 6. Create Interview Session

```bash
curl -X POST "http://127.0.0.1:8001/api/competency/sessions/" \
  -H "Content-Type: application/json" \
  -d '{
    "candidate": 1,
    "job_description": 1,
    "framework": 1,
    "interview_type": "technical",
    "scheduled_at": "2025-08-15T10:00:00Z",
    "duration_minutes": 60
  }'
```

### 7. Start AI Interview

```bash
curl -X POST "http://127.0.0.1:8001/api/competency/sessions/1/start_ai_interview/" \
  -H "Content-Type: application/json" \
  -d '{
    "candidate_level": "senior",
    "focus_areas": ["Python", "Django", "System Design"],
    "interview_duration": 45
  }'
```

### 8. Submit AI Interview Response

```bash
curl -X POST "http://127.0.0.1:8001/api/competency/ai-sessions/1/submit_response/" \
  -H "Content-Type: application/json" \
  -d '{
    "question_id": 1,
    "response": "I would implement this using Django ORM with proper indexing...",
    "time_taken_seconds": 120
  }'
```

### 9. Resume Analysis

```bash
# Analyze resume against job description
curl -X POST "http://127.0.0.1:8001/api/candidate-portal/analyze-resume/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "job_description": "Python developer with Django experience required. 3+ years of experience needed. Knowledge of PostgreSQL and REST APIs is essential."
  }'
```

### 10. Get Analytics

```bash
# Get interview analytics
curl -X GET "http://127.0.0.1:8001/api/competency/analytics/dashboard_stats/"

# Get application analytics
curl -X GET "http://127.0.0.1:8001/api/applications/analytics/?days=30"
```

## 🎯 Key Features

### 🤖 AI-Powered Question Generation
- **LLM Integration**: OpenAI-powered question generation
- **Smart Prompts**: Context-aware question creation
- **Quality Assessment**: AI-powered question evaluation
- **Batch Generation**: Generate multiple questions efficiently

### 🧠 AI Recommendation Engine
- **Multi-Factor Scoring**: Skill relevance, difficulty matching, framework alignment
- **Context Analysis**: Skill gap detection, strength identification
- **Interview Strategy**: Flow optimization, time allocation
- **Success Prediction**: Confidence scoring and success indicators

### 📊 Competency Management
- **Framework Creation**: Build custom competency frameworks
- **Template Management**: Create structured interview guides
- **Skill Mapping**: Link competencies to job requirements
- **Assessment Tools**: Evaluate candidate competencies

### 🔍 Intelligent Matching
- **Hybrid System**: Fast read-only + explicit recalculation
- **Multi-dimensional Scoring**: Skills, experience, technical terms
- **Automatic Processing**: Resume parsing and skill extraction
- **Real-time Analytics**: Match quality and conversion tracking

### 👥 User Management
- **Role-based Access**: HR and Candidate portals
- **Session Management**: Secure authentication and tracking
- **Activity Logging**: Comprehensive audit trails
- **Profile Management**: Complete user lifecycle

## 🔍 Response Examples

### AI Recommendation Response
```json
{
  "recommendations": [
    {
      "question": {
        "id": 1,
        "text": "Explain the difference between Django's select_related and prefetch_related...",
        "skill": "Python",
        "level": "senior",
        "type": "technical"
      },
      "score": 92.5,
      "reasoning": "High skill relevance (95%), perfect difficulty match (90%), strong framework alignment (95%)",
      "confidence": "high"
    }
  ],
  "context_analysis": {
    "skill_gaps": ["AWS", "Kubernetes"],
    "strengths": ["Python", "Django", "PostgreSQL"],
    "candidate_level": "senior",
    "focus_areas": ["System Design", "Performance Optimization"]
  },
  "interview_strategy": {
    "recommended_flow": "technical → behavioral → system design",
    "time_allocation": {"technical": 30, "behavioral": 10, "system_design": 5},
    "red_flags": ["Limited cloud experience"],
    "success_indicators": ["Strong Django knowledge", "Good problem-solving"]
  }
}
```

### LLM Question Generation Response
```json
{
  "success": true,
  "question": {
    "text": "How would you design a scalable microservices architecture for an e-commerce platform?",
    "skill": "Python",
    "level": "senior",
    "type": "technical",
    "context": "System design and architecture",
    "model_used": "o1-mini",
    "provider": "openai"
  },
  "metadata": {
    "model": "o1-mini",
    "provider": "openai",
    "tokens_used": 150
  }
}
```

### Interview Session Response
```json
{
  "id": 1,
  "candidate": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "job_description": {
    "id": 1,
    "title": "Senior Python Developer",
    "company": "TechCorp Solutions"
  },
  "framework": {
    "id": 1,
    "name": "Python Development Framework"
  },
  "interview_type": "technical",
  "status": "scheduled",
  "scheduled_at": "2025-08-15T10:00:00Z",
  "duration_minutes": 60,
  "overall_score": null,
  "created_at": "2025-08-01T12:00:00Z"
}
```

## 🛠️ Development

### Running the API
```bash
# Navigate to backend directory
cd /Users/akhiltripathi/dev/yogya/backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the server
python manage.py runserver 8001
```

### Testing the API
```bash
# Test all endpoints
python manage.py test

# Test LLM models
python manage.py test_llm_models

# Test specific endpoint
curl -X GET "http://127.0.0.1:8001/api/"
```

## 📊 Data Models

### Core Models
- **User**: Authentication and profile management
- **JobDescription**: Job posting with skill extraction
- **Candidate**: Professional profile with skills
- **Resume**: File upload with text extraction
- **Match**: Multi-dimensional scoring results
- **Application**: Application lifecycle management

### Competency Models
- **CompetencyFramework**: Skill framework definitions
- **Competency**: Individual skill definitions
- **InterviewTemplate**: Structured interview guides
- **InterviewQuestion**: Question bank management
- **InterviewSession**: Interview scheduling and tracking
- **CompetencyEvaluation**: Assessment results
- **AIInterviewSession**: AI-powered interviews

### AI Models
- **LLMQuestionPrompt**: Question generation prompts
- **LLMQuestionGeneration**: Generated questions
- **QuestionEmbedding**: Vector embeddings for search
- **QuestionGenerationBatch**: Batch processing
- **QuestionBank**: Intelligent question storage

## 🔐 Security Notes

- JWT authentication for secure access
- Role-based permissions (HR/Candidate/Admin)
- Session management and activity tracking
- Input validation and sanitization
- File upload security for resumes
- Comprehensive error handling and logging

## 📈 Performance

- Optimized database queries with select_related
- Caching for frequently accessed data
- Batch operations for large datasets
- Efficient vector search for embeddings
- Asynchronous processing for AI operations

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation for API changes
4. Use meaningful commit messages
5. Test with the interactive API documentation

## 📞 Support

For questions or issues:
- **Developer**: Akhil Tripathi (django.devakhil21@gmail.com)
- **Interactive Docs**: Open `api_docs.html` in your browser
- **OpenAPI Spec**: Check `openapi.yaml` for detailed schema
- **Testing**: Use the provided curl examples
- **Logs**: Check server logs for detailed error messages

---

**Happy API Development! 🚀** 