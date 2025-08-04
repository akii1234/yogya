# Yogya - AI-Powered Competency-Based Hiring Platform

## 🎯 Project Overview

Yogya is a revolutionary **competency-based hiring platform** that transforms traditional recruitment by focusing on what candidates can actually do, not just what their resumes say. We combine advanced AI with structured behavioral evaluation to eliminate bias and identify real potential.

## 🏗️ Project Architecture

```
yogya/
├── backend/                 # Django REST API
│   ├── yogya_project/      # Django project configuration
│   ├── resume_checker/     # Main Django app with NLP logic
│   ├── requirements.txt    # Python dependencies
│   ├── manage.py          # Django management
│   └── README.md          # Backend documentation
├── frontend/               # React.js frontend application
│   ├── src/               # Source code
│   ├── public/            # Static files
│   └── package.json       # Node.js dependencies
├── test_users.txt         # Test credentials for HR and Candidate users
└── README.md              # This file
```

## 🧪 Test Credentials

For testing the application, use the following credentials:

### HR User
- **Email:** hr@yogya.com
- **Password:** hr123456
- **Access:** Full HR dashboard, job management, candidate management

### Candidate User
- **Email:** candidate@yogya.com
- **Password:** candidate123
- **Access:** Browse jobs, apply to positions, manage profile

📋 **Complete test credentials documentation:** See `test_users.txt` for detailed information including API endpoints, curl commands, and troubleshooting tips.

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

## 🚀 Key Differentiators

### 🤖 Advanced AI Processing
- **Multi-factor Competency Scoring**: Combines skill matching, experience analysis, technical term recognition, and semantic similarity
- **Intelligent Text Processing**: NLTK-based preprocessing with technical term preservation
- **Semantic Understanding**: SpaCy-powered meaning-based matching
- **Experience Parsing**: Sophisticated date and experience extraction

### 📊 Comprehensive Competency Assessment
- **Skill Matching (35%)**: Technical skill and keyword overlap
- **Experience Matching (25%)**: Years of experience with seniority bonuses
- **Technical Term Overlap (25%)**: Framework and tool recognition
- **Semantic Similarity (10%)**: Meaning-based similarity
- **Education & Certification (5%)**: Degree and certification matching

### 📁 File Support
- **PDF Documents**: PyPDF2-based extraction
- **DOCX Files**: python-docx processing
- **Plain Text**: Direct text processing

### 🔧 Technical Features
- **RESTful API**: Django REST Framework
- **Database Models**: Structured data storage
- **Error Handling**: Graceful fallbacks and robust error management
- **Performance Optimization**: Caching and lazy loading

## 🎯 Competency Score Ranges

- **Excellent Match**: 85-100%
- **Good Match**: 70-84%
- **Fair Match**: 50-69%
- **Poor Match**: 0-49%

## 🚀 Quick Start

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Set up virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Start the server:**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## 📚 API Documentation

### Core Endpoints

#### Job Descriptions
- `GET /api/job-descriptions/` - List all job descriptions
- `POST /api/job-descriptions/` - Create a new job description
- `POST /api/job-descriptions/{id}/match-all-resumes/` - Match all resumes with this JD

#### Resumes
- `GET /api/resumes/` - List all resumes
- `POST /api/resumes/` - Upload a new resume
- `POST /api/resumes/{id}/match/` - Match resume with a job description

#### Candidates
- `GET /api/candidates/` - List all candidates
- `POST /api/candidates/` - Create a new candidate

#### Matches
- `GET /api/matches/` - List all matches

### Example Usage

#### Match a Resume with a Job Description

```bash
curl -X POST http://localhost:8000/api/resumes/1/match/ \
  -H "Content-Type: application/json" \
  -d '{"job_description_id": 1}'
```

**Response:**
```json
{
  "resume_id": 1,
  "job_description_id": 1,
  "score": 87.34,
  "match_percentage": 87.34,
  "is_match_above_60_percent": true,
  "detailed_breakdown": {
    "skill_score": 85.0,
    "experience_score": 90.0,
    "technical_score": 88.0,
    "semantic_score": 75.0,
    "education_score": 80.0
  }
}
```

## 🛠️ Technology Stack

### Backend
- **Django 5.2**: Web framework
- **Django REST Framework**: API framework
- **NLTK**: Natural Language Processing
- **SpaCy**: Advanced NLP and semantic similarity
- **Scikit-learn**: Machine learning and vectorization
- **PyPDF2**: PDF text extraction
- **python-docx**: DOCX text extraction

### Frontend (Planned)
- **React**: Frontend framework
- **TypeScript**: Type safety
- **Material-UI**: UI components
- **Axios**: HTTP client

### Database
- **SQLite**: Development database
- **PostgreSQL**: Production database (recommended)

## 🔧 Development

### Backend Development

1. **Activate virtual environment:**
   ```bash
   cd backend
   source venv/bin/activate
   ```

2. **Run tests:**
   ```bash
   python manage.py test
   ```

3. **Check for issues:**
   ```bash
   python manage.py check
   ```

### Code Structure

```
backend/
├── yogya_project/          # Django project settings
│   ├── settings.py         # Main settings
│   ├── urls.py            # URL routing
│   └── wsgi.py            # WSGI configuration
├── resume_checker/         # Main application
│   ├── models.py          # Database models
│   ├── views.py           # API views
│   ├── serializers.py     # Data serialization
│   ├── urls.py            # App URLs
│   └── nlp_utils.py       # NLP processing logic
└── requirements.txt        # Dependencies
```

## 📊 Performance & Optimization

### NLP Optimizations
- **Lazy Loading**: Models loaded on demand
- **Caching**: TF-IDF vectors cached
- **Error Handling**: Graceful fallbacks
- **Memory Management**: Efficient text processing

### API Performance
- **Database Optimization**: Efficient queries
- **Response Caching**: API response caching
- **Async Processing**: Background job support
- **Rate Limiting**: API protection

## 🔒 Security

### Features
- **Input Validation**: Comprehensive validation
- **File Upload Security**: Secure file handling
- **CORS Configuration**: Frontend integration
- **Authentication**: User authentication (planned)

## 🚀 Deployment

### Backend Deployment

1. **Environment Setup:**
   ```bash
   export DEBUG=False
   export SECRET_KEY=your-secret-key
   export ALLOWED_HOSTS=your-domain.com
   ```

2. **Database Migration:**
   ```bash
   python manage.py migrate
   python manage.py collectstatic
   ```

3. **Production Server:**
   ```bash
   gunicorn yogya_project.wsgi:application
   ```

### Docker Deployment

```bash
# Build and run
docker-compose up --build
```

## 📈 Monitoring & Analytics

### Metrics Tracked
- **API Performance**: Response times and throughput
- **NLP Processing**: Model loading and processing times
- **Matching Accuracy**: Score distribution and accuracy
- **User Activity**: API usage patterns

### Health Checks
- **API Health**: `/api/health/`
- **Database Status**: Connection monitoring
- **NLP Models**: Model availability

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests**
5. **Submit a pull request**

### Development Guidelines
- Follow PEP 8 for Python code
- Write comprehensive tests
- Update documentation
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

### Getting Help
1. **Check Documentation**: Review README files
2. **Search Issues**: Look for existing solutions
3. **Create Issue**: Provide detailed information

### Common Issues
- **NumPy Compatibility**: Use `numpy<2.0` for compatibility
- **SpaCy Model**: Ensure `en_core_web_md` is installed
- **NLTK Data**: Download required NLTK corpora

## 🔗 Related Documentation

- [Backend Documentation](./backend/README.md) - Detailed backend setup
- [NLP Architecture](./backend/NLP_ARCHITECTURE.md) - NLP implementation details
- [API Reference](./backend/API_DOCS.md) - Complete API documentation

## 👨‍💻 Developer

**Akhil Tripathi** - Full Stack Developer

- **Email**: [django.devakhil21@gmail.com](mailto:django.devakhil21@gmail.com)
- **GitHub**: [akii1234](https://github.com/akii1234)
- **LinkedIn**: [Akhil Tripathi](https://www.linkedin.com/in/akhil-tripathi-21/)

### 🚀 About the Developer

Akhil is a passionate developer with expertise in:
- **Django & Python Development**
- **Natural Language Processing (NLP)**
- **React.js & Modern Frontend Development**
- **Machine Learning & AI Integration**
- **Full-Stack Application Architecture**

### 💬 Get in Touch

Feel free to reach out for:
- **Technical Questions** about the codebase
- **Feature Requests** or improvements
- **Bug Reports** and issues
- **Collaboration Opportunities**
- **Consultation** on similar projects
- **General Discussion** about the platform

**Response Time**: Usually within 24-48 hours

## 🎉 Acknowledgments

- **NLTK Team**: Natural Language Processing toolkit
- **SpaCy Team**: Advanced NLP library
- **Django Team**: Web framework
- **Scikit-learn Team**: Machine learning library

---

**Yogya** - Intelligent Resume-JD Matching with Advanced NLP 🚀

*Built with ❤️ by Akhil Tripathi* 