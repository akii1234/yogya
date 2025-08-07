# Yogya Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **Backend Issues**

#### **1. NLTK WordNet Warning**
```
NLTK wordnet not found
```

**Solution:**
```bash
cd backend
python manage.py setup_nltk
```

#### **2. Database Migration Errors**
```
django.db.utils.OperationalError: no such table
```

**Solution:**
```bash
python manage.py makemigrations
python manage.py migrate
```

#### **3. JWT Token Issues**
```
Invalid token header
```

**Solution:**
- Clear browser cache and cookies
- Re-login to get new token
- Check token expiration settings

#### **4. File Upload Errors**
```
413 Request Entity Too Large
```

**Solution:**
```python
# settings.py
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760
```

### **Frontend Issues**

#### **1. Blank Page After Login**
**Symptoms:** Page goes blank, console shows errors

**Solutions:**
```javascript
// Check authentication state
console.log('Auth state:', authState);

// Clear localStorage and re-login
localStorage.clear();
sessionStorage.clear();
```

#### **2. API Connection Errors**
```
Failed to fetch
```

**Solutions:**
- Verify backend server is running on port 8001
- Check CORS configuration
- Ensure API base URL is correct

#### **3. Component Not Rendering**
**Symptoms:** Components show loading indefinitely

**Solutions:**
```javascript
// Add error boundaries
// Check API responses
// Verify data structure
```

### **Resume Analysis Issues**

#### **1. Skills Not Extracted**
**Symptoms:** Resume uploaded but no skills found

**Solutions:**
- Check resume format (PDF, DOCX, DOC, TXT)
- Ensure resume contains skill keywords
- Try different resume format
- Check NLTK data installation

#### **2. Experience Not Calculated**
**Symptoms:** Experience years showing as 0

**Solutions:**
- Verify resume has clear date formats
- Check for work history sections
- Ensure job titles are recognizable

#### **3. Processing Stuck**
**Symptoms:** Resume stuck in "processing" status

**Solutions:**
```bash
# Restart backend server
python manage.py runserver 8001

# Check logs for errors
tail -f logs/django.log
```

### **Job Matching Issues**

#### **1. No Jobs Showing**
**Symptoms:** Browse jobs page is empty

**Solutions:**
- Check if jobs exist in database
- Verify job status is "active"
- Check match score filters
- Ensure candidate profile is complete

#### **2. Low Match Scores**
**Symptoms:** All jobs showing low match scores

**Solutions:**
- Update candidate skills
- Add missing experience
- Check job requirements
- Use Resume Analyzer to identify gaps

#### **3. Match Calculation Errors**
**Symptoms:** Match scores not calculating

**Solutions:**
```python
# Check scoring weights
SCORING_WEIGHTS = {
    'skills': 0.40,
    'experience': 0.30,
    'education': 0.20,
    'location': 0.10
}
```

### **Coding Questions Issues**

#### **1. Questions Not Loading**
**Symptoms:** Coding questions tab shows no questions

**Solutions:**
```bash
# Check if questions database exists
ls backend/resume_checker/data/full_coding_questions_database.json

# Regenerate if missing
python manage.py setup_coding_questions
```

#### **2. Wrong Questions Selected**
**Symptoms:** Questions don't match skills/experience

**Solutions:**
- Update candidate skills
- Check experience level calculation
- Verify technology mapping

### **AI Integration Issues**

#### **1. o1-mini Not Responding**
**Symptoms:** AI insights not generating

**Solutions:**
```python
# Check Hugging Face token
HUGGINGFACE_API_TOKEN = os.getenv('HUGGINGFACE_API_TOKEN')

# Verify model URL
O1_MINI_MODEL_URL = "https://api-inference.huggingface.co/models/o1-labs/o1-mini"
```

#### **2. AI Fallback Not Working**
**Symptoms:** No AI insights at all

**Solutions:**
- Check fallback responses are configured
- Verify AI enhancement is enabled
- Check API rate limits

## 🔧 **Debug Commands**

### **Backend Debugging**
```bash
# Check Django status
python manage.py check

# Test database connection
python manage.py dbshell

# Check installed packages
pip list

# View Django logs
tail -f logs/django.log

# Test specific endpoint
curl -X GET http://localhost:8001/api/health/
```

### **Frontend Debugging**
```bash
# Check Node modules
npm list

# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check build
npm run build
```

### **Database Debugging**
```bash
# Check database tables
python manage.py dbshell
\dt

# Check specific model
python manage.py shell
from resume_checker.models import JobDescription
JobDescription.objects.count()
```

## 📊 **Performance Issues**

### **Slow Resume Processing**
**Solutions:**
- Increase server resources
- Implement async processing
- Add caching for processed resumes
- Optimize NLP models

### **Slow Job Matching**
**Solutions:**
- Add database indexes
- Implement background tasks
- Cache match results
- Optimize scoring algorithms

### **Frontend Performance**
**Solutions:**
- Implement lazy loading
- Add pagination
- Optimize bundle size
- Use React.memo for components

## 🔍 **Log Analysis**

### **Django Logs**
```bash
# View error logs
tail -f logs/error.log

# Search for specific errors
grep "ERROR" logs/django.log

# Monitor API requests
grep "POST /api" logs/access.log
```

### **Frontend Logs**
```javascript
// Add debug logging
console.log('API Response:', response);
console.log('Component State:', state);
console.log('Props:', props);
```

## 🚀 **Recovery Procedures**

### **Complete System Reset**
```bash
# Backend reset
cd backend
python manage.py flush
python manage.py migrate
python manage.py createsuperuser

# Frontend reset
cd frontend
rm -rf node_modules
npm install
npm run dev
```

### **Database Recovery**
```bash
# Backup database
pg_dump yogya_db > backup.sql

# Restore database
psql yogya_db < backup.sql

# Reset migrations
python manage.py migrate --fake-initial
```

### **User Data Recovery**
```bash
# Export user data
python manage.py dumpdata auth.User > users.json

# Import user data
python manage.py loaddata users.json
```

## 📞 **Getting Help**

### **Support Channels**
- **Email**: support@yogya.com
- **GitHub Issues**: [Create Issue](https://github.com/your-org/yogya/issues)
- **Documentation**: Check this guide and API docs
- **Community**: Join user forums

### **Information to Provide**
When reporting issues, include:
- Error messages and stack traces
- Steps to reproduce
- Environment details (OS, Python version, etc.)
- Screenshots if applicable
- Browser console logs for frontend issues

### **Self-Service Solutions**
- Check this troubleshooting guide
- Review API documentation
- Test with sample data
- Verify environment setup

---

**Yogya** - Comprehensive troubleshooting for AI-powered hiring. 🚀 