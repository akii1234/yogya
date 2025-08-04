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
  Chip,
  Grid
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const CandidateForm = ({ candidate, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    current_position: '',
    current_company: '',
    experience_years: '',
    education_level: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    status: 'active'
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Common technical skills for auto-suggestion
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

  useEffect(() => {
    if (candidate) {
      setFormData({
        first_name: candidate.first_name || '',
        last_name: candidate.last_name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        current_position: candidate.current_position || '',
        current_company: candidate.current_company || '',
        experience_years: candidate.experience_years || '',
        education_level: candidate.education_level || '',
        location: candidate.location || '',
        linkedin_url: candidate.linkedin_url || '',
        github_url: candidate.github_url || '',
        portfolio_url: candidate.portfolio_url || '',
        status: candidate.status || 'active'
      });
      setSkills(candidate.extracted_skills || []);
    }
  }, [candidate]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const candidateData = {
        ...formData,
        experience_years: parseInt(formData.experience_years) || null,
        extracted_skills: skills
      };

      // TODO: Replace with actual API call
      console.log('Saving candidate:', candidateData);
      
      setSuccess(true);
      
      if (!candidate) {
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          current_position: '',
          current_company: '',
          experience_years: '',
          education_level: '',
          location: '',
          linkedin_url: '',
          github_url: '',
          portfolio_url: '',
          status: 'active'
        });
        setSkills([]);
      }
      
      if (onSave) {
        onSave();
      }
    } catch (err) {
      setError('Failed to save candidate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
        <PersonIcon sx={{ mr: 1 }} />
        {candidate ? 'Edit Candidate Profile' : 'Add New Candidate'}
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Candidate profile {candidate ? 'updated' : 'created'} successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* Personal Information */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  value={formData.first_name}
                  onChange={handleInputChange('first_name')}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  value={formData.last_name}
                  onChange={handleInputChange('last_name')}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  fullWidth
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Location"
                  value={formData.location}
                  onChange={handleInputChange('location')}
                  placeholder="e.g., New York, NY"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>

          {/* Professional Information */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
              Professional Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Current Position"
                  value={formData.current_position}
                  onChange={handleInputChange('current_position')}
                  placeholder="e.g., Senior Software Engineer"
                  fullWidth
                  InputProps={{
                    startAdornment: <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Current Company"
                  value={formData.current_company}
                  onChange={handleInputChange('current_company')}
                  placeholder="e.g., Tech Corp"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Years of Experience"
                  type="number"
                  value={formData.experience_years}
                  onChange={handleInputChange('experience_years')}
                  placeholder="e.g., 5"
                  fullWidth
                  inputProps={{ min: 0, max: 50 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Education Level</InputLabel>
                  <Select
                    value={formData.education_level}
                    onChange={handleInputChange('education_level')}
                    label="Education Level"
                    InputProps={{
                      startAdornment: <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  >
                    <MenuItem value="high_school">High School</MenuItem>
                    <MenuItem value="associate">Associate Degree</MenuItem>
                    <MenuItem value="bachelor">Bachelor's Degree</MenuItem>
                    <MenuItem value="master">Master's Degree</MenuItem>
                    <MenuItem value="phd">PhD</MenuItem>
                    <MenuItem value="self_taught">Self-Taught</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Online Profiles */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
              Online Profiles
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="LinkedIn URL"
                  value={formData.linkedin_url}
                  onChange={handleInputChange('linkedin_url')}
                  placeholder="https://linkedin.com/in/username"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="GitHub URL"
                  value={formData.github_url}
                  onChange={handleInputChange('github_url')}
                  placeholder="https://github.com/username"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Portfolio URL"
                  value={formData.portfolio_url}
                  onChange={handleInputChange('portfolio_url')}
                  placeholder="https://portfolio.com"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>

          {/* Skills */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
              Skills & Expertise
            </Typography>
            
            {skills.length > 0 && (
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <TextField
                label="Add Skill"
                placeholder="Type a skill and press Enter"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddSkill}
                disabled={!newSkill.trim()}
                sx={{ height: 56 }}
              >
                Add
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Common skills: {COMMON_SKILLS.slice(0, 10).join(', ')}...
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formData.first_name || !formData.last_name || !formData.email}
            >
              {loading ? <CircularProgress size={20} /> : (candidate ? 'Update Profile' : 'Add Candidate')}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default CandidateForm; 