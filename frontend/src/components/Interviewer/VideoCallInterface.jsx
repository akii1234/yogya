import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  CallEnd,
  ScreenShare,
  ScreenShareOutlined,
  Chat,
  ChatOutlined,
  Settings,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';
import webrtcService from '../../services/webrtcService';

const VideoCallInterface = ({ roomId, onLeave, onChatToggle }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());
  const screenShareStream = useRef(null);

  useEffect(() => {
    initializeCall();
    return () => cleanup();
  }, [roomId]);

  const initializeCall = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎥 Initializing video call for room:', roomId);
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      
      // Join WebRTC room
      await webrtcService.joinRoom(roomId);
      
      // Set up event listeners
      webrtcService.onParticipantUpdate((participants) => {
        setParticipants(participants);
      });
      
      webrtcService.onRemoteStream((userId, stream) => {
        setRemoteStreams(prev => new Map(prev.set(userId, stream)));
      });
      
      webrtcService.onParticipantLeft((userId) => {
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
      });
      
      setIsConnected(true);
      console.log('✅ Video call initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing video call:', error);
      setError('Failed to initialize video call. Please check your camera and microphone permissions.');
    } finally {
      setLoading(false);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach(track => track.stop());
    }
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

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false
        });
        
        screenShareStream.current = screenStream;
        
        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = webrtcService.getVideoSender();
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
        
        setIsScreenSharing(true);
        
        // Handle screen share stop
        videoTrack.onended = () => {
          stopScreenShare();
        };
      } else {
        await stopScreenShare();
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const stopScreenShare = async () => {
    if (screenShareStream.current) {
      screenShareStream.current.getTracks().forEach(track => track.stop());
      screenShareStream.current = null;
    }
    
    // Restore camera video
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      const sender = webrtcService.getVideoSender();
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
    }
    
    setIsScreenSharing(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleLeave = async () => {
    try {
      await webrtcService.leaveRoom();
      cleanup();
      if (onLeave) onLeave();
    } catch (error) {
      console.error('Error leaving call:', error);
    }
  };

  // Set video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    remoteStreams.forEach((stream, userId) => {
      const videoElement = remoteVideoRefs.current.get(userId);
      if (videoElement && stream) {
        videoElement.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.default'
    }}>
      {/* Video Area */}
      <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={2} sx={{ flex: 1 }}>
          {/* Local Video */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
              <Box sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                display: 'flex',
                gap: 1
              }}>
                <Chip 
                  label="You" 
                  size="small" 
                  color="primary" 
                  variant="filled"
                />
                {isMuted && <Chip icon={<MicOff />} label="Muted" size="small" color="error" />}
                {!isVideoEnabled && <Chip icon={<VideocamOff />} label="Video Off" size="small" color="error" />}
                {isScreenSharing && <Chip label="Screen Sharing" size="small" color="secondary" />}
              </Box>
            </Card>
          </Grid>

          {/* Remote Videos */}
          {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
            <Grid item xs={12} md={6} key={userId}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <video
                  ref={(el) => {
                    if (el) remoteVideoRefs.current.set(userId, el);
                  }}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
                <Box sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16
                }}>
                  <Chip 
                    label={`Participant ${userId}`} 
                    size="small" 
                    color="secondary" 
                    variant="filled"
                  />
                </Box>
              </Card>
            </Grid>
          ))}

          {/* No remote participants */}
          {remoteStreams.size === 0 && (
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'grey.100'
              }}>
                <Typography variant="h6" color="text.secondary">
                  Waiting for participants...
                </Typography>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Controls */}
      <Paper sx={{ p: 2, borderRadius: 0 }}>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <IconButton
            onClick={toggleMute}
            color={isMuted ? 'error' : 'primary'}
            sx={{ 
              bgcolor: isMuted ? 'error.main' : 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: isMuted ? 'error.dark' : 'primary.dark' }
            }}
          >
            {isMuted ? <MicOff /> : <Mic />}
          </IconButton>

          <IconButton
            onClick={toggleVideo}
            color={!isVideoEnabled ? 'error' : 'primary'}
            sx={{ 
              bgcolor: !isVideoEnabled ? 'error.main' : 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: !isVideoEnabled ? 'error.dark' : 'primary.dark' }
            }}
          >
            {!isVideoEnabled ? <VideocamOff /> : <Videocam />}
          </IconButton>

          <IconButton
            onClick={toggleScreenShare}
            color={isScreenSharing ? 'secondary' : 'primary'}
            sx={{ 
              bgcolor: isScreenSharing ? 'secondary.main' : 'grey.300',
              color: isScreenSharing ? 'white' : 'grey.700',
              '&:hover': { bgcolor: isScreenSharing ? 'secondary.dark' : 'grey.400' }
            }}
          >
            {isScreenSharing ? <ScreenShareOutlined /> : <ScreenShare />}
          </IconButton>

          <IconButton
            onClick={toggleFullscreen}
            color="primary"
            sx={{ bgcolor: 'grey.300', color: 'grey.700' }}
          >
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>

          <IconButton
            onClick={onChatToggle}
            color="primary"
            sx={{ bgcolor: 'grey.300', color: 'grey.700' }}
          >
            <ChatOutlined />
          </IconButton>

          <Button
            variant="contained"
            color="error"
            startIcon={<CallEnd />}
            onClick={handleLeave}
            sx={{ 
              bgcolor: 'error.main',
              '&:hover': { bgcolor: 'error.dark' }
            }}
          >
            Leave Call
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default VideoCallInterface;
