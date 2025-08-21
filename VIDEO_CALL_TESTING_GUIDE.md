# 🎥 Video Call Testing Guide

## ✅ Backend Status: FULLY WORKING

The WebRTC video call backend is now fully functional with the following features:

### ✅ Working Features
- **Room Creation**: Create interview rooms with unique IDs
- **User Joining**: Multiple users can join the same room
- **Participant Management**: Track active participants
- **Chat Messaging**: Real-time chat functionality
- **User Leaving**: Proper room cleanup when users leave
- **Authentication**: JWT-based authentication required

### 🔧 Technical Implementation
- **WebRTC Service**: Handles room management and signaling
- **Django Channels**: Real-time communication
- **JWT Authentication**: Secure API access
- **Database Models**: Proper data persistence

## 🧪 How to Test Video Call Functionality

### Step 1: Backend Testing (Already Working)

The backend has been tested and verified working:

```bash
# Test WebRTC service directly
python test_webrtc_simple.py

# Test API endpoints
python test_video_call.py
```

### Step 2: Frontend Testing

#### **Option A: Use Existing Room**
1. **Room ID**: `room_2ed51f47-54c1-4f52-ac70-d08ce1d76516_20250820_151935`
2. **Open**: http://localhost:5173
3. **Login as Interviewer**: 
   - Email: `interviewer@yogya.com`
   - Password: `interviewer123`
4. **Navigate**: Go to "AI Assistant" in sidebar
5. **Enter Room ID**: Use the room ID above
6. **Start Video Call**: Click "Start Video Call"

#### **Option B: Create New Room**
1. **Login as Interviewer** (same credentials as above)
2. **Go to Interview Scheduler**
3. **Schedule an Interview** with a candidate
4. **Use the generated room ID** from the interview session

### Step 3: Multi-User Testing

1. **Open Second Browser Tab** (or incognito window)
2. **Login as Candidate**:
   - Email: `akhiltripathi.t1@gmail.com`
   - Password: `candidate123`
3. **Join Same Room**: Use the same room ID
4. **Test Features**:
   - ✅ Video streaming
   - ✅ Audio communication
   - ✅ Chat messaging
   - ✅ Screen sharing
   - ✅ Participant management

## 🔧 API Endpoints

### Room Management
- `POST /api/interview/webrtc/create-room/` - Create new room
- `POST /api/interview/webrtc/join-room/` - Join existing room
- `POST /api/interview/webrtc/leave-room/` - Leave room

### Communication
- `POST /api/interview/webrtc/send-message/` - Send chat message
- `POST /api/interview/webrtc/send-signal/` - WebRTC signaling
- `GET /api/interview/webrtc/participants/{room_id}/` - Get participants
- `GET /api/interview/webrtc/messages/{room_id}/` - Get chat messages

### Recording
- `POST /api/interview/webrtc/start-recording/` - Start recording
- `POST /api/interview/webrtc/stop-recording/` - Stop recording

## 🎯 Expected Features

### Video Call Interface
- **Local Video**: See your own camera feed
- **Remote Video**: See other participants
- **Audio Controls**: Mute/unmute microphone
- **Video Controls**: Enable/disable camera
- **Screen Sharing**: Share your screen
- **Chat Panel**: Real-time messaging

### Room Management
- **Participant List**: See who's in the room
- **Connection Status**: Monitor connection quality
- **Leave Room**: Properly exit the call

## 🐛 Troubleshooting

### Common Issues

1. **"Room not found"**
   - Ensure room ID is correct
   - Check if room was created successfully

2. **"Unauthorized"**
   - Verify JWT token is valid
   - Check user permissions

3. **"Camera/Microphone not working"**
   - Allow browser permissions
   - Check device settings

4. **"Cannot join room"**
   - Verify room exists
   - Check if room is active

### Debug Steps

1. **Check Browser Console** for JavaScript errors
2. **Check Django Logs** for backend errors
3. **Verify Network** connectivity
4. **Test with Different Browsers**

## 📋 Test Checklist

- [ ] **Room Creation**: Can create new interview rooms
- [ ] **User Joining**: Multiple users can join same room
- [ ] **Video Streaming**: Camera feeds display correctly
- [ ] **Audio Communication**: Microphone works
- [ ] **Chat Messaging**: Real-time chat functions
- [ ] **Screen Sharing**: Can share screen
- [ ] **Participant Management**: See who's in room
- [ ] **Room Leaving**: Proper cleanup on exit
- [ ] **Error Handling**: Graceful error recovery
- [ ] **Mobile Compatibility**: Works on mobile devices

## 🚀 Next Steps

1. **Frontend Integration**: Ensure frontend components work with backend
2. **UI/UX Testing**: Test user interface and experience
3. **Performance Testing**: Test with multiple users
4. **Security Testing**: Verify authentication and authorization
5. **Production Deployment**: Deploy to production environment

## 📞 Support

If you encounter issues:
1. Check the Django server logs
2. Verify browser console for errors
3. Test with the provided test scripts
4. Ensure all dependencies are installed
5. Check network connectivity and firewall settings

---

**Status**: ✅ **READY FOR TESTING**
**Last Updated**: August 20, 2025
**Version**: 1.0
