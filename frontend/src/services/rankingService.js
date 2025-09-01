import axios from 'axios';

// API base URL - hardcoded for now since we're using localhost:8001
const API_BASE_URL = 'http://localhost:8001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

class RankingService {
  /**
   * Rank candidates for a specific job
   */
  async rankCandidatesForJob(jobId, candidateIds, criteriaId = null) {
    try {
      const response = await api.post('/api/candidate-ranking/rank/', {
        job_id: jobId,
        candidate_ids: candidateIds,
        criteria_id: criteriaId
      });
      return response.data;
    } catch (error) {
      console.error('Error ranking candidates:', error);
      throw error;
    }
  }

  /**
   * Get rankings for a specific job
   */
  async getJobRankings(jobId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/api/candidate-ranking/job/${jobId}/?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error getting job rankings:', error);
      throw error;
    }
  }

  /**
   * Get rankings for a specific candidate
   */
  async getCandidateRankings(candidateId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/api/candidate-ranking/candidate/${candidateId}/?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error getting candidate rankings:', error);
      throw error;
    }
  }

  /**
   * Update ranking status (shortlist/reject)
   */
  async updateRankingStatus(rankingId, updates) {
    try {
      const response = await api.put(`/api/candidate-ranking/ranking/${rankingId}/status/`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating ranking status:', error);
      throw error;
    }
  }

  /**
   * Get ranking batches
   */
  async getRankingBatches(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/api/candidate-ranking/batches/?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error getting ranking batches:', error);
      throw error;
    }
  }

  /**
   * Get ranking criteria
   */
  async getRankingCriteria() {
    try {
      const response = await api.get('/api/candidate-ranking/criteria/');
      return response.data;
    } catch (error) {
      console.error('Error getting ranking criteria:', error);
      throw error;
    }
  }

  /**
   * Get ranking analytics for a job
   */
  async getRankingAnalytics(jobId) {
    try {
      const response = await api.get(`/api/candidate-ranking/analytics/${jobId}/`);
      return response.data;
    } catch (error) {
      console.error('Error getting ranking analytics:', error);
      throw error;
    }
  }

  /**
   * Shortlist a candidate
   */
  async shortlistCandidate(rankingId, notes = '') {
    return this.updateRankingStatus(rankingId, {
      is_shortlisted: true,
      is_rejected: false,
      hr_notes: notes
    });
  }

  /**
   * Reject a candidate
   */
  async rejectCandidate(rankingId, notes = '') {
    return this.updateRankingStatus(rankingId, {
      is_shortlisted: false,
      is_rejected: true,
      hr_notes: notes
    });
  }

  /**
   * Remove shortlist/reject status
   */
  async resetCandidateStatus(rankingId) {
    return this.updateRankingStatus(rankingId, {
      is_shortlisted: false,
      is_rejected: false
    });
  }

  /**
   * Get active jobs for ranking
   */
  async getActiveJobs() {
    try {
      // This would typically come from the job management API
      // For now, we'll use a mock response
      const response = await api.get('/api/jobs/active/');
      return response.data;
    } catch (error) {
      console.error('Error getting active jobs:', error);
      // Return mock data for development
      return {
        success: true,
        jobs: [
          { job_id: 'JOB-TEST01', title: 'Senior Python Developer', company: 'BigTech' },
          { job_id: 'JOB-TEST02', title: 'Frontend Developer', company: 'WebTech Solutions' },
          { job_id: 'JOB-TEST03', title: 'Data Scientist', company: 'AI Innovations' }
        ]
      };
    }
  }

  /**
   * Get candidates for a job
   */
  async getCandidatesForJob(jobId) {
    try {
      const response = await api.get(`/api/jobs/${jobId}/candidates/`);
      return response.data;
    } catch (error) {
      console.error('Error getting candidates for job:', error);
      throw error;
    }
  }

  /**
   * Export rankings to CSV
   */
  async exportRankings(jobId, format = 'csv') {
    try {
      const response = await api.get(`/api/candidate-ranking/job/${jobId}/export/`, {
        params: { format },
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rankings_${jobId}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error exporting rankings:', error);
      throw error;
    }
  }

  /**
   * Bulk shortlist candidates
   */
  async bulkShortlist(rankingIds, notes = '') {
    try {
      const promises = rankingIds.map(id => this.shortlistCandidate(id, notes));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error bulk shortlisting:', error);
      throw error;
    }
  }

  /**
   * Bulk reject candidates
   */
  async bulkReject(rankingIds, notes = '') {
    try {
      const promises = rankingIds.map(id => this.rejectCandidate(id, notes));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error bulk rejecting:', error);
      throw error;
    }
  }
}

// Create singleton instance
const rankingService = new RankingService();

export default rankingService; 