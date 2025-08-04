import api from './api';

// Fetch dashboard statistics
export const fetchDashboardStats = async () => {
  try {
    // Fetch real data from backend
    const [candidatesResponse, jobsResponse, applicationsResponse] = await Promise.all([
      api.get('/candidates/'),
      api.get('/job_descriptions/'),
      api.get('/applications/')
    ]);

    const candidates = candidatesResponse.data.results || candidatesResponse.data || [];
    const jobs = jobsResponse.data.results || jobsResponse.data || [];
    const applications = applicationsResponse.data.results || applicationsResponse.data || [];

    // Calculate dashboard stats
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalCandidates = candidates.length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const shortlistedToday = applications.filter(app => 
      app.status === 'shortlisted' && 
      new Date(app.updated_at).toDateString() === new Date().toDateString()
    ).length;

    // Create recent activity from available data
    const recentActivity = [];

    // Add recent job activities
    jobs.slice(0, 2).forEach(job => {
      recentActivity.push({
        id: `job-${job.id}`,
        text: `🆕 Job created: ${job.title} at ${job.company}`,
        timestamp: job.created_at
      });
    });

    // Add recent candidate activities
    candidates.slice(0, 2).forEach(candidate => {
      recentActivity.push({
        id: `candidate-${candidate.id}`,
        text: `👤 Candidate ${candidate.first_name} ${candidate.last_name} added`,
        timestamp: candidate.created_at
      });
    });

    // Add some mock activities for demonstration
    recentActivity.push(
      {
        id: 'mock-1',
        text: '✅ Candidate shortlisted for Senior Python Developer',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: 'mock-2',
        text: '📅 3 interviews scheduled for this week',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      },
      {
        id: 'mock-3',
        text: '📈 Match rate improved by 15% this month',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
      }
    );

    // Sort by timestamp and take the latest 5
    const sortedActivity = recentActivity
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    return {
      activeJobs,
      totalCandidates,
      pendingApplications,
      shortlistedToday,
      timeToFill: 12, // This would need a separate calculation
      recentActivity: sortedActivity
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Fallback to mock data if API fails
    return {
      activeJobs: 24,
      totalCandidates: 24,
      pendingApplications: 7,
      shortlistedToday: 8,
      timeToFill: 12,
      recentActivity: [
        { id: 'mock-1', text: '✅ Candidate Akhil T. shortlisted' },
        { id: 'mock-2', text: '📅 3 interviews scheduled' },
        { id: 'mock-3', text: '🆕 New JD created: Senior React Developer' },
        { id: 'mock-4', text: '📈 Match rate improved' }
      ]
    };
  }
};

// Fetch recent activity
export const fetchRecentActivity = async () => {
  try {
    const [candidatesResponse, applicationsResponse] = await Promise.all([
      api.get('/candidates/'),
      api.get('/applications/')
    ]);

    const candidates = candidatesResponse.data.results || candidatesResponse.data || [];
    const applications = applicationsResponse.data.results || applicationsResponse.data || [];

    // Create recent activity from applications and candidates
    const activities = [];

    // Add recent applications
    applications.slice(0, 3).forEach(app => {
      activities.push({
        id: app.id,
        type: 'application',
        title: `New candidate applied for ${app.job_description?.title || 'position'}`,
        timestamp: app.created_at,
        icon: 'success'
      });
    });

    // Add recent candidate updates
    candidates.slice(0, 2).forEach(candidate => {
      activities.push({
        id: candidate.id,
        type: 'candidate',
        title: `Candidate ${candidate.first_name} ${candidate.last_name} profile updated`,
        timestamp: candidate.updated_at,
        icon: 'primary'
      });
    });

    // Sort by timestamp and return latest 5
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

// Fetch interview sessions
export const fetchInterviewSessions = async () => {
  try {
    const response = await api.get('/competency/sessions/');
    return response.data.results || response.data || [];
  } catch (error) {
    console.error('Error fetching interview sessions:', error);
    return [];
  }
};

// Fetch candidates
export const fetchCandidates = async () => {
  try {
    const response = await api.get('/candidates/');
    return response.data.results || response.data || [];
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }
};

// Fetch job descriptions
export const fetchJobDescriptions = async () => {
  try {
    const response = await api.get('/job_descriptions/');
    return response.data.results || response.data || [];
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    return [];
  }
};

// Fetch applications
export const fetchApplications = async () => {
  try {
    const response = await api.get('/applications/');
    return response.data.results || response.data || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}; 