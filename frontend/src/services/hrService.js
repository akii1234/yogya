import api from './api';

const HR_SERVICE_BASE_URL = 'http://localhost:8001/api/user-management';

export const hrService = {
  /**
   * Update HR user's organization
   * @param {string} organization - Organization name
   * @returns {Promise} API response
   */
  updateOrganization: async (organization) => {
    try {
      const response = await api.post(`${HR_SERVICE_BASE_URL}/hr/organization/`, {
        organization: organization
      });
      return response.data;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  },

  /**
   * Get HR profile information
   * @returns {Promise} HR profile data
   */
  getHRProfile: async () => {
    try {
      const response = await api.get(`${HR_SERVICE_BASE_URL}/hr-profiles/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching HR profile:', error);
      throw error;
    }
  },

  /**
   * Update HR profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Updated profile data
   */
  updateHRProfile: async (profileData) => {
    try {
      const response = await api.patch(`${HR_SERVICE_BASE_URL}/hr-profiles/`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating HR profile:', error);
      throw error;
    }
  }
};

export default hrService;
