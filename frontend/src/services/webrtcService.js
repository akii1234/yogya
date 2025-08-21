import api from './api';

class WebRTCService {
    constructor() {
        this.peerConnections = new Map();
        this.localStream = null;
        this.remoteStreams = new Map();
        this.roomId = null;
        this.userId = null;
        this.onMessageCallback = null;
        this.onParticipantUpdateCallback = null;
        this.onRemoteStreamCallback = null;
        this.onParticipantLeftCallback = null;
        this.webSocket = null;
        this.isConnected = false;
        
        // WebRTC configuration
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
    }

    // Event handlers
    onParticipantUpdate(callback) {
        this.onParticipantUpdateCallback = callback;
    }

    onRemoteStream(callback) {
        this.onRemoteStreamCallback = callback;
    }

    onParticipantLeft(callback) {
        this.onParticipantLeftCallback = callback;
    }

    onMessage(callback) {
        this.onMessageCallback = callback;
    }

    // WebSocket connection
    async connectWebSocket() {
        try {
            const token = localStorage.getItem('authToken');
            const wsUrl = `ws://localhost:8001/ws/interview/${this.roomId}/?token=${token}`;
            
            this.webSocket = new WebSocket(wsUrl);
            
            this.webSocket.onopen = () => {
                console.log('🔌 WebSocket connected');
                this.isConnected = true;
            };
            
            this.webSocket.onmessage = (event) => {
                this.handleWebSocketMessage(JSON.parse(event.data));
            };
            
            this.webSocket.onclose = () => {
                console.log('🔌 WebSocket disconnected');
                this.isConnected = false;
            };
            
            this.webSocket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        } catch (error) {
            console.error('Error connecting WebSocket:', error);
        }
    }

    handleWebSocketMessage(data) {
        console.log('📨 WebSocket message received:', data);
        
        switch (data.type) {
            case 'connection_established':
                console.log('✅ WebSocket connection established');
                break;
            case 'user_joined':
                console.log('👤 User joined message received:', data);
                this.handleParticipantJoined(data);
                break;
            case 'user_left':
                console.log('👤 User left message received:', data);
                this.handleParticipantLeft(data);
                break;
            case 'webrtc_signal':
                this.handleWebRTCSignal(data);
                break;
            case 'chat_message':
                if (this.onMessageCallback) {
                    this.onMessageCallback(data);
                }
                break;
            case 'participants_updated':
                console.log('👥 Participants updated message received:', data);
                console.log('👥 Participants data:', data.participants);
                console.log('👥 Callback available:', !!this.onParticipantUpdateCallback);
                if (this.onParticipantUpdateCallback) {
                    this.onParticipantUpdateCallback(data.participants);
                } else {
                    console.warn('⚠️ No participant update callback set');
                }
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    sendWebSocketMessage(type, payload) {
        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
            const message = { type, ...payload };
            console.log('📤 Sending WebSocket message:', message);
            this.webSocket.send(JSON.stringify(message));
        } else {
            console.warn('⚠️ WebSocket not ready, message not sent:', type);
        }
    }

    // Room Management
    async createRoom(interviewId, roomConfig = {}) {
        try {
            const response = await api.post('/interview/webrtc/create-room/', {
                interview_id: interviewId,
                room_config: roomConfig
            });
            return response.data;
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    }

    async joinRoom(roomId, participantType = 'candidate') {
        try {
            console.log('🚪 Joining room:', roomId);
            
            const response = await api.post('/interview/webrtc/join-room/', {
                room_id: roomId,
                participant_type: participantType
            });
            
            this.roomId = roomId;
            this.userId = response.data.participant.user;
            
            // Connect WebSocket
            await this.connectWebSocket();
            
                            // Wait for WebSocket connection
                await new Promise((resolve) => {
                    const checkConnection = () => {
                        if (this.webSocket && this.webSocket.readyState === WebSocket.OPEN) {
                            resolve();
                        } else {
                            setTimeout(checkConnection, 100);
                        }
                    };
                    checkConnection();
                });
                
                // Send join room message via WebSocket
                this.sendWebSocketMessage('join_room', {
                    participant_type: participantType
                });
            
            // Initialize WebRTC
            await this.initializeWebRTC();
            
            console.log('✅ Successfully joined room');
            return response.data;
        } catch (error) {
            console.error('Error joining room:', error);
            throw error;
        }
    }

    async leaveRoom() {
        try {
            if (this.roomId) {
                await api.post('/interview/webrtc/leave-room/', {
                    room_id: this.roomId
                });
                
                // Clean up WebRTC connections
                this.cleanup();
                
                // Close WebSocket
                if (this.webSocket) {
                    this.webSocket.close();
                }
            }
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    }

    // Set local stream
    setLocalStream(stream) {
        this.localStream = stream;
        console.log('📹 Local stream set in webrtcService');
    }

    // WebRTC Initialization
    async initializeWebRTC() {
        try {
            // Note: Local stream should be set by the calling component
            // This method is now just for initialization setup
            console.log('📹 WebRTC initialized');
        } catch (error) {
            console.error('Error initializing WebRTC:', error);
            throw error;
        }
    }

    // WebRTC Signaling
    async handleWebRTCSignal(signalData) {
        const { from_user_id, signal_type, signal_data } = signalData;
        
        try {
            let peerConnection = this.peerConnections.get(from_user_id);
            
            if (!peerConnection) {
                peerConnection = this.createPeerConnection(from_user_id);
            }
            
            switch (signal_type) {
                case 'offer':
                    // Only handle offer if we don't already have a remote description
                    if (peerConnection.remoteDescription === null) {
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal_data));
                        const answer = await peerConnection.createAnswer();
                        await peerConnection.setLocalDescription(answer);
                        
                        this.sendWebSocketMessage('webrtc_signal', {
                            target_user_id: from_user_id,
                            signal_type: 'answer',
                            signal_data: answer
                        });
                    }
                    break;
                    
                case 'answer':
                    // Only handle answer if we have a local description and no remote description
                    if (peerConnection.localDescription && peerConnection.remoteDescription === null) {
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal_data));
                    }
                    break;
                    
                case 'ice_candidate':
                    // Only add ICE candidate if we have a remote description
                    if (peerConnection.remoteDescription) {
                        await peerConnection.addIceCandidate(new RTCIceCandidate(signal_data));
                    }
                    break;
            }
        } catch (error) {
            console.error('Error handling WebRTC signal:', error);
        }
    }

    createPeerConnection(remoteUserId) {
        console.log('🔗 Creating peer connection with:', remoteUserId, 'Current user:', this.userId);
        
        // Don't create peer connection with ourselves
        if (remoteUserId === this.userId) {
            console.log('🔗 Skipping peer connection with self');
            return null;
        }
        
        const peerConnection = new RTCPeerConnection(this.rtcConfig);
        
        // Add local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, this.localStream);
            });
        }
        
        // Handle remote stream
        peerConnection.ontrack = (event) => {
            console.log('📹 Remote stream received from:', remoteUserId);
            console.log('📹 Stream details:', event.streams[0]);
            this.remoteStreams.set(remoteUserId, event.streams[0]);
            
            if (this.onRemoteStreamCallback) {
                console.log('📹 Calling remote stream callback for:', remoteUserId);
                this.onRemoteStreamCallback(remoteUserId, event.streams[0]);
            } else {
                console.warn('⚠️ No remote stream callback set');
            }
        };
        
        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendWebSocketMessage('webrtc_signal', {
                    target_user_id: remoteUserId,
                    signal_type: 'ice_candidate',
                    signal_data: event.candidate
                });
            }
        };
        
        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log('Connection state:', peerConnection.connectionState);
        };
        
        this.peerConnections.set(remoteUserId, peerConnection);
        return peerConnection;
    }

    async handleParticipantJoined(participant) {
        console.log('👤 Participant joined:', participant.user_id);
        console.log('👤 Current user ID:', this.userId);
        
        // Don't create peer connection with ourselves
        if (participant.user_id === this.userId) {
            console.log('👤 Skipping peer connection with self');
            return;
        }
        
        // Create offer for new participant
        const peerConnection = this.createPeerConnection(participant.user_id);
        if (!peerConnection) {
            console.log('👤 No peer connection created (self-connection prevented)');
            return;
        }
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        this.sendWebSocketMessage('webrtc_signal', {
            target_user_id: participant.user_id,
            signal_type: 'offer',
            signal_data: offer
        });
    }

    handleParticipantLeft(participant) {
        console.log('👤 Participant left:', participant.user_id);
        
        // Clean up peer connection
        const peerConnection = this.peerConnections.get(participant.user_id);
        if (peerConnection) {
            peerConnection.close();
            this.peerConnections.delete(participant.user_id);
        }
        
        // Remove remote stream
        this.remoteStreams.delete(participant.user_id);
        
        if (this.onParticipantLeftCallback) {
            this.onParticipantLeftCallback(participant.user_id);
        }
    }

    // Utility methods
    getLocalStream() {
        return this.localStream;
    }

    getVideoSender() {
        // Get the first video sender from any peer connection
        for (const [userId, pc] of this.peerConnections) {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) return sender;
        }
        return null;
    }

    // Chat Messages
    async sendMessage(message) {
        try {
            this.sendWebSocketMessage('chat_message', {
                message: message,
                room_id: this.roomId
            });
            
            return {
                id: Date.now(),
                message: message,
                user_id: this.userId,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async getMessages(limit = 50) {
        try {
            const response = await api.get(`/interview/webrtc/messages/${this.roomId}/?limit=${limit}`);
            return response.data.messages || [];
        } catch (error) {
            console.error('Error fetching messages:', error);
            return [];
        }
    }

    // Cleanup
    cleanup() {
        // Close all peer connections
        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();
        
        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        // Clear remote streams
        this.remoteStreams.clear();
        
        // Close WebSocket
        if (this.webSocket) {
            this.webSocket.close();
            this.webSocket = null;
        }
        
        this.isConnected = false;
        this.roomId = null;
        this.userId = null;
    }
}

export default new WebRTCService();
