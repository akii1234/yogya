# Candidate Ranking Feature Documentation

## 🎯 **Feature Overview**

The Candidate Ranking System is a core USP of the Yogya platform that automatically ranks candidates based on their applications to job positions. This intelligent system provides HR teams with instant insights into candidate suitability and match quality.

## ✅ **Key Features**

### **1. Automatic Ranking Generation**
- **Real-time ranking**: Rankings are automatically generated when candidates apply to jobs
- **No manual intervention**: HR teams don't need to manually trigger ranking generation
- **Instant visibility**: New candidates appear in rankings immediately after application

### **2. Multi-Factor Scoring**
- **Skills Matching (40%)**: Compares candidate skills with job requirements
- **Experience Matching (30%)**: Evaluates years of experience against job requirements
- **Education Matching (20%)**: Assesses education level compatibility
- **Location Matching (10%)**: Considers geographic proximity

### **3. Intelligent Ranking Algorithm**
- **Score-based ranking**: Candidates ranked by overall match percentage
- **Position-based ranking**: Clear rank positions (1st, 2nd, 3rd, etc.)
- **Match level classification**: High (80-100%), Medium (60-79%), Low (0-59%)

## 🔧 **How It Works**

### **Application Flow**
1. **Candidate applies** to a job through the candidate portal
2. **System creates application** record
3. **Automatic ranking generation** triggered
4. **All candidates for that job** are re-ranked
5. **HR can immediately view** updated rankings

### **Ranking Process**
1. **Data Collection**: Gathers candidate skills, experience, education, location
2. **Job Analysis**: Extracts requirements from job description
3. **Score Calculation**: Applies weighted scoring algorithm
4. **Ranking Assignment**: Orders candidates by score
5. **Database Storage**: Saves rankings for HR access

## 🎨 **HR Portal Interface**

### **Candidate Rankings Page**
- **Job Selection**: Dropdown to select specific jobs
- **Ranking Table**: Shows ranked candidates with scores
- **Filter Options**: Score range, search functionality
- **Action Buttons**: Shortlist, reject, view details

### **Ranking Display**
- **Rank Position**: Clear numbering (1st, 2nd, 3rd)
- **Candidate Info**: Name, email, location
- **Match Score**: Percentage with color coding
- **Skills Analysis**: Matched and missing skills
- **Experience Gap**: Years difference from requirements

## 📊 **API Endpoints**

### **Core Ranking APIs**
```
POST /api/candidate-ranking/rank/           # Generate rankings
GET  /api/candidate-ranking/job/{id}/       # Get job rankings
PUT  /api/candidate-ranking/ranking/{id}/status/  # Update status
GET  /api/candidate-ranking/analytics/{id}/ # Get analytics
```

### **Application Integration**
```
POST /api/candidate-portal/apply-job/       # Apply to job (auto-generates rankings)
```

## 🗄️ **Database Models**

### **CandidateRanking**
- `ranking_id`: Unique identifier
- `candidate`: Reference to candidate
- `job_description`: Reference to job
- `overall_score`: Total match percentage
- `rank_position`: Position in ranking
- `skill_match_score`: Skills compatibility
- `experience_match_score`: Experience fit
- `education_match_score`: Education level
- `location_match_score`: Geographic fit

### **RankingBatch**
- `batch_id`: Unique batch identifier
- `job_description`: Job being ranked
- `total_candidates`: Number of candidates ranked
- `ranked_candidates`: Successfully ranked count
- `failed_rankings`: Failed ranking count
- `status`: Processing status

## 🚀 **Technical Implementation**

### **Auto-Generation Logic**
```python
# In apply_job function
# After creating application
ranking_service = CandidateRankingService()
all_candidates = [app.candidate for app in applications]
batch = ranking_service.rank_candidates_for_job(
    job_description=job,
    candidates=all_candidates
)
```

### **Scoring Algorithm**
```python
# Weighted scoring
overall_score = (
    skill_score * 0.4 +
    experience_score * 0.3 +
    education_score * 0.2 +
    location_score * 0.1
)
```

## 📈 **Business Value**

### **For HR Teams**
- **Time Savings**: No manual candidate evaluation needed
- **Consistency**: Standardized ranking across all jobs
- **Speed**: Instant candidate insights
- **Quality**: Data-driven candidate selection

### **For Candidates**
- **Transparency**: Clear understanding of job fit
- **Fairness**: Objective evaluation criteria
- **Feedback**: Specific areas for improvement

### **For Organizations**
- **Efficiency**: Faster hiring decisions
- **Quality**: Better candidate-job matches
- **Scalability**: Handles multiple applications automatically

## 🔄 **Workflow Integration**

### **Candidate Journey**
1. **Browse Jobs**: View available positions
2. **Apply**: Submit application with resume
3. **Instant Feedback**: See match score and analysis
4. **Track Status**: Monitor application progress

### **HR Workflow**
1. **View Rankings**: See automatically ranked candidates
2. **Evaluate**: Review scores and detailed analysis
3. **Take Action**: Shortlist, reject, or schedule interviews
4. **Track Progress**: Monitor hiring pipeline

## 🛠️ **Maintenance & Monitoring**

### **Performance Monitoring**
- **Ranking Generation Time**: Track processing speed
- **Accuracy Metrics**: Monitor ranking quality
- **Error Rates**: Track failed ranking attempts

### **Data Quality**
- **Skill Extraction**: Monitor skill parsing accuracy
- **Experience Validation**: Verify experience data quality
- **Education Mapping**: Ensure proper education level classification

## 🔮 **Future Enhancements**

### **Planned Features**
- **AI-Enhanced Scoring**: Machine learning-based ranking
- **Behavioral Analysis**: Personality and culture fit scoring
- **Predictive Analytics**: Success probability predictions
- **Real-time Updates**: Live ranking updates

### **Integration Opportunities**
- **ATS Integration**: Connect with external ATS systems
- **Interview Scheduling**: Automatic interview coordination
- **Feedback Loops**: Candidate improvement suggestions
- **Analytics Dashboard**: Advanced reporting and insights

---

**Last Updated**: January 2025
**Version**: 2.0 (Auto-Generation Enabled)
**Maintainer**: Development Team
