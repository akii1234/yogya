# Yogya Testing Guide

This guide provides comprehensive testing instructions for the Yogya platform, including setup, test data, and end-to-end testing scenarios.

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL (optional, SQLite works for testing)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd yogya
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 8001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Environment Variables
Create `.env` file in backend directory:
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
GEMINI_API_KEY=your-gemini-api-key
```

## 🧪 Test Data Setup

### Automatic Test Data Creation
Run the E2E testing setup script:
```bash
cd backend
python setup_e2e_testing.py
```

This creates:
- Test users for all roles (HR, Interviewer, Candidate, Hiring Manager)
- Sample job descriptions and postings
- Test candidates with resumes
- Interview sessions and evaluations
- Candidate rankings

### Manual Test Data
If you prefer manual setup, use these credentials:

#### HR User
- **Email**: `hr@yogya.com`
- **Password**: `testpass123`
- **Role**: HR Manager

#### Interviewer User
- **Email**: `interviewer@yogya.com`
- **Password**: `testpass123`
- **Role**: Technical Interviewer

#### Candidate User
- **Email**: `candidate@yogya.com`
- **Password**: `testpass123`
- **Role**: Job Seeker

#### Hiring Manager User
- **Email**: `hiring_manager@yogya.com`
- **Password**: `testpass123`
- **Role**: Hiring Manager

## 🎯 Testing Scenarios

### 1. Organization Setup Flow (NEW)

#### Test Case: First-time HR Login
1. **Setup**: Clear database or use new HR user
2. **Action**: Login as HR user (`hr@yogya.com`)
3. **Expected**: Organization setup modal appears
4. **Action**: Enter organization name (e.g., "TechCorp")
5. **Expected**: Modal closes, dashboard loads
6. **Verify**: Organization appears in job activities

#### Test Case: Organization Settings
1. **Setup**: Login as HR user with existing organization
2. **Action**: Go to Settings → Organization
3. **Action**: Update organization name
4. **Expected**: Success message, organization updated
5. **Verify**: New organization appears in job creation

### 2. Job Management Flow

#### Test Case: Create Job Description
1. **Setup**: Login as HR user
2. **Action**: Navigate to Job Management
3. **Action**: Click "Create New Job"
4. **Action**: Fill job details:
   - Title: "Senior React Developer"
   - Department: "Engineering"
   - Location: "San Francisco, CA"
   - Description: "We are looking for..."
   - Requirements: "React, TypeScript, 3+ years"
5. **Expected**: Job created successfully
6. **Verify**: Job appears in job list

#### Test Case: Job with Dynamic Organization
1. **Setup**: HR user with organization set
2. **Action**: Create new job
3. **Expected**: Company field pre-filled with organization
4. **Verify**: Job activities show "at [Organization]"

### 3. Candidate Ranking Flow

#### Test Case: View Candidate Rankings
1. **Setup**: Login as HR user
2. **Action**: Navigate to Candidate Rankings
3. **Action**: Select a job from dropdown
4. **Expected**: Ranked candidates displayed
5. **Verify**: Scores, skills, and ranking positions shown

#### Test Case: Candidate Actions
1. **Setup**: View candidate rankings
2. **Action**: Click "View" (eye icon) on a candidate
3. **Expected**: Candidate details modal opens
4. **Action**: Click "Schedule Interview"
5. **Expected**: Interview scheduler opens

### 4. Interview Scheduling Flow

#### Test Case: Schedule Interview
1. **Setup**: Login as HR user
2. **Action**: Navigate to Interview Scheduler
3. **Action**: Click "Schedule New Interview"
4. **Action**: Fill interview details:
   - Candidate: Select from dropdown
   - Job: Select from dropdown
   - Interviewer: Select from dropdown
   - Date/Time: Set future date
   - Type: Technical Interview
5. **Expected**: Interview scheduled successfully
6. **Verify**: Interview appears in scheduled list

### 5. Interviewer Dashboard Flow

#### Test Case: Interviewer Login
1. **Setup**: Login as interviewer (`interviewer@yogya.com`)
2. **Expected**: Interviewer dashboard loads
3. **Verify**: My Interviews section shows scheduled interviews

#### Test Case: Competency Questions Screen
1. **Setup**: Login as interviewer
2. **Action**: Navigate to Competency Questions
3. **Action**: Select an interview session
4. **Expected**: Competency-based questions displayed
5. **Action**: Start interview, ask questions, score competencies
6. **Expected**: Scores saved, progress tracked

### 6. Candidate Portal Flow

#### Test Case: Candidate Login
1. **Setup**: Login as candidate (`candidate@yogya.com`)
2. **Expected**: Candidate dashboard loads
3. **Verify**: My Interviews shows scheduled interviews

#### Test Case: View Interview Details
1. **Setup**: Login as candidate
2. **Action**: Navigate to My Interviews
3. **Action**: Click on an interview
4. **Expected**: Interview details modal opens
5. **Verify**: Meeting link, instructions, status shown

## 🔍 API Testing

### Test Organization API
```bash
# Update HR organization
curl -X POST http://localhost:8001/api/user-management/hr/organization/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"organization": "TestCorp"}'
```

### Test Job Creation API
```bash
# Create job description
curl -X POST http://localhost:8001/api/jobs/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Developer",
    "company": "TestCorp",
    "department": "Engineering",
    "description": "Test job description"
  }'
```

## 🐛 Common Issues & Solutions

### Issue: Organization Setup Modal Not Appearing
**Solution**: 
- Check if user has HR role
- Verify `hasOrganizationSet()` function
- Check browser console for errors

### Issue: API Calls Failing
**Solution**:
- Verify backend server is running on port 8001
- Check CORS settings
- Verify authentication tokens

### Issue: Job Creation Failing
**Solution**:
- Ensure organization is set for HR user
- Check required fields in job form
- Verify API endpoint is accessible

### Issue: Interview Scheduling Issues
**Solution**:
- Ensure candidates and interviewers exist
- Check date/time format
- Verify meeting link generation

## 📊 Performance Testing

### Load Testing
```bash
# Install Apache Bench
ab -n 100 -c 10 http://localhost:8001/api/jobs/
```

### Database Performance
```bash
# Check slow queries
python manage.py dbshell
EXPLAIN ANALYZE SELECT * FROM resume_checker_jobdescription;
```

## 🧹 Cleanup

### Reset Database
```bash
python manage.py flush --no-input
python setup_e2e_testing.py
```

### Clear Cache
```bash
python manage.py clearcache
```

## 📝 Test Reporting

### Generate Test Report
```bash
# Run tests with coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

### Manual Test Checklist
- [ ] Organization setup flow
- [ ] Job creation with dynamic organization
- [ ] Candidate ranking system
- [ ] Interview scheduling
- [ ] Interviewer dashboard
- [ ] Candidate portal
- [ ] Settings management
- [ ] API endpoints
- [ ] Error handling
- [ ] Responsive design

## 🚀 Next Steps

After completing these tests:
1. **Audio-Video Integration**: Implement WebRTC for live interviews
2. **Real-time Features**: Add WebSocket support for live updates
3. **Advanced Analytics**: Implement detailed reporting
4. **Mobile App**: Develop React Native mobile application

---

**Note**: This testing guide covers the current version (2.2.0) with organization management. Update as new features are added.
