import api from './api';

export const competencyService = {
  // Competency Frameworks
  getFrameworks: async () => {
    try {
      const response = await api.get('/competency/frameworks/');
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching frameworks:', error);
      throw error;
    }
  },

  getFramework: async (id) => {
    try {
      const response = await api.get(`/competency/frameworks/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching framework:', error);
      throw error;
    }
  },

  createFramework: async (data) => {
    try {
      const response = await api.post('/competency/frameworks/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating framework:', error);
      throw error;
    }
  },

  updateFramework: async (id, data) => {
    try {
      const response = await api.put(`/competency/frameworks/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating framework:', error);
      throw error;
    }
  },

  deleteFramework: async (id) => {
    try {
      await api.delete(`/competency/frameworks/${id}/`);
    } catch (error) {
      console.error('Error deleting framework:', error);
      throw error;
    }
  },

  // Competencies
  getCompetencies: async (frameworkId = null) => {
    try {
      const url = frameworkId 
        ? `/competency/competencies/?framework=${frameworkId}`
        : '/competency/competencies/';
      const response = await api.get(url);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching competencies:', error);
      throw error;
    }
  },

  getCompetency: async (id) => {
    try {
      const response = await api.get(`/competency/competencies/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching competency:', error);
      throw error;
    }
  },

  createCompetency: async (data) => {
    try {
      const response = await api.post('/competency/competencies/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating competency:', error);
      throw error;
    }
  },

  updateCompetency: async (id, data) => {
    try {
      const response = await api.put(`/competency/competencies/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating competency:', error);
      throw error;
    }
  },

  deleteCompetency: async (id) => {
    try {
      await api.delete(`/competency/competencies/${id}/`);
    } catch (error) {
      console.error('Error deleting competency:', error);
      throw error;
    }
  },

  // Interview Templates
  getTemplates: async (frameworkId = null) => {
    try {
      const url = frameworkId 
        ? `/competency/templates/?framework=${frameworkId}`
        : '/competency/templates/';
      const response = await api.get(url);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  getTemplate: async (id) => {
    try {
      const response = await api.get(`/competency/templates/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  createTemplate: async (data) => {
    try {
      const response = await api.post('/competency/templates/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  updateTemplate: async (id, data) => {
    try {
      const response = await api.put(`/competency/templates/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  deleteTemplate: async (id) => {
    try {
      await api.delete(`/competency/templates/${id}/`);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Interview Questions
  getQuestions: async (templateId = null) => {
    try {
      const url = templateId 
        ? `/competency/questions/?template=${templateId}`
        : '/competency/questions/';
      const response = await api.get(url);
      return response.data.results || response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  },

  createQuestion: async (data) => {
    try {
      const response = await api.post('/competency/questions/', data);
      return response.data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  updateQuestion: async (id, data) => {
    try {
      const response = await api.put(`/competency/questions/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  },

  deleteQuestion: async (id) => {
    try {
      await api.delete(`/competency/questions/${id}/`);
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  },

  // Framework Recommendation
  recommendFramework: async (jobDescriptionId, candidateId) => {
    try {
      const response = await api.post('/competency/recommend-framework/', {
        job_description_id: jobDescriptionId,
        candidate_id: candidateId
      });
      return response.data;
    } catch (error) {
      console.error('Error recommending framework:', error);
      throw error;
    }
  }
}; 