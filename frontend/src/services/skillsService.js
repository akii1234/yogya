import api from './api';

// Common technical skills database
export const COMMON_SKILLS = [
  // Programming Languages
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala',
  
  // Web Technologies
  'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
  'ASP.NET', 'Laravel', 'Ruby on Rails', 'Next.js', 'Nuxt.js', 'Svelte', 'Ember.js',
  
  // Databases
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Cassandra', 'DynamoDB', 'Elasticsearch',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitLab CI', 'GitHub Actions',
  'Ansible', 'Chef', 'Puppet', 'Vagrant', 'Vagrant',
  
  // Tools & Frameworks
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence', 'Slack', 'Trello', 'Asana', 'Figma', 'Sketch',
  'Postman', 'Insomnia', 'Swagger', 'GraphQL', 'REST API', 'SOAP', 'WebSocket',
  
  // Data Science & ML
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Jupyter', 'R', 'SAS', 'SPSS',
  
  // Mobile Development
  'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Cordova', 'PhoneGap', 'Android Studio', 'Xcode',
  
  // Testing
  'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium', 'Playwright', 'Puppeteer', 'JUnit', 'PyTest', 'NUnit',
  
  // Methodologies
  'Agile', 'Scrum', 'Kanban', 'Waterfall', 'DevOps', 'CI/CD', 'TDD', 'BDD', 'DDD',
  
  // Soft Skills
  'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration', 'Project Management', 'Mentoring',
  'Technical Writing', 'Presentation Skills', 'Time Management', 'Critical Thinking'
];

// Auto-extract skills from job description text
export const extractSkillsFromText = (text) => {
  if (!text) return [];
  
  const lowerText = text.toLowerCase();
  const extractedSkills = [];
  
  COMMON_SKILLS.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (lowerText.includes(skillLower)) {
      extractedSkills.push(skill);
    }
  });
  
  return [...new Set(extractedSkills)]; // Remove duplicates
};

// Search skills with fuzzy matching
export const searchSkills = (query) => {
  if (!query) return COMMON_SKILLS.slice(0, 20); // Return first 20 if no query
  
  const lowerQuery = query.toLowerCase();
  return COMMON_SKILLS
    .filter(skill => skill.toLowerCase().includes(lowerQuery))
    .slice(0, 15); // Limit results
};

// Get skills by category
export const getSkillsByCategory = () => {
  return {
    'Programming Languages': COMMON_SKILLS.slice(0, 13),
    'Web Technologies': COMMON_SKILLS.slice(13, 30),
    'Databases': COMMON_SKILLS.slice(30, 40),
    'Cloud & DevOps': COMMON_SKILLS.slice(40, 52),
    'Tools & Frameworks': COMMON_SKILLS.slice(52, 65),
    'Data Science & ML': COMMON_SKILLS.slice(65, 75),
    'Mobile Development': COMMON_SKILLS.slice(75, 83),
    'Testing': COMMON_SKILLS.slice(83, 92),
    'Methodologies': COMMON_SKILLS.slice(92, 101),
    'Soft Skills': COMMON_SKILLS.slice(101)
  };
};

// API calls for skills management (if backend supports it)
export const fetchSkillsFromBackend = async () => {
  try {
    const response = await api.get('/skills/');
    return response.data;
  } catch (error) {
    console.log('Backend skills API not available, using local skills');
    return COMMON_SKILLS;
  }
};

export const saveSkillsToBackend = async (skills) => {
  try {
    const response = await api.post('/skills/', { skills });
    return response.data;
  } catch (error) {
    console.log('Backend skills API not available');
    return skills;
  }
}; 