# Yogya Frontend - React Dashboard

This is the React frontend for the Yogya AI-Powered Technical Hiring Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (v8 or higher)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Dashboard/       # Dashboard-specific components
│   │   └── DashboardOverview.jsx
│   ├── Jobs/            # Job management components
│   │   ├── JobDescriptionForm.jsx
│   │   └── JobList.jsx
│   ├── Interview/       # Interview management components
│   ├── Candidates/      # Candidate management components
│   └── Common/          # Shared components
├── pages/               # Page components
│   └── JobsPage.jsx     # Job management page
├── hooks/               # Custom React hooks
├── services/            # API service layer
│   ├── api.js           # Base API configuration
│   ├── dashboardService.js
│   └── jobService.js    # Job management API
├── context/             # React Context for state management
├── utils/               # Utility functions
└── styles/              # CSS files
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **Material-UI** - Component library
- **Axios** - HTTP client
- **Vite** - Build tool and dev server
- **React Router** - Navigation

## 🔗 Backend Integration

The frontend connects to the Django backend at `http://localhost:8000/api`

### API Endpoints Used:
- `/api/candidates/` - Candidate management
- `/api/job_descriptions/` - Job description management ✅
- `/api/competency/sessions/` - Interview sessions
- `/api/applications/` - Application tracking

## 🎨 Features

### Current Features:
- ✅ **Dashboard Overview** - Key metrics and statistics
- ✅ **Material-UI Theme** - Professional design system
- ✅ **Responsive Design** - Works on all devices
- ✅ **Real-time Updates** - Auto-refresh every 30 seconds
- ✅ **Job Management** - Create, edit, and manage job descriptions
- ✅ **Navigation System** - Sidebar navigation with multiple pages
- ✅ **Search & Filtering** - Advanced job search and filtering

### Job Management Features:
- ✅ **Create Job Descriptions** - Comprehensive form with all fields
- ✅ **Edit Jobs** - Update existing job descriptions
- ✅ **Delete Jobs** - Remove job descriptions with confirmation
- ✅ **Job Listing** - Table view with all job information
- ✅ **Search Jobs** - Search by title, company, or department
- ✅ **Filter Jobs** - Filter by status and experience level
- ✅ **Skills Management** - Add/remove skills with chips
- ✅ **Form Validation** - Required fields and error handling

### Planned Features:
- 🔄 **Candidate Management** - Create and manage candidates
- 🔄 **Interview Management** - Schedule and track interviews
- 🔄 **Authentication** - Login/logout functionality
- 🔄 **Advanced Charts** - Data visualization
- 🔄 **Real-time Notifications** - Live alerts and updates

## 🚀 Development

### Available Scripts:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Development Workflow:
1. Start the Django backend server (`python manage.py runserver`)
2. Start the React development server (`npm run dev`)
3. Make changes to components
4. See live updates in the browser

## 🎯 How to Use Job Management

### Creating a New Job:
1. Navigate to "Job Descriptions" in the sidebar
2. Click "Create New Job" button
3. Fill out the comprehensive form:
   - **Basic Information**: Title, company, department, location
   - **Job Details**: Description and requirements
   - **Key Skills**: Add relevant skills using the chip interface
4. Click "Create Job Description" to save

### Managing Jobs:
1. View all jobs in the table format
2. Use search to find specific jobs
3. Filter by status (Active, Draft, Closed) or experience level
4. Edit jobs by clicking the edit icon
5. Delete jobs with confirmation dialog

### Job Form Features:
- **Experience Levels**: Entry, Junior, Mid, Senior, Lead, Principal
- **Employment Types**: Full Time, Part Time, Contract, Internship, Freelance
- **Status Management**: Active, Draft, Closed
- **Skills Interface**: Add/remove skills with visual chips
- **Form Validation**: Required fields and error handling

## 🎯 Next Steps

1. **Connect to Real Backend Data** - Replace mock data with actual API calls ✅
2. **Add Candidate Management** - Create and manage candidate profiles
3. **Build Interview Management** - Session tracking and management
4. **Add Charts and Analytics** - Data visualization components
5. **Implement Real-time Features** - WebSocket integration

## 📝 Notes

- **Job Management**: Fully functional with backend API integration
- **Backend API**: Connected to Django backend for job CRUD operations
- **Material-UI**: Professional, enterprise-ready interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Error Handling**: Comprehensive error handling and user feedback

## 🔧 API Integration Status

### ✅ Working:
- **Job Descriptions**: Create, read, update, delete operations
- **Dashboard Stats**: Mock data (ready for real API)
- **Error Handling**: Graceful API error handling
- **Loading States**: Professional loading indicators

### 🔄 Next:
- **Dashboard Stats API**: Create backend endpoint for dashboard statistics
- **Candidate Management**: Build candidate CRUD operations
- **Interview Management**: Build interview session management

---

**Built with ❤️ for Yogya - AI-Powered Technical Hiring Platform**
