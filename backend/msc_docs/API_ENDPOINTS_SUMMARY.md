# Yogya API Endpoints Summary

## 📋 Complete API Endpoints List

This document provides a comprehensive list of all available API endpoints in the Yogya AI-Powered Technical Hiring Platform.

### 🔐 Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/token/` | Obtain JWT access token |
| POST | `/api/token/refresh/` | Refresh JWT token |
| POST | `/api/token/verify/` | Verify JWT token |

### 👥 User Management (`/api/users/`)

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register/` | Register new user |
| POST | `/auth/login/` | User login |
| POST | `/auth/logout/` | User logout |
| POST | `/auth/password-reset/` | Request password reset |
| POST | `/auth/password-reset/confirm/` | Confirm password reset |

#### User Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profiles/` | List user profiles |
| POST | `/profiles/` | Create user profile |
| GET | `/profiles/{id}/` | Get specific profile |
| PUT | `/profiles/{id}/` | Update profile |
| DELETE | `/profiles/{id}/` | Delete profile |
| GET | `/profiles/me/` | Get current user profile |
| PUT | `/profiles/update_profile/` | Update current profile |
| PATCH | `/profiles/update_profile/` | Partial update current profile |
| POST | `/profiles/change_password/` | Change password |

#### HR Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/hr-profiles/` | List HR profiles |
| POST | `/hr-profiles/` | Create HR profile |
| GET | `/hr-profiles/{id}/` | Get specific HR profile |
| PUT | `/hr-profiles/{id}/` | Update HR profile |
| DELETE | `/hr-profiles/{id}/` | Delete HR profile |
| GET | `/hr-profiles/my_profile/` | Get current HR profile |

#### Candidate Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/candidate-profiles/` | List candidate profiles |
| POST | `/candidate-profiles/` | Create candidate profile |
| GET | `/candidate-profiles/{id}/` | Get specific candidate profile |
| PUT | `/candidate-profiles/{id}/` | Update candidate profile |
| DELETE | `/candidate-profiles/{id}/` | Delete candidate profile |
| GET | `/candidate-profiles/my_profile/` | Get current candidate profile |

#### Sessions & Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sessions/` | List user sessions |
| GET | `/sessions/{id}/` | Get specific session |
| POST | `/sessions/{id}/terminate/` | Terminate session |
| GET | `/activities/` | List user activities |
| GET | `/activities/{id}/` | Get specific activity |

#### Admin Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users/` | List all users (admin) |
| POST | `/admin/users/` | Create user (admin) |
| GET | `/admin/users/{id}/` | Get specific user (admin) |
| PUT | `/admin/users/{id}/` | Update user (admin) |
| DELETE | `/admin/users/{id}/` | Delete user (admin) |
| POST | `/admin/users/{id}/activate/` | Activate user (admin) |
| POST | `/admin/users/{id}/suspend/` | Suspend user (admin) |
| POST | `/admin/users/{id}/deactivate/` | Deactivate user (admin) |

### 🔍 Job Matching System (`/api/`)

#### Job Descriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/job_descriptions/` | List all job descriptions |
| POST | `/job_descriptions/` | Create new job description |
| GET | `/job_descriptions/{id}/` | Get specific job description |
| PUT | `/job_descriptions/{id}/` | Update job description |
| DELETE | `/job_descriptions/{id}/` | Delete job description |
| GET | `/job_descriptions/{id}/matches/` | Get existing matches (read-only) |
| POST | `/job_descriptions/{id}/match-all-resumes/` | Recalculate all matches |

#### Candidates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/candidates/` | List all candidates |
| POST | `/candidates/` | Create new candidate |
| GET | `/candidates/{id}/` | Get specific candidate |
| PUT | `/candidates/{id}/` | Update candidate |
| DELETE | `/candidates/{id}/` | Delete candidate |
| POST | `/candidates/{id}/manage-skills/` | Add/remove skills |
| GET | `/candidates/{id}/skills/` | Get candidate skills |

#### Resumes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/resumes/` | List all resumes |
| POST | `/resumes/` | Upload new resume |
| GET | `/resumes/{id}/` | Get specific resume |
| PUT | `/resumes/{id}/` | Update resume |
| DELETE | `/resumes/{id}/` | Delete resume |
| GET | `/resumes/{id}/matches/` | Get existing matches (read-only) |
| POST | `/resumes/{id}/match-with-jd/` | Match with specific job |

#### Matches
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/matches/` | List all matches with filtering |
| POST | `/matches/` | Create new match |
| GET | `/matches/{id}/` | Get specific match |
| PUT | `/matches/{id}/` | Update match |
| DELETE | `/matches/{id}/` | Delete match |

#### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/applications/` | List all applications |
| POST | `/applications/` | Create new application |
| GET | `/applications/{id}/` | Get specific application |
| PUT | `/applications/{id}/` | Update application |
| DELETE | `/applications/{id}/` | Delete application |
| GET | `/applications/analytics/` | Get application analytics |
| GET | `/applications/conversion-metrics/` | Get conversion metrics |
| POST | `/applications/{id}/update-status/` | Update application status |

#### Candidate Portal
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

### 🎯 Competency Management (`/api/competency/`)

#### Competency Frameworks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/frameworks/` | List competency frameworks |
| POST | `/frameworks/` | Create competency framework |
| GET | `/frameworks/{id}/` | Get specific framework |
| PUT | `/frameworks/{id}/` | Update framework |
| DELETE | `/frameworks/{id}/` | Delete framework |
| GET | `/frameworks/{id}/competencies/` | Get framework competencies |
| POST | `/frameworks/{id}/add_competency/` | Add competency to framework |

#### Competencies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/competencies/` | List competencies |
| POST | `/competencies/` | Create competency |
| GET | `/competencies/{id}/` | Get specific competency |
| PUT | `/competencies/{id}/` | Update competency |
| DELETE | `/competencies/{id}/` | Delete competency |

#### Interview Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/templates/` | List interview templates |
| POST | `/templates/` | Create interview template |
| GET | `/templates/{id}/` | Get specific template |
| PUT | `/templates/{id}/` | Update template |
| DELETE | `/templates/{id}/` | Delete template |
| GET | `/templates/{id}/questions/` | Get template questions |
| POST | `/templates/{id}/add_question/` | Add question to template |

#### Interview Questions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/questions/` | List interview questions |
| POST | `/questions/` | Create interview question |
| GET | `/questions/{id}/` | Get specific question |
| PUT | `/questions/{id}/` | Update question |
| DELETE | `/questions/{id}/` | Delete question |

### 🤖 AI Recommendation Engine (`/api/competency/`)

#### Question Bank
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

#### Framework Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/recommend-framework/` | Recommend competency framework |

### 🧠 LLM Question Generator (`/api/competency/`)

#### LLM Prompts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/llm-prompts/` | List LLM prompts |
| POST | `/llm-prompts/` | Create LLM prompt |
| GET | `/llm-prompts/{id}/` | Get specific prompt |
| PUT | `/llm-prompts/{id}/` | Update prompt |
| DELETE | `/llm-prompts/{id}/` | Delete prompt |
| POST | `/llm-prompts/{id}/generate_question/` | Generate single question |
| POST | `/llm-prompts/{id}/batch_generate/` | Generate multiple questions |

#### LLM Generations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/llm-generations/` | List generated questions |
| GET | `/llm-generations/{id}/` | Get specific generation |
| POST | `/llm-generations/{id}/approve/` | Approve generated question |
| POST | `/llm-generations/{id}/reject/` | Reject generated question |

#### Question Embeddings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/question-embeddings/` | List question embeddings |
| GET | `/question-embeddings/{id}/` | Get specific embedding |
| POST | `/question-embeddings/semantic_search/` | Semantic search questions |
| POST | `/question-embeddings/generate_embeddings/` | Generate embeddings |

### 📊 Interview Management (`/api/competency/`)

#### Interview Sessions
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

#### Competency Evaluations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/evaluations/` | List competency evaluations |
| POST | `/evaluations/` | Create evaluation |
| GET | `/evaluations/{id}/` | Get specific evaluation |
| PUT | `/evaluations/{id}/` | Update evaluation |
| DELETE | `/evaluations/{id}/` | Delete evaluation |

#### AI Interview Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ai-sessions/` | List AI interview sessions |
| POST | `/ai-sessions/` | Create AI session |
| GET | `/ai-sessions/{id}/` | Get specific AI session |
| PUT | `/ai-sessions/{id}/` | Update AI session |
| DELETE | `/ai-sessions/{id}/` | Delete AI session |
| POST | `/ai-sessions/{id}/submit_response/` | Submit AI interview response |
| POST | `/ai-sessions/{id}/complete_interview/` | Complete AI interview |

#### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/` | List interview analytics |
| GET | `/analytics/{id}/` | Get specific analytics |
| GET | `/analytics/dashboard_stats/` | Get dashboard statistics |

## 📊 Endpoint Statistics

### Total Endpoints by Category:
- **Authentication**: 3 endpoints
- **User Management**: 35 endpoints
- **Job Matching**: 25 endpoints
- **Competency Management**: 20 endpoints
- **AI Recommendation Engine**: 10 endpoints
- **LLM Question Generator**: 15 endpoints
- **Interview Management**: 25 endpoints

### Total Endpoints: **133 endpoints**

### HTTP Methods Distribution:
- **GET**: 65 endpoints (48.9%)
- **POST**: 45 endpoints (33.8%)
- **PUT**: 15 endpoints (11.3%)
- **DELETE**: 8 endpoints (6.0%)

## 🔧 Usage Notes

### Authentication
- Most endpoints require JWT authentication
- Use `/api/token/` to obtain access tokens
- Include `Authorization: Bearer <token>` in headers

### Rate Limiting
- Currently no rate limiting implemented
- Consider implementing for production use

### Error Handling
- All endpoints return consistent error formats
- HTTP status codes follow REST conventions
- Detailed error messages provided

### File Uploads
- Resume uploads support PDF, DOCX, TXT formats
- Maximum file size: 10MB
- Automatic text extraction and processing

### Filtering & Pagination
- List endpoints support query parameter filtering
- Pagination implemented with 20 items per page
- Sorting available on most list endpoints

## 🚀 Quick Start Commands

```bash
# Start the server
cd /Users/akhiltripathi/dev/yogya/backend
source venv/bin/activate
python manage.py runserver 8001

# View interactive documentation
open api_docs.html

# Test endpoints
curl -X GET "http://127.0.0.1:8001/api/"
```

---

**Last Updated**: August 2025  
**Total Endpoints**: 133  
**API Version**: 1.0.0 