import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  CallEnd,
  ScreenShare
} from '@mui/icons-material';
import webrtcService from '../../services/webrtcService';

const VideoCallInterface = ({ roomId, onLeave }) => {
  const [localStream, setLocalStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const localVideoRef = useRef(null);

  useEffect(() => {
    initializeCall();
    return () => cleanup();
  }, [roomId]);

  const initializeCall = async () => {
    try {
      setLoading(true);
      await webrtcService.joinRoom(roomId);
      const stream = webrtcService.getLocalStream();
      setLocalStream(stream);
      setIsConnected(true);
    } catch (error) {
      setError('Failed to join call');
    } finally {
      setLoading(false);
    }
  };

  const cleanup = () => {
    webrtcService.cleanup();
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const handleLeave = async () => {
    await webrtcService.leaveRoom();
    if (onLeave) onLeave();
  };

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ flex: 1, p: 2, mb: 2 }}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="center" gap={2}>
          <IconButton onClick={toggleMute} color={isMuted ? 'error' : 'default'}>
            {isMuted ? <MicOff /> : <Mic />}
          </IconButton>
          <IconButton onClick={toggleVideo} color={!isVideoEnabled ? 'error' : 'default'}>
            {!isVideoEnabled ? <VideocamOff /> : <Videocam />}
          </IconButton>
          <IconButton onClick={handleLeave} color="error">
            <CallEnd />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default VideoCallInterface;
