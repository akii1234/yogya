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
import { useAuth } from '../../contexts/AuthContext';

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
  const [participantNames, setParticipantNames] = useState(new Map());
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { user } = useAuth();
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
      console.log('👤 Current user:', user);
      console.log('👤 Current user ID:', user?.id);
      console.log('👤 Current user email:', user?.email);
      
      // Get user media
      console.log('📹 Requesting camera and microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      console.log('✅ Media stream obtained:', stream);
      console.log('📹 Video tracks:', stream.getVideoTracks());
      console.log('🎤 Audio tracks:', stream.getAudioTracks());
      console.log('📹 Stream active:', stream.active);
      console.log('📹 Stream id:', stream.id);
      
      setLocalStream(stream);
      
      // Set the stream in webrtcService
      webrtcService.setLocalStream(stream);
      
      // Set up event listeners BEFORE joining room
      console.log('🎯 Setting up event listeners');
      
      webrtcService.onRemoteStream((userId, stream) => {
        console.log('📺 Remote stream received for user:', userId);
        console.log('📺 Stream object:', stream);
        console.log('📺 Current remote streams before update:', remoteStreams.size);
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, stream);
          console.log('📺 Updated remote streams map:', newMap.size, 'streams');
          console.log('📺 New map keys:', Array.from(newMap.keys()));
          return newMap;
        });
      });
      
      webrtcService.onParticipantLeft((userId) => {
        console.log('👋 Participant left:', userId);
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
      });
      
      webrtcService.onParticipantUpdate((participants) => {
        console.log('👥 Participants updated:', participants);
        console.log('👥 Number of participants:', participants.length);
        console.log('👥 Current user ID:', user?.id);
        
        setParticipants(participants);
        
        // Create a map of user IDs to names
        const namesMap = new Map();
        participants.forEach(participant => {
          console.log('👤 Processing participant:', participant);
          // Skip the current user - they should show as "You"
          if (participant.user_id === user?.id) {
            console.log('👤 Skipping current user:', participant.user_id);
            return;
          }
          const fullName = `${participant.user_name || participant.user_email.split('@')[0]}`;
          console.log('👤 Adding participant to names map:', participant.user_id, '->', fullName);
          namesMap.set(participant.user_id, fullName);
        });
        console.log('👥 Final names map:', namesMap);
        setParticipantNames(namesMap);
      });
      
      // Join WebRTC room
      console.log('🔗 Joining WebRTC room...');
      await webrtcService.joinRoom(roomId);
      
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

  // Set video streams when both stream and video element are available
  useEffect(() => {
    const setVideoStream = () => {
      console.log('🎥 Checking video setup - Stream:', !!localStream, 'Ref:', !!localVideoRef.current);
      console.log('🎥 Stream details:', localStream ? {
        active: localStream.active,
        id: localStream.id,
        tracks: localStream.getTracks().length,
        videoTracks: localStream.getVideoTracks().length,
        audioTracks: localStream.getAudioTracks().length
      } : 'No stream');
      console.log('🎥 Video ref details:', localVideoRef.current ? {
        readyState: localVideoRef.current.readyState,
        videoWidth: localVideoRef.current.videoWidth,
        videoHeight: localVideoRef.current.videoHeight,
        srcObject: !!localVideoRef.current.srcObject,
        paused: localVideoRef.current.paused,
        currentTime: localVideoRef.current.currentTime
      } : 'No ref');
      
      if (localVideoRef.current && localStream) {
        console.log('✅ Setting srcObject to local video element');
        
        // Check if srcObject is already set
        if (localVideoRef.current.srcObject === localStream) {
          console.log('✅ srcObject already set correctly');
        } else {
          console.log('🔄 Setting new srcObject');
          localVideoRef.current.srcObject = localStream;
        }
        
        // Add event listeners to debug video loading
        localVideoRef.current.onloadedmetadata = () => {
          console.log('✅ Video metadata loaded');
          console.log('📏 Video dimensions:', localVideoRef.current.videoWidth, 'x', localVideoRef.current.videoHeight);
        };
        
        localVideoRef.current.oncanplay = () => {
          console.log('✅ Video can start playing');
        };
        
        localVideoRef.current.onplay = () => {
          console.log('✅ Video started playing');
        };
        
        localVideoRef.current.onerror = (e) => {
          console.error('❌ Video error:', e);
        };
        
        // Force play attempt
        localVideoRef.current.play().then(() => {
          console.log('✅ Video play started successfully');
        }).catch((error) => {
          console.error('❌ Video play failed:', error);
        });
      } else {
        console.log('⏳ Waiting for both stream and video element...');
        if (!localStream) {
          console.log('❌ No local stream available');
        }
        if (!localVideoRef.current) {
          console.log('❌ No local video ref available');
        }
      }
    };

    // Try immediately
    setVideoStream();
    
    // Also try after a short delay to handle timing issues
    const timer = setTimeout(setVideoStream, 100);
    
    // Try again after a longer delay
    const timer2 = setTimeout(setVideoStream, 500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [localStream]);

  useEffect(() => {
    console.log('🔄 Remote streams updated:', remoteStreams.size, 'streams');
    console.log('🔄 Remote streams keys:', Array.from(remoteStreams.keys()));
    
    // Set up streams for existing video elements
    remoteStreams.forEach((stream, userId) => {
      console.log('📺 Setting up remote video for user:', userId);
      console.log('📺 Stream active:', stream.active);
      console.log('📺 Stream tracks:', stream.getTracks().length);
      const videoElement = remoteVideoRefs.current.get(userId);
      if (videoElement && stream) {
        console.log('✅ Setting srcObject for remote video:', userId);
        videoElement.srcObject = stream;
        
        // Add event listeners to debug remote video loading
        videoElement.onloadedmetadata = () => {
          console.log('✅ Remote video metadata loaded for:', userId);
        };
        
        videoElement.oncanplay = () => {
          console.log('✅ Remote video can start playing for:', userId);
        };
        
        videoElement.onerror = (e) => {
          console.error('❌ Remote video error for:', userId, e);
        };
      } else {
        console.log('⚠️ Missing video element or stream for user:', userId, 'Element:', !!videoElement, 'Stream:', !!stream);
      }
    });
  }, [remoteStreams]);

  // Additional effect to handle video elements that are created after streams are received
  useEffect(() => {
    const checkAndSetupVideos = () => {
      remoteStreams.forEach((stream, userId) => {
        const videoElement = remoteVideoRefs.current.get(userId);
        if (videoElement && stream && !videoElement.srcObject) {
          console.log('🎯 Setting up delayed remote video for user:', userId);
          videoElement.srcObject = stream;
          
          // Add event listeners to debug remote video loading
          videoElement.onloadedmetadata = () => {
            console.log('✅ Delayed remote video metadata loaded for:', userId);
          };
          
          videoElement.oncanplay = () => {
            console.log('✅ Delayed remote video can start playing for:', userId);
          };
          
          videoElement.onerror = (e) => {
            console.error('❌ Delayed remote video error for:', userId, e);
          };
        }
      });
    };

    // Check immediately
    checkAndSetupVideos();
    
    // Also check after a short delay to catch elements created later
    const timer = setTimeout(checkAndSetupVideos, 100);
    
    return () => clearTimeout(timer);
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
            <Card sx={{ 
              height: '100%', 
              position: 'relative',
              boxShadow: 3,
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <video
                ref={(el) => {
                  if (el) {
                    console.log('🎥 Local video element created');
                    localVideoRef.current = el;
                  }
                }}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onLoadStart={() => console.log('🎥 Local video load started')}
                onLoadedData={() => console.log('🎥 Local video data loaded')}
                onCanPlay={() => console.log('🎥 Local video can play')}
                onPlay={() => console.log('🎥 Local video started playing')}
                onPause={() => console.log('🎥 Local video paused')}
                onError={(e) => console.error('🎥 Local video error:', e)}
                onStalled={() => console.log('🎥 Local video stalled')}
                onSuspend={() => console.log('🎥 Local video suspended')}
                onAbort={() => console.log('🎥 Local video aborted')}
              />
              <Box sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap'
              }}>
                <Chip 
                  label={`You (${user?.first_name || user?.email?.split('@')[0] || 'User'})`} 
                  size="small" 
                  color="primary" 
                  variant="filled"
                  sx={{ fontWeight: 'bold' }}
                />
                {isMuted && <Chip icon={<MicOff />} label="Muted" size="small" color="error" />}
                {!isVideoEnabled && <Chip icon={<VideocamOff />} label="Video Off" size="small" color="error" />}
                {isScreenSharing && <Chip label="Screen Sharing" size="small" color="secondary" />}
              </Box>
            </Card>
          </Grid>

          {/* Remote Videos */}
          {(() => {
            console.log('🎥 Rendering remote videos section');
            console.log('🎥 Remote streams count:', remoteStreams.size);
            console.log('🎥 Remote streams keys:', Array.from(remoteStreams.keys()));
            console.log('🎥 Participants count:', participants.length);
            console.log('🎥 Participants:', participants);
            console.log('🎥 Participant names:', participantNames);
            return Array.from(remoteStreams.entries()).map(([userId, stream]) => {
              console.log('🎥 Rendering remote video for user:', userId, 'Current user ID:', user?.id, 'Match:', userId === user?.id);
              // Only show remote participants (not the current user)
              if (userId === user?.id) {
                console.log('🎥 Skipping remote video for current user:', userId);
                return null;
              }
              console.log('🎥 Creating remote video element for user:', userId);
              return (
              <Grid item xs={12} md={6} key={userId}>
                <Card sx={{ 
                  height: '100%', 
                  position: 'relative',
                  boxShadow: 3,
                  borderRadius: 2,
                  overflow: 'hidden'
                }}>
                  <video
                    ref={(el) => {
                      if (el) {
                        console.log('🎥 Video element created for user:', userId);
                        remoteVideoRefs.current.set(userId, el);
                        
                        // Check if we already have a stream for this user
                        const stream = remoteStreams.get(userId);
                        if (stream) {
                          console.log('🎯 Found existing stream for user:', userId, 'setting srcObject immediately');
                          el.srcObject = stream;
                          
                          // Add event listeners
                          el.onloadedmetadata = () => {
                            console.log('✅ Immediate remote video metadata loaded for:', userId);
                          };
                          
                          el.oncanplay = () => {
                            console.log('✅ Immediate remote video can start playing for:', userId);
                          };
                          
                          el.onerror = (e) => {
                            console.error('❌ Immediate remote video error for:', userId, e);
                          };
                        }
                      }
                    }}
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16
                  }}>
                    <Chip 
                      label={participantNames.get(userId) || `Participant ${userId.slice(0, 8)}...`} 
                      size="small" 
                      color="secondary" 
                      variant="filled"
                      sx={{ fontWeight: 'bold' }}
                      title={`Full ID: ${userId}`}
                    />
                  </Box>
                </Card>
              </Grid>
            );
          });
          })()}

          {/* No remote participants */}
          {remoteStreams.size === 0 && (
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'grey.50',
                border: '2px dashed',
                borderColor: 'grey.300',
                borderRadius: 2
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                    Waiting for participants...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The other participant will appear here once they join
                  </Typography>
                </Box>
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
