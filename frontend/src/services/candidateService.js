import api from './api';

// Helper function to get current user email
const getCurrentUserEmail = () => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData).email : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Job Application Services
export const submitJobApplication = async (jobId, applicationData) => {
  try {
    const response = await api.post(`/candidate-portal/apply-job/`, {
      job_id: jobId,
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

export const getMyApplications = async () => {
  try {
    const response = await api.get('/candidate-portal/my-applications/');
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
    const response = await api.get('/users/candidate-profiles/my_profile/');
    return response.data;
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    // Fallback to mock data if API fails
    return getMockProfile();
  }
};

// Enhanced profile fetching function that merges data from all sources
export const getCompleteProfile = async () => {
  try {
    console.log('🔄 Fetching complete profile from all data sources...');
    
    // Try to get current user's candidate data directly first
    let candidateData = null;
    try {
      const candidateResponse = await api.get('/candidate-portal/candidate-profile/');
      candidateData = candidateResponse.data;
      console.log('✅ Found candidate data via candidate-profile endpoint:', candidateData);
    } catch (err) {
      console.warn('Candidate profile endpoint not available, trying fallback...', err);
      
      // Fallback: Get all candidates and find the current user's data
      const candidatesResponse = await api.get('/candidates/').catch(err => {
        console.warn('Candidates API not available:', err);
        return { data: { results: [] } };
      });
      
      const allCandidates = candidatesResponse.data?.results || [];
      console.log('🔍 All candidates found:', allCandidates.length);
      
      // Get current user email from localStorage or context
      const currentUserEmail = getCurrentUserEmail();
      console.log('🔍 Current user email:', currentUserEmail);
      
      // Find candidate that matches current user's email
      candidateData = allCandidates.find(candidate => 
        candidate.email === currentUserEmail
      ) || null;
      
      console.log('🔍 Found candidate for current user:', candidateData);
    }
    
    // Get other data sources
    const [userProfileResponse, resumeResponse] = await Promise.all([
      api.get('/users/candidate-profiles/my_profile/').catch(err => {
        console.warn('User profile API not available:', err);
        return { data: null };
      }),
      api.get('/candidate-portal/my-resumes/').catch(err => {
        console.warn('Resume API not available:', err);
        return { data: { resumes: [], total_count: 0 } };
      })
    ]);
    const userProfile = userProfileResponse.data;
    const resumes = resumeResponse.data?.resumes || [];
    const latestResume = resumes[0] || null;

    console.log('📊 Data sources:', {
      candidateData: !!candidateData,
      userProfile: !!userProfile,
      resumeCount: resumes.length
    });

    // Build complete profile by merging data intelligently
    let completeProfile = {};

    // Priority 1: Use candidate model data (has extracted skills and rich info)
    if (candidateData) {
      completeProfile = {
        id: candidateData.id,
        candidate_id: candidateData.candidate_id,
        first_name: candidateData.first_name,
        last_name: candidateData.last_name,
        full_name: `${candidateData.first_name} ${candidateData.last_name}`.trim(),
        email: candidateData.email,
        phone: candidateData.phone || '',
        city: candidateData.city,
        state: candidateData.state,
        country: candidateData.country,
        current_title: candidateData.current_title,
        current_company: candidateData.current_company,
        total_experience_years: candidateData.total_experience_years,
        highest_education: candidateData.highest_education,
        degree_field: candidateData.degree_field,
        skills: candidateData.skills || [],
        status: candidateData.status,
        created_at: candidateData.created_at,
        updated_at: candidateData.updated_at
      };
    } else if (userProfile?.user) {
      // Fallback: Use user profile data
      completeProfile = {
        first_name: userProfile.user.first_name,
        last_name: userProfile.user.last_name,
        full_name: userProfile.user.full_name,
        email: userProfile.user.email,
        phone: userProfile.user.phone_number || '',
        skills: [],
        status: 'active'
      };
    }

    // Priority 2: Overlay user preferences and social links
    if (userProfile) {
      completeProfile.linkedin_url = userProfile.linkedin_url;
      completeProfile.github_url = userProfile.github_url;
      completeProfile.portfolio_url = userProfile.portfolio_url;
      completeProfile.preferred_job_types = userProfile.preferred_job_types || [];
      completeProfile.preferred_locations = userProfile.preferred_locations || [];
      completeProfile.salary_expectations = userProfile.salary_expectations || {};
      completeProfile.profile_visibility = userProfile.profile_visibility;
      completeProfile.total_applications = userProfile.total_applications || 0;
      completeProfile.applications_this_month = userProfile.applications_this_month || 0;
    }

    // Priority 3: Add resume context and metadata
    completeProfile.resumeCount = resumes.length;
    completeProfile.hasResume = resumes.length > 0;
    completeProfile.latestResume = latestResume;
    
    if (latestResume) {
      completeProfile.resume_file_name = latestResume.file_name;
      completeProfile.resume_uploaded_at = latestResume.uploaded_at;
      completeProfile.resume_processing_status = latestResume.processing_status;
      
      // If candidate model doesn't have skills but resume does, use resume skills
      if (!completeProfile.skills?.length && latestResume.extracted_skills?.length) {
        completeProfile.skills = latestResume.extracted_skills;
      }
    }

    console.log('✅ Complete profile assembled:', {
      hasBasicInfo: !!(completeProfile.first_name && completeProfile.last_name),
      hasSkills: !!(completeProfile.skills?.length),
      hasResume: completeProfile.hasResume,
      skillsCount: completeProfile.skills?.length || 0
    });

    return completeProfile;

  } catch (error) {
    console.error('❌ Error fetching complete profile:', error);
    // Return minimal profile structure to prevent UI crashes
    return {
      first_name: '',
      last_name: '',
      full_name: '',
      email: '',
      phone: '',
      skills: [],
      resumeCount: 0,
      hasResume: false,
      status: 'active'
    };
  }
};

export const checkProfileCompletion = async () => {
  try {
    console.log('🔍 Checking profile completion status...');
    
    // Get complete profile data
    const profile = await getCompleteProfile();
    
    // Determine completion status
    const hasBasicInfo = !!(profile.first_name && profile.last_name && profile.email);
    const hasResume = profile.hasResume;
    const hasSkills = !!(profile.skills?.length);
    
    // Profile is complete if they have basic info and a resume with extracted skills
    const isProfileComplete = hasBasicInfo && hasResume && hasSkills;
    
    console.log('📋 Profile completion status:', {
      isComplete: isProfileComplete,
      hasBasicInfo,
      hasResume,
      hasSkills,
      skillsCount: profile.skills?.length || 0,
      resumeCount: profile.resumeCount
    });

    return {
      isComplete: isProfileComplete,
      hasResume,
      hasBasicInfo,
      hasSkills,
      profile,
      resumeCount: profile.resumeCount,
      skillsCount: profile.skills?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Error checking profile completion:', error);
    return {
      isComplete: false,
      hasResume: false,
      hasBasicInfo: false,
      hasSkills: false,
      profile: null,
      resumeCount: 0,
      skillsCount: 0
    };
  }
};

export const analyzeResume = async (jobDescription) => {
  try {
    console.log('🔍 Analyzing resume against job description...');
    
    const response = await api.post('/candidate-portal/analyze-resume/', {
      job_description: jobDescription
    });
    
    console.log('✅ Resume analysis completed:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error analyzing resume:', error);
    throw error;
  }
};

export const getDetailedMatchAnalysis = async (jobId) => {
  try {
    console.log('🔍 Getting detailed match analysis for job:', jobId);
    
    const response = await api.post('/candidate-portal/detailed-match-analysis/', {
      job_id: jobId
    });
    
    console.log('✅ Detailed match analysis completed:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error getting detailed match analysis:', error);
    throw error;
  }
};

// Enhanced Coding Questions Services
export const getEnhancedCodingQuestions = async (jobId) => {
  try {
    console.log('🎯 Fetching enhanced coding questions for job:', jobId);
    const response = await api.post('/candidate-portal/enhanced-coding-questions/', {
      job_id: jobId
    });
    console.log('✅ Enhanced coding questions received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching enhanced coding questions:', error);
    throw error;
  }
};

export const trackQuestionPerformance = async (questionData) => {
  try {
    console.log('📊 Tracking question performance:', questionData);
    const response = await api.post('/candidate-portal/track-question-performance/', {
      question_id: questionData.questionId,
      time_taken: questionData.timeTaken,
      accuracy: questionData.accuracy,
      difficulty_rating: questionData.difficultyRating
    });
    console.log('✅ Performance tracked successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error tracking question performance:', error);
    throw error;
  }
};

export const executeCode = async (code, language = 'python') => {
  try {
    console.log('🚀 Executing code:', { code: code.substring(0, 100) + '...', language });
    const response = await api.post('/code/execute/', {
      code: code,
      language: language
    });
    console.log('✅ Code executed successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error executing code:', error);
    throw error;
  }
};

export const updateCandidateProfile = async (profileData) => {
  try {
    console.log('🔄 DEBUG: updateCandidateProfile called with:', profileData);
    
    // Get the current candidate data
    const candidatesResponse = await api.get('/candidates/');
    const candidateData = candidatesResponse.data?.results?.[0];
    
    if (!candidateData) {
      throw new Error('No candidate profile found');
    }
    
    console.log('🔄 DEBUG: Found candidate ID:', candidateData.id);
    
    // Prepare candidate update data (only candidate model fields)
    const candidateUpdateData = {
      phone: profileData.phone,
      city: profileData.city,
      state: profileData.state,
      country: profileData.country,
      current_title: profileData.current_title,
      current_company: profileData.current_company,
      total_experience_years: profileData.total_experience_years,
      highest_education: profileData.highest_education,
      degree_field: profileData.degree_field
    };
    
    console.log('🔄 DEBUG: Updating candidate with:', candidateUpdateData);
    
    // Update the candidate model
    const candidateResponse = await api.patch(`/candidates/${candidateData.id}/`, candidateUpdateData);
    console.log('✅ DEBUG: Candidate updated:', candidateResponse.data);
    
    // Also update user profile for basic info
    const currentProfile = await api.get('/users/candidate-profiles/my_profile/');
    const profileId = currentProfile.data.id;
    
    const userProfileData = {
      linkedin_url: profileData.linkedin_url,
      github_url: profileData.github_url,
      portfolio_url: profileData.portfolio_url,
      preferred_job_types: profileData.preferred_job_types,
      preferred_locations: profileData.preferred_locations,
      salary_expectations: profileData.salary_expectations
    };
    
    const userProfileResponse = await api.patch(`/users/candidate-profiles/${profileId}/`, userProfileData);
    console.log('✅ DEBUG: User profile updated:', userProfileResponse.data);
    
    return { profile: candidateResponse.data };
  } catch (error) {
    console.error('❌ DEBUG: Error updating candidate profile:', error);
    throw error;
  }
};

export const updateCandidateSkills = async (skills) => {
  try {
    console.log('🔄 DEBUG: Updating candidate skills:', skills);
    
    // Get the current candidate data
    const candidatesResponse = await api.get('/candidates/');
    const candidateData = candidatesResponse.data?.results?.[0];
    
    if (!candidateData) {
      throw new Error('No candidate profile found');
    }
    
    console.log('🔄 DEBUG: Found candidate ID:', candidateData.id);
    
    // Update the candidate with new skills
    const response = await api.patch(`/candidates/${candidateData.id}/`, {
      skills: skills
    });
    
    console.log('✅ DEBUG: Skills updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ DEBUG: Error updating candidate skills:', error);
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

export const getMyResumes = async () => {
  try {
    const response = await api.get('/candidate-portal/my-resumes/');
    return response.data;
  } catch (error) {
    console.error('Error fetching resumes:', error);
    // Return empty result for now if API fails
    return { resumes: [], total_count: 0 };
  }
};

export const deleteResume = async (resumeId) => {
  try {
    const response = await api.delete(`/candidate-portal/delete-resume/`, {
      data: {
        resume_id: resumeId
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
    
    // Add new match score filtering parameters
    if (filters.minMatchScore !== undefined) params.append('min_match_score', filters.minMatchScore);
    if (filters.showOnlyMatches !== undefined) params.append('show_only_matches', filters.showOnlyMatches);
    
    const url = `/candidate-portal/browse-jobs/?${params.toString()}`;
    console.log('🌐 Making API call to:', url);
    console.log('🔍 Parameters being sent:', {
      showOnlyMatches: filters.showOnlyMatches,
      minMatchScore: filters.minMatchScore,
      params: params.toString()
    });
    
    const response = await api.get(url);
    console.log('✅ API response:', response.data);
    return {
      jobs: response.data.jobs || [],
      totalCount: response.data.total_count || 0,
      totalAvailable: response.data.total_available || 0,
      filtersApplied: response.data.filters_applied || {}
    };
  } catch (error) {
    console.error('❌ Error searching jobs:', error);
    console.log('🔄 Falling back to mock data');
    // Fallback to mock data if API fails
    return {
      jobs: getMockJobs(),
      totalCount: 0,
      totalAvailable: 0,
      filtersApplied: {}
    };
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