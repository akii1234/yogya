# Yogya – Beyond Resumes. Toward Competency. Powered by AI.

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-4.2+-green.svg)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org)
[![AI-Powered](https://img.shields.io/badge/AI--Powered-o1--mini-orange.svg)](https://huggingface.co/models/o1-labs/o1-mini)

**Yogya** is a comprehensive AI-powered interview and recruitment platform that revolutionizes the hiring process through intelligent resume analysis, personalized competency assessment, and dynamic interview preparation.

## 🚀 **Key Features**

### **🤖 AI-Powered Analysis**
- **Intelligent Resume Parsing**: Advanced NLP for skill and experience extraction
- **Smart Job Matching**: AI-driven candidate-job compatibility scoring
- **Personalized Insights**: o1-mini powered career recommendations and interview prep
- **Dynamic Question Generation**: Context-aware coding questions based on resume analysis

### **👥 Candidate Portal**
- **Resume Upload & Analysis**: Automatic skill extraction and profile building
- **Smart Job Browsing**: Filtered job recommendations based on match scores
- **Personalized Coding Questions**: Dynamic questions tailored to skills and experience
- **Interview Preparation**: AI-generated interview guides and behavioral tips
- **Application Tracking**: Real-time status updates and progress monitoring

### **🏢 HR Management Portal**
- **Job Management**: Create, edit, and manage job postings with bulk upload
- **Candidate Analytics**: Comprehensive dashboard with match scores and insights
- **Resume Matching**: AI-powered candidate-job compatibility analysis
- **Application Management**: Track applications and candidate progress

### **📊 Advanced Analytics**
- **Match Score Calculation**: Multi-factor scoring (skills, experience, education, location)
- **Detailed Analysis**: Comprehensive breakdown of candidate-job compatibility
- **Performance Metrics**: Conversion tracking and hiring success analytics
- **Skill Gap Analysis**: Identify areas for candidate improvement

## 🛠 **Technology Stack**

### **Backend**
- **Django 4.2+**: Robust web framework with REST API
- **Django REST Framework**: Powerful API development
- **PostgreSQL**: Reliable database management
- **NLTK & spaCy**: Advanced NLP for resume parsing
- **o1-mini AI**: Hugging Face integration for intelligent insights

### **Frontend**
- **React 18+**: Modern, responsive user interface
- **Material-UI**: Beautiful, accessible component library
- **Vite**: Fast development and build tooling
- **Axios**: Reliable HTTP client for API communication

### **DevOps & Cloud**
- **Docker**: Containerized deployment
- **AWS/GCP Ready**: Cloud-native architecture
- **CI/CD Pipeline**: Automated testing and deployment
- **Monitoring**: Comprehensive logging and error tracking

## 📁 **Project Structure**

```
yogya/
├── backend/                 # Django backend application
│   ├── resume_checker/     # Core resume analysis and matching
│   ├── user_management/    # User authentication and profiles
│   ├── data/              # Coding questions database
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utility functions
│   └── package.json       # Node.js dependencies
├── sample/                # Sample data and test files
└── docs/                  # Project documentation
```

## 🚀 **Quick Start**

### **Prerequisites**
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### **Backend Setup**
```bash
# Clone the repository
git clone <repository-url>
cd yogya/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py migrate
python manage.py setup_nltk  # Download NLTK data

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver 8001
```

### **Frontend Setup**
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Environment Configuration**
Create `.env` files in both backend and frontend directories:

**Backend (.env)**
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/yogya
HUGGINGFACE_API_TOKEN=your-huggingface-token
```

**Frontend (.env)**
```env
VITE_API_BASE_URL=http://localhost:8001/api
VITE_APP_NAME=Yogya
```

## 🎯 **Core Features in Detail**

### **1. Intelligent Resume Analysis**
- **Multi-format Support**: PDF, DOCX, DOC, TXT
- **Skill Extraction**: Advanced NLP for technical and soft skills
- **Experience Parsing**: Automatic years of experience calculation
- **Education Detection**: Degree level and field identification
- **Location Analysis**: Geographic compatibility assessment

### **2. Dynamic Coding Questions**
- **Personalized Selection**: Questions based on resume skills and job requirements
- **Multi-technology Support**: Java, Python, JavaScript, DevOps, Cloud
- **Difficulty Adaptation**: Junior, Mid, Senior level questions
- **Real-world Problems**: Practical coding challenges with solutions
- **Time-based Assessment**: Estimated completion times for each question

### **3. AI-Enhanced Interview Preparation**
- **Personalized Guides**: Tailored interview questions and tips
- **Behavioral Analysis**: AI-generated behavioral question preparation
- **Technical Deep-dive**: Detailed technical question analysis
- **Career Insights**: AI-powered career development recommendations
- **Salary Negotiation**: Market-based salary insights and strategies

### **4. Smart Job Matching**
- **Multi-factor Scoring**: Skills (40%), Experience (30%), Education (20%), Location (10%)
- **Remote Work Detection**: Automatic remote job identification
- **Skill Gap Analysis**: Detailed breakdown of missing skills
- **Improvement Recommendations**: Actionable suggestions for better matches
- **Real-time Updates**: Dynamic scoring based on profile changes

## 📊 **API Documentation**

### **Key Endpoints**

#### **Candidate Portal**
- `POST /api/candidate-portal/analyze-resume/` - Resume analysis and skill extraction
- `GET /api/candidate-portal/browse-jobs/` - Smart job browsing with filters
- `POST /api/candidate-portal/apply-job/` - Job application submission
- `GET /api/candidate-portal/my-applications/` - Application tracking
- `POST /api/candidate-portal/detailed-match-analysis/` - Comprehensive job analysis

#### **HR Management**
- `POST /api/job_descriptions/bulk-upload/` - Bulk job posting
- `GET /api/applications/analytics/` - Application analytics
- `GET /api/job_descriptions/matches/` - Candidate-job matching
- `POST /api/applications/update-status/` - Application status management

#### **User Management**
- `POST /api/users/auth/register/` - User registration
- `POST /api/users/auth/login/` - User authentication
- `GET /api/users/candidate-profiles/my_profile/` - Profile management

## 🧪 **Testing**

### **Backend Testing**
```bash
cd backend
python manage.py test
```

### **Frontend Testing**
```bash
cd frontend
npm test
```

### **API Testing**
```bash
# Test resume analysis
curl -X POST http://localhost:8001/api/candidate-portal/analyze-resume/ \
  -H "Authorization: Bearer <token>" \
  -F "resume_file=@sample_resume.pdf"

# Test job matching
curl -X GET "http://localhost:8001/api/candidate-portal/browse-jobs/?min_match_score=50" \
  -H "Authorization: Bearer <token>"
```

## 🔧 **Configuration**

### **AI Model Configuration**
```python
# settings.py
HUGGINGFACE_API_TOKEN = os.getenv('HUGGINGFACE_API_TOKEN')
O1_MINI_MODEL_URL = "https://api-inference.huggingface.co/models/o1-labs/o1-mini"
AI_ENHANCEMENT_ENABLED = True
```

### **Scoring Weights**
```python
# scoring_utils.py
SCORING_WEIGHTS = {
    'skills': 0.40,
    'experience': 0.30,
    'education': 0.20,
    'location': 0.10
}
```

## 📈 **Performance & Scalability**

### **Optimizations**
- **Database Indexing**: Optimized queries for large datasets
- **Caching**: Redis integration for frequently accessed data
- **Async Processing**: Background tasks for resume analysis
- **CDN Integration**: Static asset optimization
- **Load Balancing**: Horizontal scaling support

### **Monitoring**
- **Application Metrics**: Performance monitoring and alerting
- **Error Tracking**: Comprehensive error logging and analysis
- **User Analytics**: Usage patterns and feature adoption
- **API Performance**: Response time monitoring and optimization

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### **Documentation**
- [API Documentation](docs/API_DOCUMENTATION.md)
- [User Guide](docs/USER_GUIDE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

### **Contact**
- **Issues**: [GitHub Issues](https://github.com/your-org/yogya/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/yogya/discussions)
- **Email**: support@yogya.com

## 🎉 **Acknowledgments**

- **o1-mini**: Hugging Face for AI model integration
- **NLTK & spaCy**: Advanced NLP capabilities
- **Material-UI**: Beautiful React components
- **Django Community**: Robust web framework
- **Open Source Contributors**: All who have contributed to this project

---

**Yogya** - Empowering smarter hiring decisions through AI-powered competency assessment. 🚀 