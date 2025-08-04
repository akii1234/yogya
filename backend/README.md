# Yogya Backend - AI-Powered Competency-Based Hiring Platform

## 🎯 Project Overview

Yogya is a revolutionary **competency-based hiring platform** that transforms traditional recruitment by focusing on what candidates can actually do, not just what their resumes say. This backend provides the AI-powered intelligence and structured evaluation frameworks that make fair, bias-resistant hiring possible.

## 🚀 Core Philosophy

### 🎯 **Beyond Resumes. Towards Real Potential.**

Yogya is built on the principle that **competency matters more than credentials**. We don't want hiring to be reduced to keyword matching or arbitrary questions. We want to eliminate bias by focusing on competency, not memory.

### 🔹 **STAR/CAR-Based Evaluation**
- **Situation/Task**: Understanding context and challenges
- **Action**: What the candidate actually did
- **Result**: Measurable outcomes and impact
- **Competency**: Mapping to specific job requirements

### 🔹 **Human-in-the-Loop AI**
- AI assists, doesn't replace human judgment
- Structured evaluation frameworks
- Transparent scoring and reasoning
- Bias-resistant assessment design

## 🏗️ Architecture Overview

```
yogya/backend/
├── yogya_project/          # Django project configuration
│   ├── settings.py         # Project settings and configurations
│   ├── urls.py            # Main URL routing
│   └── wsgi.py            # WSGI application entry point
├── resume_checker/         # Main Django app
│   ├── models.py          # Database models (JobDescription, Candidate, etc.)
│   ├── views.py           # API views and business logic
│   ├── serializers.py     # DRF serializers for API responses
│   ├── nlp_utils.py       # NLP processing utilities
│   └── urls.py            # App-specific URL routing
├── user_management/        # User authentication and profiles
│   ├── models.py          # User, HRProfile, CandidateProfile models
│   ├── views.py           # Authentication and profile management
│   └── serializers.py     # User-related serializers
├── requirements.txt        # Python dependencies
├── manage.py              # Django management script
└── README.md              # This file
```

## 🚀 Key Features

### 🤖 **AI-Powered Competency Assessment**
- **Multi-factor Scoring**: Combines skill matching, experience analysis, technical term recognition, and semantic similarity
- **NLP Processing**: Advanced text analysis using NLTK and SpaCy
- **Semantic Understanding**: Meaning-based matching beyond keywords
- **Bias-Resistant Design**: Structured evaluation frameworks

### 📊 **Comprehensive Evaluation System**
- **Skill Matching (35%)**: Technical skill and keyword overlap
- **Experience Matching (25%)**: Years of experience with seniority bonuses
- **Technical Term Overlap (25%)**: Framework and tool recognition
- **Semantic Similarity (10%)**: Meaning-based similarity
- **Education & Certification (5%)**: Degree and certification matching

### 🔧 **Technical Capabilities**
- **RESTful APIs**: Complete API ecosystem for frontend integration
- **JWT Authentication**: Secure, stateless authentication
- **File Processing**: PDF, DOCX, and text file support
- **Database Models**: Structured data storage with relationships
- **Error Handling**: Graceful fallbacks and robust error management

## 🎯 Competency Score Ranges

- **Excellent Match**: 85-100%
- **Good Match**: 70-84%
- **Fair Match**: 50-69%
- **Poor Match**: 0-49%

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip
- virtualenv (recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd yogya/backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   # Create .env file with your configurations
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/`

## 📚 API Documentation

### Core Endpoints

#### Authentication
- `POST /api/token/` - Obtain JWT tokens
- `POST /api/token/refresh/` - Refresh access token
- `POST /api/token/verify/` - Verify token validity

#### User Management
- `POST /api/users/auth/register/` - User registration
- `GET /api/users/profiles/me/` - Get user profile
- `PUT /api/users/profiles/update_profile/` - Update user profile

#### Job Management
- `GET /api/job_descriptions/` - List job descriptions
- `POST /api/job_descriptions/` - Create job description
- `GET /api/job_descriptions/{id}/` - Get specific job
- `PUT /api/job_descriptions/{id}/` - Update job description
- `DELETE /api/job_descriptions/{id}/` - Delete job description

#### Candidate Portal
- `GET /api/candidate-portal/browse-jobs/` - Browse available jobs
- `POST /api/candidate-portal/apply-job/` - Apply to job
- `GET /api/candidate-portal/my-applications/` - View applications
- `POST /api/candidate-portal/upload-resume/` - Upload resume

#### Resume Processing
- `POST /api/resumes/` - Upload and process resume
- `GET /api/resumes/` - List processed resumes
- `POST /api/matches/match-resume/` - Match resume to job
- `POST /api/matches/match-all-resumes/` - Match all resumes to job

#### Competency Management
- `GET /api/competency-frameworks/` - List competency frameworks
- `POST /api/competency-frameworks/` - Create competency framework
- `GET /api/interview-templates/` - List interview templates
- `POST /api/interview-templates/` - Create interview template

## 🔧 Development

### Running Tests
```bash
python manage.py test
```

### Code Quality
```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run linting
flake8 .

# Run type checking
mypy .
```

### Database Management
```bash
# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (development only)
python manage.py flush
```

## 🛠️ Configuration

### Environment Variables
- `DEBUG`: Enable debug mode (True/False)
- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: Database connection string
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `CORS_ALLOWED_ORIGINS`: Frontend origins for CORS

### NLP Configuration
- `NLTK_DATA_PATH`: Path to NLTK data
- `SPACY_MODEL`: SpaCy model to use (default: en_core_web_md)

## 📊 Performance

### Optimization Features
- **Caching**: Redis-based caching for expensive operations
- **Lazy Loading**: Efficient database queries with select_related/prefetch_related
- **Background Tasks**: Celery for async processing
- **Database Indexing**: Optimized database queries

### Monitoring
- **Logging**: Comprehensive logging for debugging
- **Metrics**: Performance metrics collection
- **Error Tracking**: Sentry integration for error monitoring

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens**: Secure, stateless authentication
- **Role-Based Access**: HR, Candidate, and Admin roles
- **Permission System**: Granular permissions for different operations

### Data Protection
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Protection**: Django ORM protection
- **XSS Protection**: Content Security Policy headers
- **CSRF Protection**: Cross-Site Request Forgery protection

## 🚀 Deployment

### Production Setup
1. **Set DEBUG=False** in settings
2. **Configure production database** (PostgreSQL recommended)
3. **Set up static file serving** (nginx/Apache)
4. **Configure SSL certificates**
5. **Set up monitoring and logging**

### Docker Deployment
```bash
# Build image
docker build -t yogya-backend .

# Run container
docker run -p 8000:8000 yogya-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- **Email**: django.devakhil21@gmail.com
- **GitHub**: [Project Issues](https://github.com/your-repo/issues)
- **Documentation**: [API Docs](http://localhost:8000/api/docs/)

---

**Yogya - Beyond Resumes. Towards Real Potential.** 🚀
