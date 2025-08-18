const API_BASE_URL = 'http://localhost:8001';

class InterviewerService {
  // Get all interviews for the interviewer
  async getInterviews() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interviews');
      }

      const data = await response.json();
      return { success: true, interviews: data.interviews };
    } catch (error) {
      console.error('Error fetching interviews:', error);
      return { success: false, error: error.message };
    }
  }

  // Get interview details
  async getInterviewDetails(interviewId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/${interviewId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interview details');
      }

      const data = await response.json();
      return { success: true, interview: data.interview };
    } catch (error) {
      console.error('Error fetching interview details:', error);
      return { success: false, error: error.message };
    }
  }

  // Start an interview
  async startInterview(interviewId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/${interviewId}/start/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to start interview');
      }

      const data = await response.json();
      return { success: true, interview: data.interview };
    } catch (error) {
      console.error('Error starting interview:', error);
      return { success: false, error: error.message };
    }
  }

  // Complete an interview
  async completeInterview(interviewId, interviewData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/${interviewId}/complete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(interviewData)
      });

      if (!response.ok) {
        throw new Error('Failed to complete interview');
      }

      const data = await response.json();
      return { success: true, result: data };
    } catch (error) {
      console.error('Error completing interview:', error);
      return { success: false, error: error.message };
    }
  }

  // Get AI suggestions for interview
  async getAISuggestions(question, candidateResponse) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/ai-suggestions/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          question,
          candidate_response: candidateResponse
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions');
      }

      const data = await response.json();
      return { success: true, suggestions: data.suggestions };
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return { success: false, error: error.message };
    }
  }

  // Prepare interview with AI
  async prepareInterviewWithAI(interviewId, jobDescription, candidateProfile) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/${interviewId}/prepare/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          job_description: jobDescription,
          candidate_profile: candidateProfile
        })
      });

      if (!response.ok) {
        throw new Error('Failed to prepare interview with AI');
      }

      const data = await response.json();
      return { success: true, preparation: data.preparation };
    } catch (error) {
      console.error('Error preparing interview with AI:', error);
      return { success: false, error: error.message };
    }
  }

  // Get interview analytics
  async getInterviewAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/analytics/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interview analytics');
      }

      const data = await response.json();
      return { success: true, analytics: data.analytics };
    } catch (error) {
      console.error('Error fetching interview analytics:', error);
      return { success: false, error: error.message };
    }
  }

  // Update interview status
  async updateInterviewStatus(interviewId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/${interviewId}/status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update interview status');
      }

      const data = await response.json();
      return { success: true, interview: data.interview };
    } catch (error) {
      console.error('Error updating interview status:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new InterviewerService();
