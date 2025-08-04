import api from './api';

// Fetch all job descriptions
export const fetchJobDescriptions = async () => {
  try {
    const response = await api.get('/job_descriptions/');
    // Handle Django REST Framework pagination
    return response.data.results || response.data;
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    throw error;
  }
};

// Create a new job description
export const createJobDescription = async (jobData) => {
  try {
    const response = await api.post('/job_descriptions/', jobData);
    return response.data;
  } catch (error) {
    console.error('Error creating job description:', error);
    throw error;
  }
};

// Update an existing job description
export const updateJobDescription = async (jobId, jobData) => {
  try {
    const response = await api.put(`/job_descriptions/${jobId}/`, jobData);
    return response.data;
  } catch (error) {
    console.error('Error updating job description:', error);
    throw error;
  }
};

// Delete a job description
export const deleteJobDescription = async (jobId) => {
  try {
    await api.delete(`/job_descriptions/${jobId}/`);
    return true;
  } catch (error) {
    console.error('Error deleting job description:', error);
    throw error;
  }
};

// Get a single job description by ID
export const getJobDescription = async (jobId) => {
  try {
    const response = await api.get(`/job_descriptions/${jobId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job description:', error);
    throw error;
  }
};

// Match resumes with a job description
export const matchResumesWithJob = async (jobId) => {
  try {
    const response = await api.post(`/job_descriptions/${jobId}/match-all-resumes/`);
    return response.data;
  } catch (error) {
    console.error('Error matching resumes with job:', error);
    throw error;
  }
};

// Get job statistics
export const getJobStats = async () => {
  try {
    // This would be a custom endpoint for job statistics
    const response = await api.get('/job_descriptions/stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching job statistics:', error);
    throw error;
  }
}; 