const API_BASE_URL = 'http://localhost:8001';

class CandidateInterviewService {
  // Get all interviews for the candidate
  async getMyInterviews() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidate/interviews/`, {
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
      const response = await fetch(`${API_BASE_URL}/api/candidate/interviews/${interviewId}/`, {
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

  // Join an interview
  async joinInterview(interviewId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidate/interviews/${interviewId}/join/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to join interview');
      }

      const data = await response.json();
      return { success: true, interview: data.interview };
    } catch (error) {
      console.error('Error joining interview:', error);
      return { success: false, error: error.message };
    }
  }

  // Complete an interview
  async completeInterview(interviewId, feedback) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidate/interviews/${interviewId}/complete/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(feedback)
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

  // Reschedule an interview
  async rescheduleInterview(interviewId, newDateTime) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidate/interviews/${interviewId}/reschedule/`, {
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

  // Cancel an interview
  async cancelInterview(interviewId, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidate/interviews/${interviewId}/cancel/`, {
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

  // Get interview feedback
  async getInterviewFeedback(interviewId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidate/interviews/${interviewId}/feedback/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interview feedback');
      }

      const data = await response.json();
      return { success: true, feedback: data.feedback };
    } catch (error) {
      console.error('Error fetching interview feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Submit interview feedback
  async submitInterviewFeedback(interviewId, feedback) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidate/interviews/${interviewId}/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(feedback)
      });

      if (!response.ok) {
        throw new Error('Failed to submit interview feedback');
      }

      const data = await response.json();
      return { success: true, result: data };
    } catch (error) {
      console.error('Error submitting interview feedback:', error);
      return { success: false, error: error.message };
    }
  }

  // Get interview preparation materials
  async getInterviewPreparation(interviewId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidate/interviews/${interviewId}/preparation/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch interview preparation');
      }

      const data = await response.json();
      return { success: true, preparation: data.preparation };
    } catch (error) {
      console.error('Error fetching interview preparation:', error);
      return { success: false, error: error.message };
    }
  }

  // Get interview statistics
  async getInterviewStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidate/interviews/stats/`, {
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

  // Check interview availability
  async checkInterviewAvailability(interviewId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/candidate/interviews/${interviewId}/availability/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check interview availability');
      }

      const data = await response.json();
      return { success: true, availability: data.availability };
    } catch (error) {
      console.error('Error checking interview availability:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new CandidateInterviewService();
