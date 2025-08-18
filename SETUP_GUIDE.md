# Yogya Project Setup Guide

Complete setup guide for the Yogya competency-based hiring platform.

## 📋 Prerequisites

### System Requirements
- **OS**: Windows 10+, macOS 10.15+, or Ubuntu 18.04+
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher
- **Git**: Latest version
- **Database**: PostgreSQL 12+ (recommended) or SQLite (for development)

### Development Tools
- **Code Editor**: VS Code (recommended)
- **Terminal**: Git Bash, PowerShell, or Terminal
- **Browser**: Chrome, Firefox, or Safari (latest versions)

## 🚀 Quick Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd yogya
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Configuration
Create `.env` file in `backend/` directory:
```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3
# For PostgreSQL: postgresql://user:password@localhost:5432/yogya

# AI Integration
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

#### Database Setup
```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load test data (optional)
python setup_e2e_testing.py
```

#### Start Backend Server
```bash
python manage.py runserver 8001
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Environment Configuration
Create `.env` file in `frontend/` directory:
```env
VITE_API_URL=http://localhost:8001
VITE_APP_NAME=Yogya
```

#### Start Development Server
```bash
npm run dev
```

## 🗄️ Database Setup

### SQLite (Development)
```bash
# Default configuration - no additional setup needed
python manage.py migrate
```

### PostgreSQL (Production)
```bash
# Install PostgreSQL
# Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# macOS:
brew install postgresql

# Windows:
# Download from https://www.postgresql.org/download/windows/

# Create database
sudo -u postgres psql
CREATE DATABASE yogya;
CREATE USER yogya_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE yogya TO yogya_user;
\q

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://yogya_user:your_password@localhost:5432/yogya
```

## 🔧 Configuration

### Django Settings
Key settings in `backend/yogya_project/settings.py`:

```python
# Installed Apps
INSTALLED_APPS = [
    'user_management',
    'resume_checker',
    'candidate_ranking',
    'interview_management',
    'interviewer',
    'hiring_manager',
    # ... other apps
]

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Static Files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

### Frontend Configuration
Key settings in `frontend/vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
})
```

## 🧪 Testing Setup

### Backend Testing
```bash
cd backend
python manage.py test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### E2E Testing
```bash
cd backend
python setup_e2e_testing.py
```

## 📦 Production Deployment

### Backend Deployment
```bash
# Install production dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic

# Run migrations
python manage.py migrate

# Start with Gunicorn
gunicorn yogya_project.wsgi:application --bind 0.0.0.0:8001
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve with nginx or similar
```

## 🔐 Security Configuration

### Environment Variables
```env
# Production settings
DEBUG=False
SECRET_KEY=your-very-secure-secret-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# SSL/HTTPS
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
```

### API Keys
- **Gemini API**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **OpenAI API**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Port already in use
lsof -ti:8001 | xargs kill -9

# Migration conflicts
python manage.py makemigrations
python manage.py migrate

# Static files not loading
python manage.py collectstatic
```

#### Frontend Issues
```bash
# Node modules corrupted
rm -rf node_modules package-lock.json
npm install

# Port conflicts
npm run dev -- --port 3000
```

#### Database Issues
```bash
# Reset database
python manage.py flush --no-input
python setup_e2e_testing.py

# Check database connection
python manage.py dbshell
```

### Logs
```bash
# Django logs
tail -f backend/logs/django.log

# Frontend logs
npm run dev 2>&1 | tee frontend.log
```

## 📚 Additional Resources

### Documentation
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)

### API Documentation
- Backend API: `http://localhost:8001/api/`
- Frontend API: Check `frontend/src/services/`

### Development Tools
- **Django Debug Toolbar**: For backend debugging
- **React Developer Tools**: For frontend debugging
- **Postman**: For API testing

## 🚀 Next Steps

After successful setup:

1. **Test the Application**:
   - Login with test credentials
   - Create a job description
   - Schedule an interview
   - Test candidate ranking

2. **Customize Configuration**:
   - Update branding and colors
   - Configure email settings
   - Set up custom domains

3. **Deploy to Production**:
   - Set up production database
   - Configure SSL certificates
   - Set up monitoring and logging

4. **Add Features**:
   - Audio-video integration
   - Real-time notifications
   - Advanced analytics

---

**Support**: For issues and questions, check the [Testing Guide](./TESTING_GUIDE.md) or create an issue in the repository.
