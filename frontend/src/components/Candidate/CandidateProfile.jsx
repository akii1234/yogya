import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import DescriptionIcon from '@mui/icons-material/Description';
import { getCompleteProfile, updateCandidateProfile, updateCandidateSkills, uploadResume, getMyResumes, deleteResume } from '../../services/candidateService';

const CandidateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Get candidate ID from user context or use null for API to auto-detect
  const candidateId = null; // API will auto-detect based on authenticated user

  useEffect(() => {
    loadProfile();
    loadResumes();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('🔄 DEBUG: Loading complete profile data...');
      const data = await getCompleteProfile();
      console.log('✅ DEBUG: Complete profile data received:', data);
      setProfile(data);
      setEditData(data);
    } catch (error) {
      console.error('❌ DEBUG: Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadResumes = async () => {
    try {
      const data = await getMyResumes(candidateId);
      setResumes(data.resumes || []);
    } catch (error) {
      console.error('Error loading resumes:', error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setEditData({ ...profile });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('🔄 DEBUG: Saving profile with data:', editData);
      console.log('🔄 DEBUG: Skills to save:', editData.skills);
      
      // Update candidate skills separately
      if (editData.skills) {
        await updateCandidateSkills(editData.skills);
      }
      
      // Update other profile data
      const result = await updateCandidateProfile(editData);
      console.log('✅ DEBUG: Save result:', result);
      
      // Update local state immediately to prevent refresh issues
      setProfile(result.profile);
      setEditing(false);
      
      console.log('✅ DEBUG: Profile updated successfully');
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('❌ DEBUG: Error saving profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditData({ ...profile });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !editData.skills?.includes(newSkill.trim())) {
      setEditData({
        ...editData,
        skills: [...(editData.skills || []), newSkill.trim()]
      });
      setNewSkill('');
      setSkillDialogOpen(false);
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    console.log('🔄 DEBUG: Removing skill:', skillToRemove);
    const updatedSkills = editData.skills?.filter(skill => skill !== skillToRemove) || [];
    console.log('🔄 DEBUG: Updated skills:', updatedSkills);
    
    setEditData({
      ...editData,
      skills: updatedSkills
    });
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadResume = async () => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('resume_file', selectedFile);
      formData.append('candidate_id', candidateId);

      const result = await uploadResume(formData);
      
      // Reload resumes and profile to get updated skills
      await loadResumes();
      await loadProfile();
      
      setSelectedFile(null);
      alert('Resume uploaded successfully! Skills have been updated from your resume.');
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = (resumeId) => {
    setResumeToDelete(resumeId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteResume = async () => {
    if (!resumeToDelete) return;

    try {
      setDeleting(true);
      await deleteResume(resumeToDelete, candidateId);
      
      // Reload resumes list
      await loadResumes();
      
      setDeleteDialogOpen(false);
      setResumeToDelete(null);
      alert('Resume deleted successfully!');
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const cancelDeleteResume = () => {
    setDeleteDialogOpen(false);
    setResumeToDelete(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">My Profile</Typography>
        {!editing ? (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Profile
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  sx={{ width: 80, height: 80, fontSize: '2rem' }}
                >
                  {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    {profile?.first_name} {profile?.last_name}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {profile?.current_title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : 'Location not specified'} • {profile?.total_experience_years || 0} years experience
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Resume Upload Section */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resume/CV Management
              </Typography>
              
              {/* Upload Section */}
              <Box sx={{ mb: 3, p: 2, border: '2px dashed #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <UploadIcon color="primary" />
                  <Typography variant="h6">Upload New Resume</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload your resume to automatically extract skills and improve your job matches.
                  Supported formats: PDF, DOCX, DOC, TXT
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={uploading}
                  >
                    Choose File
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={handleFileSelect}
                    />
                  </Button>
                  {selectedFile && (
                    <Typography variant="body2">
                      Selected: {selectedFile.name}
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
                    onClick={handleUploadResume}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Resume'}
                  </Button>
                </Box>
              </Box>

              {/* Existing Resumes */}
              {resumes.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Your Resumes ({resumes.length})
                  </Typography>
                  <List>
                    {resumes.map((resume) => (
                      <ListItem key={resume.id} divider>
                        <ListItemIcon>
                          <DescriptionIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={resume.file_name}
                          secondary={`Uploaded: ${resume.uploaded_at} • ${resume.extracted_skills?.length || 0} skills extracted • Status: ${resume.processing_status}`}
                        />
                        <Chip 
                          label={resume.processing_status} 
                          color={resume.processing_status === 'completed' ? 'success' : 'warning'}
                          size="small"
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteResume(resume.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={editing ? editData.first_name : profile?.first_name}
                    onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={editing ? editData.last_name : profile?.last_name}
                    onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={editing ? editData.email : profile?.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={editing ? editData.phone : profile?.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    value={editing ? editData.city : profile?.city}
                    onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    value={editing ? editData.state : profile?.state}
                    onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Country"
                    value={editing ? editData.country : profile?.country}
                    onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Professional Information */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Professional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Position"
                    value={editing ? editData.current_title : profile?.current_title}
                    onChange={(e) => setEditData({ ...editData, current_title: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Company"
                    value={editing ? editData.current_company : profile?.current_company}
                    onChange={(e) => setEditData({ ...editData, current_company: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Years of Experience"
                    type="number"
                    value={editing ? editData.total_experience_years : profile?.total_experience_years}
                    onChange={(e) => setEditData({ ...editData, total_experience_years: parseInt(e.target.value) || 0 })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Education Level"
                    value={editing ? editData.highest_education : profile?.highest_education}
                    onChange={(e) => setEditData({ ...editData, highest_education: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Degree Field"
                    value={editing ? editData.degree_field : profile?.degree_field}
                    onChange={(e) => setEditData({ ...editData, degree_field: e.target.value })}
                    disabled={!editing}
                    margin="normal"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Skills */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  🎯 Skills ({profile?.skills?.length || 0})
                </Typography>
                {editing && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setSkillDialogOpen(true)}
                    size="small"
                  >
                    Add Skill
                  </Button>
                )}
              </Box>
              
              {/* Skills Source Info */}
              {profile?.hasResume && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>{profile.skills?.length || 0} skills</strong> were automatically extracted from your resume: <strong>{profile.resume_file_name}</strong>
                  </Typography>
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {(editing ? editData.skills : profile?.skills)?.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={editing ? () => handleRemoveSkill(skill) : undefined}
                    deleteIcon={editing ? <DeleteIcon /> : undefined}
                    variant="outlined"
                    color="primary"
                    size="medium"
                  />
                ))}
                {(!profile?.skills || profile.skills.length === 0) && !editing && (
                  <Typography variant="body2" color="text.secondary">
                    No skills added yet. Upload a resume or click "Edit Profile" to add your skills.
                  </Typography>
                )}
              </Box>
              
              {/* Skills Summary */}
              {profile?.skills?.length > 0 && (
                <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Skills Summary:</strong> {profile.skills.length} skills • 
                    {profile.skills.slice(0, 5).join(', ')}
                    {profile.skills.length > 5 && ` and ${profile.skills.length - 5} more...`}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Skill Dialog */}
      <Dialog open={skillDialogOpen} onClose={() => setSkillDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Skill</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Skill Name"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSkillDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddSkill} variant="contained">
            Add Skill
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Resume Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={cancelDeleteResume} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Resume</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this resume?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The resume and any extracted skills will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteResume} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteResume} 
            variant="contained" 
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete Resume'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CandidateProfile; 