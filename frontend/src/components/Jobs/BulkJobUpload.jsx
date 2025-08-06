import React, { useState, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Description as FileIcon
} from '@mui/icons-material';
import { uploadBulkJobs, downloadTemplate } from '../../services/jobService';

const BulkJobUpload = ({ open, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a valid CSV or Excel file');
        return;
      }

      setFile(selectedFile);
      setError('');
      setResults(null);
      
      // Preview the file
      previewFile(selectedFile);
    }
  };

  const previewFile = (selectedFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const preview = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        }).filter(row => Object.values(row).some(val => val !== ''));
        
        setPreviewData(preview);
      } catch (err) {
        setError('Error reading file. Please check the format.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadBulkJobs(formData, (progress) => {
        setUploadProgress(progress);
      });

      setResults(response);
      setUploading(false);
      
      if (response.success_count > 0) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate();
    } catch (err) {
      setError('Failed to download template');
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setUploading(false);
    setUploadProgress(0);
    setResults(null);
    setError('');
    onClose();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      previewFile(droppedFile);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Bulk Job Creation</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Template Download */}
          <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f5f5f5' }}>
            <Typography variant="subtitle1" gutterBottom>
              📋 Download Template
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Download our CSV template to ensure your data is in the correct format.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              Download CSV Template
            </Button>
          </Paper>

          {/* File Upload Area */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              border: '2px dashed #ccc',
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: '#fafafa'
              }
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {!file ? (
              <Box>
                <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Upload CSV or Excel File
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Drag and drop your file here, or click to browse
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </Typography>
              </Box>
            ) : (
              <Box>
                <FileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setPreviewData([]);
                  }}
                >
                  Remove File
                </Button>
              </Box>
            )}
          </Paper>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Data Preview */}
          {previewData.length > 0 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📊 Data Preview (First 5 rows)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(previewData[0] || {}).map((header) => (
                        <TableCell key={header} sx={{ fontWeight: 'bold' }}>
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewData.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <TableCell key={cellIndex}>
                            {typeof value === 'string' && value.length > 50 
                              ? `${value.substring(0, 50)}...` 
                              : value}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* Upload Progress */}
          {uploading && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📤 Uploading Jobs...
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {uploadProgress}% Complete
              </Typography>
            </Paper>
          )}

          {/* Results */}
          {results && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                📈 Upload Results
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip
                  icon={<SuccessIcon />}
                  label={`${results.success_count} Successful`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  icon={<ErrorIcon />}
                  label={`${results.failed_count} Failed`}
                  color="error"
                  variant="outlined"
                />
              </Box>

              {results.failed_jobs && results.failed_jobs.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Failed Jobs:
                  </Typography>
                  {results.failed_jobs.map((job, index) => (
                    <Alert key={index} severity="error" sx={{ mb: 1 }}>
                      Row {job.row}: {job.error}
                    </Alert>
                  ))}
                </Box>
              )}
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || uploading}
          startIcon={<UploadIcon />}
        >
          {uploading ? 'Uploading...' : 'Upload Jobs'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkJobUpload; 