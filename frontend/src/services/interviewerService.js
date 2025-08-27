import api from './api';

class InterviewerService {
  // Get all interviewers with optional filters
  async getInterviewers(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.availability) params.append('availability', filters.availability);
      if (filters.competency) params.append('competency', filters.competency);
      if (filters.search) params.append('search', filters.search);
      
      const response = await api.get(`/interviewer/api/interviewers/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interviewers:', error);
      throw error;
    }
  }

  // Get interviewer statistics
  async getInterviewerStats() {
    try {
      const response = await api.get('/interviewer/api/interviewers/stats/');
      return response.data;
    } catch (error) {
      console.error('Error fetching interviewer stats:', error);
      throw error;
    }
  }

  // Create a new interviewer
  async createInterviewer(interviewerData) {
    try {
      const response = await api.post('/interviewer/api/interviewers/create_interviewer/', interviewerData);
      return response.data;
    } catch (error) {
      console.error('Error creating interviewer:', error);
      throw error;
    }
  }

  // Get a specific interviewer
  async getInterviewer(id) {
    try {
      const response = await api.get(`/interviewer/api/interviewers/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interviewer:', error);
      throw error;
    }
  }

  // Update an interviewer
  async updateInterviewer(id, interviewerData) {
    try {
      const response = await api.put(`/interviewer/api/interviewers/${id}/`, interviewerData);
      return response.data;
    } catch (error) {
      console.error('Error updating interviewer:', error);
      throw error;
    }
  }

  // Delete an interviewer
  async deleteInterviewer(id) {
    try {
      const response = await api.delete(`/interviewer/api/interviewers/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting interviewer:', error);
      throw error;
    }
  }

  // Get interviews conducted by an interviewer
  async getInterviewerInterviews(interviewerId) {
    try {
      const response = await api.get(`/interviewer/api/interviewers/${interviewerId}/interviews/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interviewer interviews:', error);
      throw error;
    }
  }

  // Get all interviews with optional filters
  async getInterviews(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.interviewer) params.append('interviewer', filters.interviewer);
      if (filters.start_date) params.append('start_date', filters.start_date);
      if (filters.end_date) params.append('end_date', filters.end_date);
      
      const response = await api.get(`/interviewer/api/interviews/?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      throw error;
    }
  }

  // Create a new interview
  async createInterview(interviewData) {
    try {
      const response = await api.post('/interviewer/api/interviews/', interviewData);
      return response.data;
    } catch (error) {
      console.error('Error creating interview:', error);
      throw error;
    }
  }

  // Update an interview
  async updateInterview(id, interviewData) {
    try {
      const response = await api.put(`/interviewer/api/interviews/${id}/`, interviewData);
      return response.data;
    } catch (error) {
      console.error('Error updating interview:', error);
      throw error;
    }
  }

  // Delete an interview
  async deleteInterview(id) {
    try {
      const response = await api.delete(`/interviewer/api/interviews/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting interview:', error);
      throw error;
    }
  }
}

export default new InterviewerService();
