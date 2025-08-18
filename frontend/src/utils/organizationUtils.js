/**
 * Organization utilities for HR users
 */

/**
 * Extract organization name from email domain
 * @param {string} email - User email address
 * @returns {string} Organization name
 */
export const extractOrganizationFromEmail = (email) => {
  if (!email || !email.includes('@')) {
    return null;
  }
  
  const domain = email.split('@')[1];
  if (!domain) {
    return null;
  }
  
  // Remove common TLDs and get organization name
  const organization = domain.split('.')[0];
  return organization.charAt(0).toUpperCase() + organization.slice(1);
};

/**
 * Get organization name for HR user
 * @param {Object} user - User object with email and hr_profile
 * @returns {string|null} Organization name
 */
export const getHROrganization = (user) => {
  if (!user || user.role !== 'hr') {
    return null;
  }
  
  // First try to get from HR profile
  if (user.hr_profile?.organization) {
    return user.hr_profile.organization;
  }
  
  // Fallback to email domain extraction
  return extractOrganizationFromEmail(user.email);
};

/**
 * Check if HR user has organization set
 * @param {Object} user - User object
 * @returns {boolean} True if organization is set
 */
export const hasOrganizationSet = (user) => {
  if (!user || user.role !== 'hr') {
    return true; // Non-HR users don't need organization
  }
  
  return !!(user.hr_profile?.organization || extractOrganizationFromEmail(user.email));
};

/**
 * Format job activity display
 * @param {string} jobTitle - Job title
 * @param {string} jobCode - Job code (e.g., JOB-ABC123)
 * @returns {string} Formatted display string
 */
export const formatJobActivity = (jobTitle, jobCode) => {
  if (!jobTitle || !jobCode) {
    return jobTitle || 'Unknown Job';
  }
  
  return `${jobTitle} - ${jobCode}`;
};
