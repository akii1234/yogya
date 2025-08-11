# Changelog

All notable changes to the Yogya project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-XX

### 🎉 **Major Release: Candidate Ranking System**

#### ✨ **Added**
- **New Django App**: `candidate_ranking` - Complete candidate ranking system
- **Database Models**:
  - `CandidateRanking`: Core ranking data with scores and status
  - `RankingBatch`: Batch processing for multiple candidates
  - `RankingCriteria`: Configurable ranking weights and criteria
- **API Endpoints**:
  - `POST /api/candidate-ranking/rank/` - Rank candidates for jobs
  - `GET /api/candidate-ranking/job/{id}/` - Get job rankings
  - `GET /api/candidate-ranking/candidate/{id}/` - Get candidate rankings
  - `PUT /api/candidate-ranking/ranking/{id}/status/` - Update ranking status
  - `GET /api/candidate-ranking/batches/` - Get ranking batches
  - `GET /api/candidate-ranking/criteria/` - Get ranking criteria
  - `GET /api/candidate-ranking/analytics/{id}/` - Get ranking analytics
  - `GET /api/jobs/active/` - Get active jobs
  - `GET /api/jobs/{id}/candidates/` - Get candidates for jobs
- **Service Layer**: `CandidateRankingService` with intelligent scoring algorithm
- **Frontend Components**:
  - `CandidateRanking.jsx` - Main ranking interface
  - `RankingAnalytics.jsx` - Analytics dashboard
  - `rankingService.js` - API integration service
- **UI/UX Features**:
  - Modern table-based ranking display
  - Graceful green color scheme
  - Responsive design with collapsible sidebar
  - Detailed candidate modal with comprehensive information
  - Real-time filtering and search
  - Success/error feedback with alerts
- **Scoring Algorithm**:
  - Skills matching (40% weight) with gap analysis
  - Experience evaluation (30% weight) with qualification assessment
  - Education matching (20% weight) with field relevance
  - Location compatibility (10% weight) with geographic analysis
- **Status Management**:
  - Shortlist candidates with one-click
  - Reject candidates with confirmation
  - Track application progress
  - HR notes and comments
- **Analytics Dashboard**:
  - Score statistics (average, max, min)
  - Score distribution (high/medium/low match percentages)
  - Candidate status tracking
  - Experience level analysis
- **Admin Interface**: Full Django admin integration for all models
- **Testing**: Comprehensive test script (`test_ranking_system.py`)

#### 🔧 **Changed**
- **Navigation**: Updated HR navigation with collapsible sidebar
- **Grid Components**: Migrated to Material-UI Grid v2 (removed deprecated props)
- **API Base URL**: Fixed frontend API configuration for port 8001
- **Authentication**: Temporarily disabled for testing (can be re-enabled)
- **Documentation**: Comprehensive README files for backend and frontend

#### 🐛 **Fixed**
- **Process Environment**: Fixed `process is not defined` error in frontend
- **Grid Warnings**: Removed deprecated `item`, `xs`, `sm`, `md` props
- **API Endpoints**: Added missing jobs and candidates endpoints
- **Model Fields**: Fixed `is_active` to `status` field mapping
- **Database Queries**: Optimized queries with proper field references
- **Error Handling**: Improved error messages and logging
- **UI Responsiveness**: Fixed mobile and desktop layout issues

#### 📚 **Documentation**
- **Backend README**: Complete technical documentation for ranking system
- **Main README**: Updated with new features and architecture
- **API Documentation**: Comprehensive endpoint documentation
- **Code Comments**: Inline documentation throughout codebase
- **Buddy Notes**: Updated implementation status and decisions

#### 🧪 **Testing**
- **Backend Tests**: Model creation, service logic, API endpoints
- **Frontend Tests**: Component rendering, API integration, user interactions
- **Integration Tests**: End-to-end workflow validation
- **Performance Tests**: Response time and database query optimization

---

## [1.2.0] - 2024-XX-XX

### ✨ **Added**
- Resume parsing improvements with spaCy integration
- Enhanced job matching algorithms
- User management improvements

### 🔧 **Changed**
- Updated Django to version 5.0
- Improved frontend performance
- Enhanced error handling

### 🐛 **Fixed**
- Various bug fixes and improvements

---

## [1.1.0] - 2024-XX-XX

### ✨ **Added**
- Initial candidate portal features
- Basic HR dashboard
- Job management system

### 🔧 **Changed**
- Improved UI/UX design
- Enhanced API performance

### 🐛 **Fixed**
- Authentication issues
- Database optimization

---

## [1.0.0] - 2024-XX-XX

### ✨ **Added**
- Initial project setup
- Basic resume parsing functionality
- User authentication system
- Core Django and React structure

---

## Types of Changes

- **✨ Added** for new features
- **🔧 Changed** for changes in existing functionality
- **🐛 Fixed** for any bug fixes
- **📚 Documentation** for documentation updates
- **🧪 Testing** for adding or updating tests
- **🎉 Major Release** for significant new features
- **🚀 Performance** for performance improvements
- **🔒 Security** for security-related changes

---

## Version History

- **2.0.0**: Candidate Ranking System (Current)
- **1.2.0**: Resume Parsing Improvements
- **1.1.0**: Core Features
- **1.0.0**: Initial Release

---

**Note**: This changelog follows the [Keep a Changelog](https://keepachangelog.com/) format and uses [Semantic Versioning](https://semver.org/). 