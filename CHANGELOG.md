# Changelog

All notable changes to the Yogya project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2024-12-XX

### 🎉 **Major Release: Organization Management System**

#### ✨ **Added**
- **Organization Setup System**:
  - `organizationUtils.js` - Organization extraction and management utilities
  - `OrganizationSetupModal.jsx` - Welcome modal for organization setup
  - `hrService.js` - HR-specific API service for organization management
  - Backend API endpoint `/api/user-management/hr/organization/`
  - Email domain extraction: `hr@wipro.com` → "Wipro"
  - Mandatory organization setup for HR users
  - Dashboard access blocking until organization is set

- **Dynamic Organization Integration**:
  - Job creation uses dynamic organization from HR profile
  - Dashboard activities display dynamic organization names
  - Job activity format: "Python Developer - JOB-ABC123 at Organization"
  - Settings page organization management
  - Real-time organization updates across the platform

- **Backend Organization Management**:
  - `HROrganizationUpdateView` - API for updating HR organization
  - HR Profile model integration with organization field
  - User activity logging for organization changes
  - Permission validation for HR users only

#### 🔧 **Changed**
- **Job Creation Flow**:
  - Removed hardcoded "Wipro" company references
  - Dynamic organization detection from HR profile
  - Improved job form with organization integration
  - Better error handling and validation

- **Dashboard Activities**:
  - Updated activity display to use dynamic organization
  - Improved job activity formatting with job codes
  - Enhanced organization display in recent activities

- **Settings Integration**:
  - Added organization management section
  - Real-time organization updates
  - Success/error feedback for organization changes
  - User-friendly organization editing interface

#### 🐛 **Fixed**
- **Organization References**:
  - Removed all hardcoded "Creating job for: Wipro" messages
  - Fixed organization field in job creation forms
  - Resolved organization display issues in activities

- **API Integration**:
  - Fixed organization update API calls
  - Improved error handling for organization operations
  - Enhanced user feedback for organization changes

#### 📚 **Documentation**
- **Updated Documentation**:
  - Enhanced README.md with organization management features
  - Updated API documentation for organization endpoints
  - Added organization setup flow documentation

---

## [2.1.0] - 2024-12-XX

### 🎉 **Major Release: Human + AI Interviewer System**

#### ✨ **Added**
- **Interviewer System**:
  - `InterviewDashboard.jsx` - Complete interviewer management interface
  - `LiveInterviewInterface.jsx` - Real-time Human + AI interview platform
  - `interviewerService.js` - Interviewer API integration service
  - Mock data for interviews, candidates, and job descriptions
  - Live interview controls (start, pause, stop, complete)
  - AI assistant suggestions during interviews
  - Question management and candidate response input
  - Assessment tools with rating system
  - Video/audio controls and recording capabilities

- **Candidate Interview Management**:
  - `InterviewManager.jsx` - Candidate interview viewing and management
  - `candidateInterviewService.js` - Candidate interview API service
  - Interview listing (scheduled, upcoming, completed)
  - Interview details modal with comprehensive information
  - Join interview functionality with meeting links
  - Interview status tracking and notifications

- **HR Interview Scheduling**:
  - `InterviewScheduler.jsx` - Comprehensive interview scheduling interface
  - `interviewSchedulerService.js` - Interview scheduling API service
  - Advanced scheduling form with candidate, job, and interviewer selection
  - AI assistant settings (enabled/disabled, mode selection)
  - Interview type and mode configuration
  - Meeting link generation and instructions
  - Scheduled interviews list with search and filtering
  - Interview management (edit, delete, reschedule)

- **Interview Feedback Integration**:
  - Interview feedback modal integrated into CandidateRanking component
  - Accessible via Assessment icon in Interview column
  - Comprehensive feedback display with competency scores
  - STAR/CAR methodology observations
  - Interviewer notes and AI insights
  - Final decision buttons (Proceed, Hold, Reject)

#### 🔧 **Changed**
- **Navigation System**:
  - Implemented collapsible sidebar for both HR and Candidate dashboards
  - Added toggle buttons with chevron icons
  - Dynamic width adjustment for main content area
  - Custom scrollbar styling and overflow management
  - Consistent "Yogya" branding across both portals

- **UI/UX Improvements**:
  - Replaced Autocomplete components with Select components for better reliability
  - Enhanced dropdown styling with custom MenuItem rendering
  - Improved modal sizing and spacing
  - Better form field visibility and user experience
  - Consistent HSBC branding colors throughout

- **Component Consolidation**:
  - Removed standalone InterviewFeedback component and service
  - Integrated interview feedback functionality into CandidateRanking
  - Streamlined navigation by removing redundant menu items

#### 🐛 **Fixed**
- **JSX Syntax Errors**:
  - Fixed missing Grid closing tags in InterviewScheduler
  - Resolved HTML nesting errors (h5 cannot be child of h2)
  - Fixed MUI Grid v2 compatibility issues

- **Component Loading Issues**:
  - Resolved missing npm package dependencies
  - Fixed component import and export issues
  - Corrected service integration problems

- **UI Rendering Issues**:
  - Fixed cramped dropdown displays
  - Resolved text rendering problems
  - Improved responsive design issues

#### 📚 **Documentation**
- **New Documentation Files**:
  - `INTERVIEWER_SYSTEM.md` - Complete Human + AI interview system guide
  - `INTERVIEW_MANAGEMENT.md` - Interview scheduling and management documentation
  - `UI_IMPROVEMENTS.md` - Recent UI/UX changes and improvements

- **Updated Documentation**:
  - Enhanced README.md with new features and architecture
  - Updated API documentation for new endpoints
  - Improved code comments and inline documentation

---

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

- **2.2.0**: Organization Management System (Current)
- **2.1.0**: Human + AI Interviewer System
- **2.0.0**: Candidate Ranking System
- **1.2.0**: Resume Parsing Improvements
- **1.1.0**: Core Features
- **1.0.0**: Initial Release

---

**Note**: This changelog follows the [Keep a Changelog](https://keepachangelog.com/) format and uses [Semantic Versioning](https://semver.org/). 