import api from './api';

// Fetch all job descriptions (with pagination support)
export const fetchJobDescriptions = async (pageSize = 100) => {
  try {
    const response = await api.get(`/job_descriptions/?page_size=${pageSize}`);
    // Handle Django REST Framework pagination
    return response.data.results || response.data;
  } catch (error) {
    console.error('Error fetching job descriptions:', error);
    throw error;
  }
};

// Fetch all job descriptions without pagination
export const fetchAllJobDescriptions = async () => {
  try {
    const response = await api.get('/job_descriptions/all/');
    return response.data.results || response.data;
  } catch (error) {
    console.error('Error fetching all job descriptions:', error);
    throw error;
  }
};

// Fetch job descriptions with custom pagination
export const fetchJobDescriptionsPaginated = async (page = 1, pageSize = 100) => {
  try {
    const response = await api.get(`/job_descriptions/?page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching paginated job descriptions:', error);
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

export const uploadBulkJobs = async (formData, onProgress) => {
  try {
    const response = await api.post('/job_descriptions/bulk-upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  } catch (error) {
    console.error('Bulk upload error:', error);
    throw new Error(error.response?.data?.message || 'Bulk upload failed');
  }
};

export const downloadTemplate = async () => {
  try {
    const response = await api.get('/job_descriptions/download-template/', {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'job_template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Template download error:', error);
    throw new Error('Failed to download template');
  }
}; 