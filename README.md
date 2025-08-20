# Yogya - Hire for Competence, not Just Credentials

## Overview

Yogya is a transformative competency-based hiring platform that goes beyond traditional resume screening. Built with Django and React, it implements **STAR/CAR behavioral interviewing methodology** to assess candidates based on demonstrated capabilities rather than just credentials. Yogya empowers organizations to hire smarter, faster, and more fairly using AI-powered intelligence.

## Core Philosophy

### 🎯 **Why Competency-Based Over Traditional?**

**❌ Traditional Approach (Bias-Prone):**
- Tests memory, not behavior
- Favors candidates who memorized specific topics
- Doesn't predict real-world performance
- High bias risk based on educational background

**✅ Competency-Based Approach (Bias-Resistant):**
- Tests problem-solving, ownership, and communication
- Evaluates actual behavior and decision-making
- Predicts real-world performance
- Reduces bias by focusing on demonstrated capabilities

## 🚀 **Key Differentiators**

### **Automatic Candidate Ranking** ⭐ CORE USP
Yogya's **automatic candidate ranking system** is a game-changer in hiring:

**🎯 How It Works:**
1. **Candidate applies** to a job
2. **System automatically generates rankings** based on skills, experience, education, and location
3. **HR sees ranked candidates immediately** - no manual work needed
4. **Real-time updates** as new candidates apply

**💡 Business Value:**
- **Instant HR Insights**: No waiting for manual candidate evaluation
- **Consistent Evaluation**: Standardized ranking across all jobs
- **Time Savings**: HR teams focus on decisions, not data processing
- **Scalability**: Handles hundreds of applications automatically

**🔧 Technical Excellence:**
- **Multi-factor scoring** (Skills 40%, Experience 30%, Education 20%, Location 10%)
- **Real-time processing** with intelligent algorithms
- **Seamless integration** with existing hiring workflows

## Features

### 🎯 Core Modules

#### 1. **Competency Engine** ⭐ CORE
- **STAR/CAR Behavioral Assessment**: Structured behavioral interviewing methodology
- **6 Core Competencies**: Problem Solving, Communication, Collaboration, Ownership, Learning Agility, Technical Depth
- **Bias-Resistant Design**: Focus on behavior, not background/education
- **Weighted Scoring**: Transparent competency-based evaluation
- **AI-Ready Architecture**: Built for AI integration and automation

#### 2. **Candidate Ranking System** ⭐ CORE USP
- **Automatic Ranking Generation**: Real-time rankings when candidates apply to jobs
- **AI-Powered Matching**: Intelligent candidate-job matching based on skills, experience, education, and location
- **Multi-criteria Evaluation**: Configurable weights for different ranking criteria (Skills 40%, Experience 30%, Education 20%, Location 10%)
- **Real-time Analytics**: Comprehensive insights and performance metrics
- **Status Management**: Shortlist, reject, and track candidate progress
- **Batch Processing**: Process multiple candidates simultaneously
- **Instant HR Visibility**: New candidates appear in rankings immediately after application

#### 3. **Resume Parser & Analyzer**
- **AI-Powered Extraction**: Automatically extract skills, experience, and education
- **Smart Matching**: Match candidates to job requirements
- **PDF/Word Support**: Parse multiple document formats
- **Skill Gap Analysis**: Identify missing skills and training needs

#### 4. **Job Management**
- **Smart Job Posting**: AI-assisted job description creation
- **Skill Extraction**: Automatic skill identification from job descriptions
- **Application Tracking**: Comprehensive application management
- **Status Workflow**: Track applications through hiring pipeline

#### 5. **Candidate Portal**
- **Profile Management**: Comprehensive candidate profiles
- **Application Tracking**: Real-time application status updates
- **Interview Management**: ⭐ NEW: View and join scheduled interviews
- **Job Recommendations**: AI-powered job suggestions
- **Resume Builder**: Professional resume creation tools
- **Interview Dashboard**: Complete overview of all interviews
- **Interview Details**: Comprehensive interview information and status
- **Join Functionality**: Easy interview joining with meeting links
- **Interview History**: Complete interview records and feedback

#### 6. **HR Dashboard**
- **Analytics Dashboard**: Real-time hiring metrics and insights
- **Candidate Management**: Complete candidate lifecycle management
- **Interview Scheduling**: ⭐ NEW: Comprehensive interview scheduling interface
- **Reporting**: Comprehensive hiring reports and analytics
- **Advanced Scheduling Form**: Candidate, job, and interviewer selection
- **AI Assistant Settings**: Configurable AI settings for interviews
- **Meeting Link Generation**: Automatic meeting link creation
- **Interview Management**: Edit, delete, reschedule functionality
- **Interview Feedback Integration**: Unified feedback within candidate rankings
- **Organization Management**: ⭐ NEW: Dynamic organization setup and management
- **Email Domain Integration**: Automatic organization detection from email domains
- **Mandatory Setup Flow**: Organization setup required before dashboard access
- **Settings Integration**: Editable organization settings in user preferences

#### 7. **Interviewer System** ⭐ NEW
- **Human + AI Hybrid Interviews**: Collaborative interviewing with AI assistance
- **Live Interview Interface**: Real-time video/audio interview platform
- **AI-Powered Suggestions**: Real-time AI recommendations during interviews
- **Competency Assessment**: Structured evaluation using STAR/CAR methodology
- **Interview Recording**: Audio/video recording with transcription
- **Assessment Tools**: Comprehensive rating and feedback system
- **Interview Analytics**: Performance insights and improvement recommendations
- **Interview Dashboard**: Complete interviewer management interface
- **Live Interview Controls**: Start, pause, stop, complete functionality
- **Question Management**: Dynamic question handling and candidate response input

#### 8. **AI Recommendation Engine**
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
- **Gemini AI Integration**: Advanced AI capabilities for question generation and assessment

## Architecture

### Backend (Django)
```
yogya/
├── backend/
│   ├── yogya_project/          # Main Django project
│   ├── competency_hiring/      # 🧠 CORE: Competency engine & behavioral assessment
│   ├── candidate_ranking/      # ⭐ NEW: Candidate ranking system
│   ├── interview_scheduling/   # ⭐ NEW: Interview scheduling management
│   ├── interview_management/   # ⭐ NEW: Interview lifecycle management
│   ├── interview_feedback/     # ⭐ NEW: Feedback collection and analysis
│   ├── resume_checker/         # Resume parsing & analysis
│   ├── user_management/        # User authentication & profiles
│   ├── code_executor/          # Code evaluation system
│   └── test_ranking_system.py  # Ranking system tests
```

### Frontend (React)
```
yogya/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/              # Authentication components
│   │   │   ├── HR/                # HR dashboard components
│   │   │   │   ├── CandidateRanking.jsx      # ⭐ NEW: Candidate ranking interface
│   │   │   │   └── InterviewScheduler.jsx    # ⭐ NEW: Interview scheduling interface
│   │   │   ├── Candidate/         # Candidate portal components
│   │   │   │   └── InterviewManager.jsx      # ⭐ NEW: Candidate interview management
│   │   │   ├── Interviewer/       # ⭐ NEW: Interviewer system components
│   │   │   │   ├── InterviewDashboard.jsx    # Interview management dashboard
│   │   │   │   └── LiveInterviewInterface.jsx # Live interview interface
│   │   │   └── Navigation/        # Navigation components (collapsible sidebar)
│   │   ├── services/
│   │   │   ├── rankingService.js              # ⭐ NEW: Candidate ranking API service
│   │   │   ├── interviewerService.js          # ⭐ NEW: Interviewer API service
│   │   │   ├── candidateInterviewService.js   # ⭐ NEW: Candidate interview API service
│   │   │   └── interviewSchedulerService.js   # ⭐ NEW: Interview scheduling API service
│   │   └── App.jsx                # Main application component
```

## Competency Engine

### 🧠 **Core Competencies**
Yogya's competency engine is built around **6 core competencies** that predict real-world job performance:

| Competency | Description | STAR Prompt | Weightage |
|------------|-------------|-------------|-----------|
| **Problem Solving** | Logical breakdown, analytical thinking | "Tell me about a time you debugged a critical bug." | 20% |
| **Communication** | Clarity in expressing ideas, especially technical concepts | "Describe a time you had to explain tech to a non-tech stakeholder." | 15% |
| **Collaboration** | Teamwork, conflict resolution | "When did you help a struggling team member?" | 15% |
| **Ownership** | Initiative, accountability | "Give an example where you took ownership of a delivery." | 20% |
| **Learning Agility** | Curiosity, adaptability | "Tell me when you picked up a new tech under tight deadline." | 10% |
| **Technical Depth** | Engineering fundamentals, architecture thinking | "Describe the most complex system you've built or contributed to." | 20% |

### 🎭 **STAR/CAR Methodology**
- **STAR**: Situation, Task, Action, Result
- **CAR**: Context, Action, Result
- **SOAR**: Situation, Obstacle, Action, Result

### 🏗️ **Competency Framework System**
- **CompetencyFramework**: Role-specific frameworks (e.g., "Python Developer - Mid Level")
- **Competency**: Individual competencies with behavioral methodology
- **InterviewTemplate**: Structured interview templates with weighted competencies
- **InterviewQuestion**: Questions mapped to specific competencies
- **CompetencyEvaluation**: Structured scoring with transparency and audit trail

## Quick Start

### 🚀 Automated Setup (Recommended)

We provide automated setup scripts for seamless installation:

#### For macOS/Linux Users
```bash
# Clone the repository
git clone <repository-url>
cd yogya

# Run the setup script
./setup.sh
```

#### For Windows Users
```powershell
# Clone the repository
git clone <repository-url>
cd yogya

# Run the PowerShell script
.\setup.ps1
```

The setup scripts will:
- ✅ Check system requirements (Python 3.8+, Node.js 16+)
- 🐍 Create Python virtual environment
- 📦 Install all dependencies
- 🗄️ Set up database and run migrations
- 👤 Create default admin user
- ⚙️ Configure environment settings
- 🚀 Optionally start development servers

📖 **Detailed Setup Guide**: [Setup Scripts Documentation](./SETUP_SCRIPTS_README.md)

### 🔧 Manual Setup (Alternative)

#### Prerequisites
- Python 3.8+
- Node.js 16+
- Git
- PostgreSQL (optional, SQLite for development)

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_md
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8001
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 🌐 Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001
- **Admin Panel**: http://localhost:8001/admin
- **API Documentation**: http://localhost:8001/api/

### 🔑 Default Credentials
- **Email**: `admin@yogya.com`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials in production!

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
- **Real-time Interview Platform**: Live video/audio interview capabilities
- **Email Notifications**: Automated candidate communication
- **Bulk Operations**: Mass shortlist/reject functionality
- **Export Features**: CSV/PDF export capabilities
- **Mobile App**: React Native mobile application
- **Calendar Integration**: Native calendar app integration
- **Video Platform Integration**: Direct integration with video platforms

### 🔧 Performance Optimizations
- **Caching**: Redis-based caching for rankings
- **Async Processing**: Celery for background ranking jobs
- **Database Optimization**: Query optimization and indexing
- **API Rate Limiting**: Request throttling and monitoring

## Support

- **Documentation**: [📚 Comprehensive Documentation](./docs/README.md)
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