# Yogya - AI-Powered Recruitment Platform

## Overview

Yogya is a comprehensive AI-powered recruitment platform that streamlines the entire hiring process from job posting to candidate selection. Built with Django and React, it provides intelligent candidate matching, automated resume parsing, and advanced analytics.

## Features

### 🎯 Core Modules

#### 1. **Candidate Ranking System** ⭐ NEW
- **AI-Powered Matching**: Intelligent candidate-job matching based on skills, experience, education, and location
- **Multi-criteria Evaluation**: Configurable weights for different ranking criteria
- **Real-time Analytics**: Comprehensive insights and performance metrics
- **Status Management**: Shortlist, reject, and track candidate progress
- **Batch Processing**: Process multiple candidates simultaneously

#### 2. **Resume Parser & Analyzer**
- **AI-Powered Extraction**: Automatically extract skills, experience, and education
- **Smart Matching**: Match candidates to job requirements
- **PDF/Word Support**: Parse multiple document formats
- **Skill Gap Analysis**: Identify missing skills and training needs

#### 3. **Job Management**
- **Smart Job Posting**: AI-assisted job description creation
- **Skill Extraction**: Automatic skill identification from job descriptions
- **Application Tracking**: Comprehensive application management
- **Status Workflow**: Track applications through hiring pipeline

#### 4. **Candidate Portal**
- **Profile Management**: Comprehensive candidate profiles
- **Application Tracking**: Real-time application status updates
- **Job Recommendations**: AI-powered job suggestions
- **Resume Builder**: Professional resume creation tools

#### 5. **HR Dashboard**
- **Analytics Dashboard**: Real-time hiring metrics and insights
- **Candidate Management**: Complete candidate lifecycle management
- **Interview Scheduling**: Integrated interview management
- **Reporting**: Comprehensive hiring reports and analytics

#### 6. **AI Recommendation Engine**
- **Smart Matching**: AI-powered candidate-job matching
- **Skill Analysis**: Advanced skill gap analysis
- **Performance Prediction**: Predict candidate success probability
- **Continuous Learning**: Self-improving recommendation algorithms

### 🛠 Technical Features

- **Modern Tech Stack**: Django 5.0 + React 19 + Material-UI
- **RESTful APIs**: Complete API for frontend integration
- **JWT Authentication**: Secure token-based authentication
- **Database**: PostgreSQL with optimized queries
- **Real-time Updates**: WebSocket support for live updates
- **Responsive Design**: Mobile-first responsive UI
- **Admin Interface**: Comprehensive Django admin integration

## Architecture

### Backend (Django)
```
yogya/
├── backend/
│   ├── yogya_project/          # Main Django project
│   ├── resume_checker/         # Resume parsing & analysis
│   ├── candidate_ranking/      # ⭐ NEW: Candidate ranking system
│   ├── user_management/        # User authentication & profiles
│   ├── competency_hiring/      # Competency assessment
│   ├── code_executor/          # Code evaluation system
│   └── test_ranking_system.py  # Ranking system tests
```

### Frontend (React)
```
yogya/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HR/
│   │   │   │   ├── CandidateRanking.jsx    # ⭐ NEW: Ranking interface
│   │   │   │   ├── RankingAnalytics.jsx    # ⭐ NEW: Analytics dashboard
│   │   │   │   └── ...
│   │   │   ├── Candidate/
│   │   │   └── Navigation/
│   │   ├── services/
│   │   │   └── rankingService.js           # ⭐ NEW: Ranking API service
│   │   └── ...
```

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (optional, SQLite for development)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8001
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **Admin Panel**: http://localhost:8001/admin

## Candidate Ranking System

### 🎯 Key Features
- **Intelligent Scoring**: Multi-criteria evaluation algorithm
- **Customizable Weights**: Configurable importance for skills, experience, education, location
- **Real-time Analytics**: Live insights and performance metrics
- **Batch Processing**: Process multiple candidates efficiently
- **Status Management**: Shortlist, reject, and track candidates

### 📊 Scoring Algorithm
- **Skills Matching** (40%): Exact, partial, and gap analysis
- **Experience Matching** (30%): Overqualified, well-matched, underqualified
- **Education Matching** (20%): Level and field relevance
- **Location Matching** (10%): Geographic compatibility

### 🔧 API Endpoints
```bash
# Ranking Operations
POST /api/candidate-ranking/rank/           # Rank candidates
GET  /api/candidate-ranking/job/{id}/       # Get job rankings
PUT  /api/candidate-ranking/ranking/{id}/status/  # Update status

# Analytics
GET  /api/candidate-ranking/analytics/{id}/ # Get analytics
GET  /api/candidate-ranking/batches/        # Get batches
GET  /api/candidate-ranking/criteria/       # Get criteria

# Jobs & Candidates
GET  /api/jobs/active/                      # Get active jobs
GET  /api/jobs/{id}/candidates/             # Get job candidates
```

### 📈 Analytics Dashboard
- **Score Statistics**: Average, max, min scores
- **Score Distribution**: High/medium/low match percentages
- **Candidate Status**: Top candidates, shortlisted, rejected counts
- **Experience Analysis**: Overqualified, well-matched, underqualified breakdown

## API Documentation

### Authentication
All API endpoints require JWT authentication:
```bash
Authorization: Bearer <your-jwt-token>
```

### Example API Calls

#### Rank Candidates
```bash
POST /api/candidate-ranking/rank/
{
  "job_id": "JOB-XXXXXX",
  "candidate_ids": ["CAN-XXXXXX", "CAN-YYYYYY"],
  "criteria_id": "optional-criteria-id"
}
```

#### Get Job Rankings
```bash
GET /api/candidate-ranking/job/JOB-XXXXXX/
```

#### Update Candidate Status
```bash
PUT /api/candidate-ranking/ranking/RANK-XXXXXX/status/
{
  "is_shortlisted": true,
  "is_rejected": false,
  "hr_notes": "Strong technical skills"
}
```

## Development

### Project Structure
```
yogya/
├── backend/                    # Django backend
│   ├── candidate_ranking/      # ⭐ NEW: Ranking system
│   ├── resume_checker/         # Resume parsing
│   ├── user_management/        # User management
│   └── ...
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/HR/      # HR components
│   │   ├── services/           # API services
│   │   └── ...
└── docs/                       # Documentation
```

### Testing
```bash
# Backend tests
cd backend
python manage.py test

# Ranking system tests
python test_ranking_system.py

# Frontend tests
cd frontend
npm test
```

### Code Standards
- **Python**: PEP 8, type hints, docstrings
- **JavaScript**: ESLint, Prettier, JSDoc
- **React**: Functional components, hooks, Material-UI
- **Django**: Class-based views, serializers, models

## Deployment

### Production Setup
1. **Environment Variables**
   ```bash
   DEBUG=False
   SECRET_KEY=your-secret-key
   DATABASE_URL=postgresql://...
   ALLOWED_HOSTS=your-domain.com
   ```

2. **Static Files**
   ```bash
   python manage.py collectstatic
   ```

3. **Database**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```

### Docker Deployment
```bash
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Write comprehensive tests
- Update documentation
- Follow code standards
- Add type hints (Python)
- Use meaningful commit messages

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check JWT token configuration
   - Verify token expiration
   - Ensure proper headers

2. **Database Errors**
   - Run migrations: `python manage.py migrate`
   - Check model relationships
   - Verify database connection

3. **API Errors**
   - Check URL patterns
   - Verify request format
   - Check authentication headers

4. **Frontend Issues**
   - Clear browser cache
   - Check console errors
   - Verify API endpoints

### Debug Mode
Enable debug logging in Django settings:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'candidate_ranking': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## Roadmap

### 🚀 Upcoming Features
- **Advanced AI Models**: Machine learning-based ranking
- **Interview Scheduling**: Integrated interview management
- **Email Notifications**: Automated candidate communication
- **Bulk Operations**: Mass shortlist/reject functionality
- **Export Features**: CSV/PDF export capabilities
- **Mobile App**: React Native mobile application

### 🔧 Performance Optimizations
- **Caching**: Redis-based caching for rankings
- **Async Processing**: Celery for background ranking jobs
- **Database Optimization**: Query optimization and indexing
- **API Rate Limiting**: Request throttling and monitoring

## Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create an issue in the repository
- **Discussions**: Use GitHub Discussions
- **Email**: Contact the development team

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Django**: Web framework
- **React**: Frontend library
- **Material-UI**: UI component library
- **OpenAI**: AI capabilities
- **Community**: Contributors and supporters

---

**Yogya** - Transforming recruitment with AI-powered intelligence 🤖✨ 