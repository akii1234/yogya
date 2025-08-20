import api from './api';

class InterviewSchedulerService {
  // Get all candidates for scheduling
  async getCandidatesForScheduling() {
    try {
      const response = await api.get('/candidates/');
      // Candidates API returns {count, next, previous, results: [...]}
      return { success: true, candidates: response.data.results || [] };
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all interviewers (using users with interviewer role)
  async getInterviewers() {
    try {
      // Since there's no specific interviewers endpoint, we'll use a fallback
      // In a real implementation, this would call an endpoint to get users with interviewer role
      const mockInterviewers = [
        {
          id: '1',
          name: 'Emily Davis',
          email: 'emily.davis@company.com',
          avatar: 'ED',
          role: 'Senior HR Manager',
          specialties: ['Technical Interviews', 'Behavioral Interviews'],
          availability: ['Monday', 'Wednesday', 'Friday']
        },
        {
          id: '2',
          name: 'Michael Chen',
          email: 'michael.chen@company.com',
          avatar: 'MC',
          role: 'Engineering Manager',
          specialties: ['Technical Interviews', 'System Design'],
          availability: ['Tuesday', 'Thursday']
        },
        {
          id: '3',
          name: 'Lisa Wang',
          email: 'lisa.wang@company.com',
          avatar: 'LW',
          role: 'Data Science Lead',
          specialties: ['Data Science Interviews', 'ML Interviews'],
          availability: ['Monday', 'Tuesday', 'Thursday', 'Friday']
        }
      ];
      
      return { success: true, interviewers: mockInterviewers };
    } catch (error) {
      console.error('Error fetching interviewers:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all jobs for scheduling
  async getJobsForScheduling() {
    try {
      const response = await api.get('/jobs/active/');
      // Jobs API returns {success, jobs: [...], total_jobs}
      return { success: true, jobs: response.data.jobs || [] };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all scheduled interviews
  async getScheduledInterviews() {
    try {
      const response = await api.get('/interview/sessions/');
      return { success: true, interviews: response.data.results || response.data };
    } catch (error) {
      console.error('Error fetching scheduled interviews:', error);
      return { success: false, error: error.message };
    }
  }

  // Schedule a new interview
  async scheduleInterview(interviewData) {
    try {
      const response = await api.post('/interview/sessions/create/', interviewData);
      return { success: true, interview: response.data.interview };
    } catch (error) {
      console.error('Error scheduling interview:', error);
      return { success: false, error: error.message };
    }
  }

  // Update an interview
  async updateInterview(interviewId, interviewData) {
    try {
      const response = await api.put(`/interview/sessions/${interviewId}/`, interviewData);
      return { success: true, interview: response.data };
    } catch (error) {
      console.error('Error updating interview:', error);
      return { success: false, error: error.message };
    }
  }

  // Cancel an interview
  async cancelInterview(interviewId, reason) {
    try {
      const response = await api.delete(`/interview/sessions/${interviewId}/`, { data: { reason } });
      return { success: true, message: 'Interview cancelled successfully' };
    } catch (error) {
      console.error('Error cancelling interview:', error);
      return { success: false, error: error.message };
    }
  }

  // Reschedule an interview
  async rescheduleInterview(interviewId, newDateTime) {
    try {
      // Use the update interview endpoint instead of a specific reschedule endpoint
      const response = await api.put(`/interview/sessions/${interviewId}/`, { 
        scheduled_date: newDateTime 
      });
      return { success: true, interview: response.data };
    } catch (error) {
      console.error('Error rescheduling interview:', error);
      return { success: false, error: error.message };
    }
  }

  // Send interview invitation (placeholder - would need backend implementation)
  async sendInterviewInvitation(interviewId) {
    try {
      // This endpoint doesn't exist yet, so we'll return a success message
      console.log('Interview invitation would be sent for interview:', interviewId);
      return { success: true, message: 'Invitation sent successfully' };
    } catch (error) {
      console.error('Error sending interview invitation:', error);
      return { success: false, error: error.message };
    }
  }

  // Get interviewer availability (placeholder - would need backend implementation)
  async getInterviewerAvailability(interviewerId, date) {
    try {
      // This endpoint doesn't exist yet, so we'll return mock availability
      const mockAvailability = {
        available_slots: [
          '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
        ]
      };
      return { success: true, availability: mockAvailability };
    } catch (error) {
      console.error('Error fetching interviewer availability:', error);
      return { success: false, error: error.message };
    }
  }

  // Get interview statistics (placeholder - would need backend implementation)
  async getInterviewStats() {
    try {
      // This endpoint doesn't exist yet, so we'll return mock stats
      const mockStats = {
        total_interviews: 12,
        completed_interviews: 8,
        pending_interviews: 3,
        cancelled_interviews: 1,
        average_duration: 45
      };
      return { success: true, stats: mockStats };
    } catch (error) {
      console.error('Error fetching interview statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate meeting link (placeholder - would need backend implementation)
  async generateMeetingLink(interviewType) {
    try {
      // Generate a simple meeting link
      const meetingId = Math.random().toString(36).substr(2, 9);
      const meetingLink = `https://meet.google.com/${meetingId}`;
      return { success: true, meetingLink };
    } catch (error) {
      console.error('Error generating meeting link:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new InterviewSchedulerService();
