import api from './api';

// Job Application Services
export const submitJobApplication = async (jobId, applicationData) => {
  try {
    const response = await api.post(`/candidate-portal/apply-job/`, {
      job_id: jobId,
      candidate_id: applicationData.candidateId,
      cover_letter: applicationData.coverLetter,
      expected_salary: applicationData.expectedSalary,
      source: 'direct_apply'
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
};

export const getMyApplications = async (candidateId) => {
  try {
    const response = await api.get(`/candidate-portal/my-applications/?candidate_id=${candidateId}`);
    return response.data.applications || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    // Fallback to mock data if API fails
    return getMockApplications();
  }
};

export const getApplicationDetails = async (applicationId) => {
  try {
    const response = await api.get(`/applications/${applicationId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application details:', error);
    throw error;
  }
};

// Candidate Profile Services
export const getCandidateProfile = async (candidateId) => {
  try {
    const response = await api.get(`/candidate-portal/candidate-profile/?candidate_id=${candidateId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    // Fallback to mock data if API fails
    return getMockProfile();
  }
};

export const updateCandidateProfile = async (candidateId, profileData) => {
  try {
    const response = await api.put(`/candidate-portal/update-profile/`, {
      candidate_id: candidateId,
      ...profileData
    });
    return response.data;
  } catch (error) {
    console.error('Error updating candidate profile:', error);
    throw error;
  }
};

export const uploadResume = async (formData) => {
  try {
    const response = await api.post('/candidate-portal/upload-resume/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading resume:', error);
    throw error;
  }
};

export const getMyResumes = async (candidateId) => {
  try {
    const response = await api.get(`/candidate-portal/my-resumes/?candidate_id=${candidateId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resumes:', error);
    // Return empty array if API fails
    return { resumes: [] };
  }
};

export const deleteResume = async (resumeId, candidateId) => {
  try {
    const response = await api.delete(`/candidate-portal/delete-resume/`, {
      data: {
        resume_id: resumeId,
        candidate_id: candidateId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting resume:', error);
    throw error;
  }
};

// Job Search Services
export const searchJobs = async (filters = {}) => {
  try {
    console.log('🔍 searchJobs called with filters:', filters);
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.location) params.append('location', filters.location);
    if (filters.experience) params.append('experience', filters.experience);
    if (filters.skills) params.append('skills', filters.skills.join(','));
    if (filters.candidateId) params.append('candidate_id', filters.candidateId);
    
    const url = `/candidate-portal/browse-jobs/?${params.toString()}`;
    console.log('🌐 Making API call to:', url);
    
    const response = await api.get(url);
    console.log('✅ API response:', response.data);
    return response.data.jobs || [];
  } catch (error) {
    console.error('❌ Error searching jobs:', error);
    console.log('🔄 Falling back to mock data');
    // Fallback to mock data if API fails
    return getMockJobs();
  }
};

export const getJobDetails = async (jobId) => {
  try {
    const response = await api.get(`/candidate-portal/job-details/?job_id=${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw error;
  }
};

// Application Status Tracking
export const getApplicationStatus = async (applicationId) => {
  try {
    const response = await api.get(`/applications/${applicationId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application status:', error);
    throw error;
  }
};

// Mock data for development (fallback when API fails)
export const getMockApplications = () => {
  return [
    {
      id: 1,
      jobTitle: 'Senior React Developer',
      company: 'TechCorp Inc.',
      appliedDate: '2024-01-15',
      status: 'under_review',
      statusDate: '2024-01-16',
      matchScore: 85,
      nextStep: 'Technical Interview',
      timeline: [
        { step: 'Application Submitted', date: '2024-01-15', completed: true },
        { step: 'Under Review', date: '2024-01-16', completed: true },
        { step: 'Technical Interview', date: '2024-01-20', completed: false },
        { step: 'Final Interview', date: null, completed: false },
        { step: 'Offer', date: null, completed: false }
      ]
    },
    {
      id: 2,
      jobTitle: 'Full Stack Developer',
      company: 'StartupXYZ',
      appliedDate: '2024-01-10',
      status: 'interview_scheduled',
      statusDate: '2024-01-12',
      matchScore: 92,
      nextStep: 'Interview on Jan 25th',
      timeline: [
        { step: 'Application Submitted', date: '2024-01-10', completed: true },
        { step: 'Under Review', date: '2024-01-11', completed: true },
        { step: 'Interview Scheduled', date: '2024-01-12', completed: true },
        { step: 'Technical Interview', date: '2024-01-25', completed: false },
        { step: 'Final Decision', date: null, completed: false }
      ]
    },
    {
      id: 3,
      jobTitle: 'Python Developer',
      company: 'DataTech Solutions',
      appliedDate: '2024-01-05',
      status: 'rejected',
      statusDate: '2024-01-08',
      matchScore: 65,
      nextStep: 'Application closed',
      timeline: [
        { step: 'Application Submitted', date: '2024-01-05', completed: true },
        { step: 'Under Review', date: '2024-01-06', completed: true },
        { step: 'Application Closed', date: '2024-01-08', completed: true }
      ]
    }
  ];
};

export const getMockProfile = () => {
  return {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    current_title: 'Senior React Developer',
    total_experience_years: 5,
    highest_education: 'Bachelor Degree',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Django'],
    current_company: 'TechCorp Inc.',
    degree_field: 'Computer Science'
  };
};

export const getMockJobs = () => {
  return [
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'TechCorp Inc.',
      department: 'Engineering',
      location: 'San Francisco, CA',
      description: 'We are looking for a Senior React Developer to join our team...',
      min_experience_years: 5,
      experience_level: 'senior',
      employment_type: 'full_time',
      extracted_skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
      posted_date: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      department: 'Product',
      location: 'Remote',
      description: 'Join our fast-growing startup as a Full Stack Developer...',
      min_experience_years: 3,
      experience_level: 'mid',
      employment_type: 'full_time',
      extracted_skills: ['Python', 'Django', 'React', 'PostgreSQL'],
      posted_date: '2024-01-10T14:30:00Z'
    },
    {
      id: 3,
      title: 'Python Developer',
      company: 'DataTech Solutions',
      department: 'Data Science',
      location: 'New York, NY',
      description: 'We need a Python Developer to work on our data processing pipeline...',
      min_experience_years: 2,
      experience_level: 'junior',
      employment_type: 'full_time',
      extracted_skills: ['Python', 'Pandas', 'NumPy', 'SQL'],
      posted_date: '2024-01-05T09:15:00Z'
    }
  ];
}; 