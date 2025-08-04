import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Alert,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon
} from '@mui/icons-material';
import {
  COMMON_SKILLS,
  extractSkillsFromText,
  searchSkills,
  getSkillsByCategory
} from '../../services/skillsService';

const SkillsInput = ({ 
  skills = [], 
  onSkillsChange, 
  jobDescription = '', 
  jobRequirements = '',
  label = "Key Skills",
  placeholder = "Add skills..."
}) => {
  const [inputValue, setInputValue] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoExtractedSkills, setAutoExtractedSkills] = useState([]);
  const [showAutoExtractAlert, setShowAutoExtractAlert] = useState(false);

  // Auto-extract skills when job description or requirements change
  useEffect(() => {
    if (jobDescription || jobRequirements) {
      const combinedText = `${jobDescription} ${jobRequirements}`;
      const extracted = extractSkillsFromText(combinedText);
      setAutoExtractedSkills(extracted);
      
      // Show alert if new skills were found
      if (extracted.length > 0 && skills.length === 0) {
        setShowAutoExtractAlert(true);
      }
    }
  }, [jobDescription, jobRequirements, skills.length]);

  const handleAddSkill = (skill) => {
    if (skill && !skills.includes(skill)) {
      const newSkills = [...skills, skill];
      onSkillsChange(newSkills);
    }
    setInputValue('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    const newSkills = skills.filter(skill => skill !== skillToRemove);
    onSkillsChange(newSkills);
  };

  const handleAutoExtract = () => {
    const combinedText = `${jobDescription} ${jobRequirements}`;
    const extracted = extractSkillsFromText(combinedText);
    
    // Add extracted skills that aren't already in the list
    const newSkills = [...skills];
    extracted.forEach(skill => {
      if (!newSkills.includes(skill)) {
        newSkills.push(skill);
      }
    });
    
    onSkillsChange(newSkills);
    setShowAutoExtractAlert(false);
  };

  const handleAddFromDialog = (skill) => {
    handleAddSkill(skill);
    setDialogOpen(false);
  };

  const filteredSkills = searchQuery ? searchSkills(searchQuery) : COMMON_SKILLS.slice(0, 20);
  const skillsByCategory = getSkillsByCategory();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" fontWeight={600}>
          {label}
        </Typography>
        {autoExtractedSkills.length > 0 && (
          <Tooltip title="Auto-extract skills from job description">
            <IconButton
              onClick={handleAutoExtract}
              color="primary"
              size="small"
              sx={{ ml: 2 }}
            >
              <AutoAwesomeIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Auto-extract Alert */}
      {showAutoExtractAlert && autoExtractedSkills.length > 0 && (
        <Alert 
          severity="info" 
          sx={{ mb: 4 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleAutoExtract}
              startIcon={<AutoAwesomeIcon />}
            >
              Add {autoExtractedSkills.length} Skills
            </Button>
          }
          onClose={() => setShowAutoExtractAlert(false)}
        >
          We found {autoExtractedSkills.length} skills in your job description: {autoExtractedSkills.join(', ')}
        </Alert>
      )}

      {/* Skills Input Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} md={8}>
            <Autocomplete
              freeSolo
              options={filteredSkills}
              value={inputValue}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleAddSkill(newValue);
                }
              }}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={placeholder}
                  variant="outlined"
                  size="medium"
                  fullWidth
                  label="Search and add skills"
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Typography variant="body2">{option}</Typography>
                </li>
              )}
              ListboxProps={{
                style: {
                  maxHeight: 200
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              onClick={() => setDialogOpen(true)}
              startIcon={<SearchIcon />}
              size="large"
              fullWidth
              sx={{ height: 56 }}
            >
              Browse Skills
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Skills Display */}
      {skills.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Selected Skills ({skills.length})
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {skills.map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                onDelete={() => handleRemoveSkill(skill)}
                color="primary"
                variant="outlined"
                size="medium"
                sx={{ mb: 1 }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Skills Browser Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>Browse Skills</Typography>
            <TextField
              size="small"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2 }}>
          {searchQuery ? (
            // Search Results
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Search Results for "{searchQuery}"
              </Typography>
              <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                {filteredSkills.map((skill) => (
                  <ListItem key={skill} disablePadding>
                    <ListItemButton onClick={() => handleAddFromDialog(skill)}>
                      <ListItemText primary={skill} />
                      {skills.includes(skill) && (
                        <Chip label="Added" size="small" color="success" />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : (
            // Categorized Skills
            <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
              {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                <Accordion key={category} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {category} ({categorySkills.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={1}>
                      {categorySkills.map((skill) => (
                        <Grid item xs={12} sm={6} md={4} key={skill}>
                          <Button
                            variant={skills.includes(skill) ? "contained" : "outlined"}
                            size="small"
                            onClick={() => handleAddFromDialog(skill)}
                            fullWidth
                            sx={{ 
                              justifyContent: 'flex-start',
                              textTransform: 'none',
                              py: 1.5,
                              px: 2
                            }}
                          >
                            {skill}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SkillsInput; 