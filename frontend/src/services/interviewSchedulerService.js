const API_BASE_URL = 'http://localhost:8001';

class InterviewSchedulerService {
  // Get all candidates for scheduling
  async getCandidatesForScheduling() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/candidates/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const data = await response.json();
      return { success: true, candidates: data.candidates };
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all interviewers
  async getInterviewers() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/interviewers/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interviewers');
      }

      const data = await response.json();
      return { success: true, interviewers: data.interviewers };
    } catch (error) {
      console.error('Error fetching interviewers:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all jobs for scheduling
  async getJobsForScheduling() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/jobs/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      return { success: true, jobs: data.jobs };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all scheduled interviews
  async getScheduledInterviews() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/interviews/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scheduled interviews');
      }

      const data = await response.json();
      return { success: true, interviews: data.interviews };
    } catch (error) {
      console.error('Error fetching scheduled interviews:', error);
      return { success: false, error: error.message };
    }
  }

  // Schedule a new interview
  async scheduleInterview(interviewData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/interviews/schedule/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(interviewData)
      });

      if (!response.ok) {
        throw new Error('Failed to schedule interview');
      }

      const data = await response.json();
      return { success: true, interview: data.interview };
    } catch (error) {
      console.error('Error scheduling interview:', error);
      return { success: false, error: error.message };
    }
  }

  // Update an interview
  async updateInterview(interviewId, interviewData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/interviews/${interviewId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(interviewData)
      });

      if (!response.ok) {
        throw new Error('Failed to update interview');
      }

      const data = await response.json();
      return { success: true, interview: data.interview };
    } catch (error) {
      console.error('Error updating interview:', error);
      return { success: false, error: error.message };
    }
  }

  // Cancel an interview
  async cancelInterview(interviewId, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/interviews/${interviewId}/cancel/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel interview');
      }

      const data = await response.json();
      return { success: true, result: data };
    } catch (error) {
      console.error('Error cancelling interview:', error);
      return { success: false, error: error.message };
    }
  }

  // Reschedule an interview
  async rescheduleInterview(interviewId, newDateTime) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/interviews/${interviewId}/reschedule/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ new_datetime: newDateTime })
      });

      if (!response.ok) {
        throw new Error('Failed to reschedule interview');
      }

      const data = await response.json();
      return { success: true, interview: data.interview };
    } catch (error) {
      console.error('Error rescheduling interview:', error);
      return { success: false, error: error.message };
    }
  }

  // Send interview invitation
  async sendInterviewInvitation(interviewId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/interviews/${interviewId}/send-invitation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to send interview invitation');
      }

      const data = await response.json();
      return { success: true, result: data };
    } catch (error) {
      console.error('Error sending interview invitation:', error);
      return { success: false, error: error.message };
    }
  }

  // Get interviewer availability
  async getInterviewerAvailability(interviewerId, date) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/interviewers/${interviewerId}/availability/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        params: { date }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interviewer availability');
      }

      const data = await response.json();
      return { success: true, availability: data.availability };
    } catch (error) {
      console.error('Error fetching interviewer availability:', error);
      return { success: false, error: error.message };
    }
  }

  // Get interview statistics
  async getInterviewStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/interviews/stats/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interview statistics');
      }

      const data = await response.json();
      return { success: true, stats: data.stats };
    } catch (error) {
      console.error('Error fetching interview statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate meeting link
  async generateMeetingLink(interviewType) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/hr/interviews/generate-meeting-link/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ interview_type: interviewType })
      });

      if (!response.ok) {
        throw new Error('Failed to generate meeting link');
      }

      const data = await response.json();
      return { success: true, meetingLink: data.meeting_link };
    } catch (error) {
      console.error('Error generating meeting link:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new InterviewSchedulerService();
