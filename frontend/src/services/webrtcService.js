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
    }

    // Room Management
    async createRoom(interviewId, roomConfig = {}) {
        try {
            const response = await api.post('/api/interview-management/webrtc/create-room/', {
                interview_id: interviewId,
                room_config: roomConfig
            });
            return response.data;
        } catch (error) {
            console.error('Error creating room:', error);
            throw error;
        }
    }

    async joinRoom(roomId, participantType = 'candidate', peerId = null) {
        try {
            const response = await api.post('/api/interview-management/webrtc/join-room/', {
                room_id: roomId,
                participant_type: participantType,
                peer_id: peerId
            });
            
            this.roomId = roomId;
            this.userId = response.data.participant.user;
            
            // Initialize WebRTC
            await this.initializeWebRTC();
            
            return response.data;
        } catch (error) {
            console.error('Error joining room:', error);
            throw error;
        }
    }

    async leaveRoom() {
        try {
            if (this.roomId) {
                await api.post('/api/interview-management/webrtc/leave-room/', {
                    room_id: this.roomId
                });
                
                // Clean up WebRTC connections
                this.cleanup();
            }
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    }

    // WebRTC Signaling
    async sendSignal(signalType, toUserId, signalData) {
        try {
            // Send via WebSocket for real-time communication
            this.sendWebSocketMessage('webrtc_signal', {
                signal_type: signalType,
                to_user_id: toUserId,
                signal_data: signalData
            });
        } catch (error) {
            console.error('Error sending signal:', error);
        }
    }

    // Chat Messages
    async sendMessage(message) {
        try {
            // Send via WebSocket for real-time communication
            this.sendWebSocketMessage('chat_message', {
                message: message
            });
            
            // Return a mock response for compatibility
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
            const response = await api.get(`/api/interview-management/webrtc/messages/${this.roomId}/?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Error getting messages:', error);
            return [];
        }
    }

    // Participants
    async getParticipants() {
        try {
            const response = await api.get(`/api/interview-management/webrtc/participants/${this.roomId}/`);
            return response.data;
        } catch (error) {
            console.error('Error getting participants:', error);
            return [];
        }
    }

    // Recording
    async startRecording(recordingType = 'video') {
        try {
            const response = await api.post('/api/interview-management/webrtc/start-recording/', {
                room_id: this.roomId,
                recording_type: recordingType
            });
            return response.data;
        } catch (error) {
            console.error('Error starting recording:', error);
            throw error;
        }
    }

    async stopRecording() {
        try {
            const response = await api.post('/api/interview-management/webrtc/stop-recording/', {
                room_id: this.roomId
            });
            return response.data;
        } catch (error) {
            console.error('Error stopping recording:', error);
            throw error;
        }
    }

    // WebRTC Core Functions
    async initializeWebRTC() {
        try {
            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Set up event listeners for new participants
            this.setupParticipantListeners();
        } catch (error) {
            console.error('Error initializing WebRTC:', error);
            throw error;
        }
    }

    async createPeerConnection(remoteUserId) {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };

        const peerConnection = new RTCPeerConnection(configuration);
        
        // Add local stream tracks
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                peerConnection.addTrack(track, this.localStream);
            });
        }

        // Handle remote stream
        peerConnection.ontrack = (event) => {
            this.remoteStreams.set(remoteUserId, event.streams[0]);
            if (this.onParticipantUpdateCallback) {
                this.onParticipantUpdateCallback(remoteUserId, event.streams[0]);
            }
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignal('ice_candidate', remoteUserId, event.candidate);
            }
        };

        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
            console.log(`Connection state with ${remoteUserId}:`, peerConnection.connectionState);
        };

        this.peerConnections.set(remoteUserId, peerConnection);
        return peerConnection;
    }

    async handleOffer(fromUserId, offer) {
        const peerConnection = await this.createPeerConnection(fromUserId);
        
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        this.sendSignal('answer', fromUserId, answer);
    }

    async handleAnswer(fromUserId, answer) {
        const peerConnection = this.peerConnections.get(fromUserId);
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    async handleIceCandidate(fromUserId, candidate) {
        const peerConnection = this.peerConnections.get(fromUserId);
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    async createOffer(remoteUserId) {
        const peerConnection = await this.createPeerConnection(remoteUserId);
        
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        this.sendSignal('offer', remoteUserId, offer);
    }

    // Screen Sharing
    async startScreenSharing() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false
            });

            // Replace video track in all peer connections
            const videoTrack = screenStream.getVideoTracks()[0];
            
            this.peerConnections.forEach((peerConnection) => {
                const sender = peerConnection.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            });

            return screenStream;
        } catch (error) {
            console.error('Error starting screen sharing:', error);
            throw error;
        }
    }

    async stopScreenSharing() {
        try {
            // Restore camera video track
            const cameraStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

            const videoTrack = cameraStream.getVideoTracks()[0];
            
            this.peerConnections.forEach((peerConnection) => {
                const sender = peerConnection.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            });

            return cameraStream;
        } catch (error) {
            console.error('Error stopping screen sharing:', error);
            throw error;
        }
    }

    // Event Handlers
    setupParticipantListeners() {
        // Connect to WebSocket for real-time updates
        this.connectWebSocket();
    }

    connectWebSocket() {
        const wsUrl = `ws://localhost:8001/ws/interview/${this.roomId}/`;
        this.websocket = new WebSocket(wsUrl);
        
        this.websocket.onopen = () => {
            console.log('WebSocket connected');
        };
        
        this.websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };
        
        this.websocket.onclose = () => {
            console.log('WebSocket disconnected');
        };
        
        this.websocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleWebSocketMessage(data) {
        const { event_type, data: messageData } = data;
        
        switch (event_type) {
            case 'user_joined':
                this.handleUserJoined(messageData);
                break;
            case 'user_left':
                this.handleUserLeft(messageData);
                break;
            case 'webrtc_signal':
                this.handleWebRTCSignal(messageData);
                break;
            case 'chat_message':
                if (this.onMessageCallback) {
                    this.onMessageCallback(messageData);
                }
                break;
            default:
                console.log('Unknown message type:', event_type);
        }
    }

    handleUserJoined(data) {
        if (data.user_id !== this.userId) {
            this.createOffer(data.user_id);
        }
    }

    handleUserLeft(data) {
        const peerConnection = this.peerConnections.get(data.user_id);
        if (peerConnection) {
            peerConnection.close();
            this.peerConnections.delete(data.user_id);
            this.remoteStreams.delete(data.user_id);
        }
    }

    handleWebRTCSignal(data) {
        const { signal_type, from_user_id, signal_data } = data;
        
        switch (signal_type) {
            case 'offer':
                this.handleOffer(from_user_id, signal_data);
                break;
            case 'answer':
                this.handleAnswer(from_user_id, signal_data);
                break;
            case 'ice_candidate':
                this.handleIceCandidate(from_user_id, signal_data);
                break;
        }
    }

    sendWebSocketMessage(eventType, data) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                event_type: eventType,
                data: data
            }));
        }
    }

    onMessage(callback) {
        this.onMessageCallback = callback;
    }

    onParticipantUpdate(callback) {
        this.onParticipantUpdateCallback = callback;
    }

    // Cleanup
    cleanup() {
        // Close WebSocket connection
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }

        // Close all peer connections
        this.peerConnections.forEach(peerConnection => {
            peerConnection.close();
        });
        this.peerConnections.clear();

        // Stop local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        // Clear remote streams
        this.remoteStreams.clear();

        // Reset state
        this.roomId = null;
        this.userId = null;
    }

    // Getters
    getLocalStream() {
        return this.localStream;
    }

    getRemoteStream(userId) {
        return this.remoteStreams.get(userId);
    }

    getAllRemoteStreams() {
        return Array.from(this.remoteStreams.values());
    }
}

export default new WebRTCService();
