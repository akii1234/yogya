import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { createJobDescription, updateJobDescription } from '../../services/jobService';
import { useAuth } from '../../contexts/AuthContext';
import { getHROrganization } from '../../utils/organizationUtils';

// Common technical skills for auto-extraction
const COMMON_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Scala',
  'HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
  'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Cassandra', 'DynamoDB', 'Elasticsearch',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'GitLab CI', 'GitHub Actions',
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence', 'Slack', 'Trello', 'Asana', 'Figma', 'Sketch',
  'Postman', 'Insomnia', 'Swagger', 'GraphQL', 'REST API', 'SOAP', 'WebSocket',
  'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Jupyter', 'R', 'SAS', 'SPSS',
  'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Cordova', 'PhoneGap', 'Android Studio', 'Xcode',
  'Jest', 'Mocha', 'Chai', 'Cypress', 'Selenium', 'Playwright', 'Puppeteer', 'JUnit', 'PyTest', 'NUnit',
  'Agile', 'Scrum', 'Kanban', 'Waterfall', 'DevOps', 'CI/CD', 'TDD', 'BDD', 'DDD',
  'Leadership', 'Communication', 'Problem Solving', 'Team Collaboration', 'Project Management', 'Mentoring',
  'Technical Writing', 'Presentation Skills', 'Time Management', 'Critical Thinking'
];

// Auto-extract skills from text
const extractSkillsFromText = (text) => {
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

const JobDescriptionForm = ({ job, onSave, onCancel }) => {
  const { user } = useAuth();
  const organization = getHROrganization(user);
  
  const [formData, setFormData] = useState({
    title: '',
    company: organization || '',
    department: '',
    location: '',
    description: '',
    requirements: '',
    experience_level: '',
    min_experience_years: '',
    employment_type: '',
    status: 'active'
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showAutoExtractAlert, setShowAutoExtractAlert] = useState(false);
  const [autoExtractedSkills, setAutoExtractedSkills] = useState([]);

  // Auto-extract skills when job description or requirements change
  useEffect(() => {
    if (formData.description || formData.requirements) {
      const combinedText = `${formData.description} ${formData.requirements}`;
      const extracted = extractSkillsFromText(combinedText);
      setAutoExtractedSkills(extracted);
      
      if (extracted.length > 0 && skills.length === 0) {
        setShowAutoExtractAlert(true);
      }
    }
  }, [formData.description, formData.requirements, skills.length]);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        company: job.company || '',
        department: job.department || '',
        location: job.location || '',
        description: job.description || '',
        requirements: job.requirements || '',
        experience_level: job.experience_level || '',
        min_experience_years: job.min_experience_years || '',
        employment_type: job.employment_type || '',
        status: job.status || 'active'
      });
      setSkills(job.extracted_skills || []);
    }
  }, [job]);

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleAutoExtract = () => {
    const combinedText = `${formData.description} ${formData.requirements}`;
    const extracted = extractSkillsFromText(combinedText);
    
    const newSkills = [...skills];
    extracted.forEach(skill => {
      if (!newSkills.includes(skill)) {
        newSkills.push(skill);
      }
    });
    
    setSkills(newSkills);
    setShowAutoExtractAlert(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const jobData = {
        ...formData,
        company: organization || formData.company,
        min_experience_years: parseInt(formData.min_experience_years) || null,
        extracted_skills: skills
      };

      if (job) {
        await updateJobDescription(job.id, jobData);
      } else {
        await createJobDescription(jobData);
      }
      
      setSuccess(true);
      
      if (!job) {
        setFormData({
          title: '',
          company: organization || '',
          department: '',
          location: '',
          description: '',
          requirements: '',
          experience_level: '',
          min_experience_years: '',
          employment_type: '',
          status: 'active'
        });
        setSkills([]);
      }
      
      if (onSave) {
        onSave();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save job description. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        {job ? 'Edit Job Description' : 'Create Job Description'}
      </Typography>



      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Job description {job ? 'updated' : 'created'} successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {showAutoExtractAlert && autoExtractedSkills.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleAutoExtract}
            >
              Add {autoExtractedSkills.length} Skills
            </Button>
          }
          onClose={() => setShowAutoExtractAlert(false)}
        >
          We found {autoExtractedSkills.length} skills in your job description: {autoExtractedSkills.join(', ')}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          <TextField
            label="Job Title"
            value={formData.title}
            onChange={handleInputChange('title')}
            required
            placeholder="e.g., Senior React Developer"
            fullWidth
          />

          <TextField
            label="Department"
            value={formData.department}
            onChange={handleInputChange('department')}
            placeholder="e.g., Engineering"
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Location</InputLabel>
            <Select
              value={formData.location}
              onChange={handleInputChange('location')}
              label="Location"
            >
              <MenuItem value="Remote">Remote</MenuItem>
              <MenuItem value="New York, NY">New York, NY</MenuItem>
              <MenuItem value="San Francisco, CA">San Francisco, CA</MenuItem>
              <MenuItem value="Hybrid">Hybrid</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel>Experience Level</InputLabel>
              <Select
                value={formData.experience_level}
                onChange={handleInputChange('experience_level')}
                label="Experience Level"
              >
                <MenuItem value="entry">Entry Level</MenuItem>
                <MenuItem value="junior">Junior</MenuItem>
                <MenuItem value="mid">Mid Level</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
                <MenuItem value="lead">Lead</MenuItem>
              </Select>
            </FormControl>

            <TextField
              sx={{ flex: 1 }}
              label="Min Experience (Years)"
              type="number"
              value={formData.min_experience_years}
              onChange={handleInputChange('min_experience_years')}
              placeholder="e.g., 3"
              inputProps={{ min: 0, max: 20 }}
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel>Employment Type</InputLabel>
            <Select
              value={formData.employment_type}
              onChange={handleInputChange('employment_type')}
              label="Employment Type"
            >
              <MenuItem value="full_time">Full Time</MenuItem>
              <MenuItem value="part_time">Part Time</MenuItem>
              <MenuItem value="contract">Contract</MenuItem>
              <MenuItem value="internship">Internship</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Job Description"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleInputChange('description')}
            required
            placeholder="We are looking for a talented React developer..."
            fullWidth
          />

          <TextField
            label="Requirements"
            multiline
            rows={4}
            value={formData.requirements}
            onChange={handleInputChange('requirements')}
            required
            placeholder="Strong React skills, TypeScript experience..."
            fullWidth
          />

          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Skills
            </Typography>
            
            {skills.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    size="small"
                  />
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Add skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddSkill}
                disabled={!newSkill.trim()}
                size="small"
              >
                Add
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formData.title}
            >
              {loading ? <CircularProgress size={20} /> : (job ? 'Update' : 'Create')}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default JobDescriptionForm; 