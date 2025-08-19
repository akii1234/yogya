import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import VideoCallInterface from './VideoCallInterface';

const VideoCallTest = () => {
  const [roomId, setRoomId] = useState('');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleStartCall = () => {
    if (roomId.trim()) {
      setShowVideoCall(true);
      setOpenDialog(false);
    }
  };

  const handleLeaveCall = () => {
    setShowVideoCall(false);
  };

  if (showVideoCall) {
    return (
      <VideoCallInterface 
        roomId={roomId} 
        onLeave={handleLeaveCall}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Video Call Test
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Test the WebRTC video call functionality
        </Typography>

        <Button 
          variant="contained" 
          fullWidth 
          onClick={() => setOpenDialog(true)}
          sx={{ mb: 2 }}
        >
          Start Video Call
        </Button>

        <Typography variant="caption" color="text.secondary">
          Enter a room ID to start testing the video call interface
        </Typography>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Enter Room ID</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room ID"
            fullWidth
            variant="outlined"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID (e.g., room_123)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleStartCall} variant="contained">
            Join Call
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VideoCallTest;
