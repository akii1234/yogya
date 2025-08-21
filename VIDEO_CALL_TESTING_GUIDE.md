# Video Call Testing Guide

## Overview
The Yogya platform now supports real-time video calls between interviewers and candidates using WebRTC technology. This guide provides step-by-step instructions for testing the video call functionality.

## Prerequisites
- Django backend server running on port 8001
- React frontend running on port 5173
- Two different browsers or browser instances (for testing both sides)
- Camera and microphone permissions enabled

## Quick Test Setup

### 1. Create Test Room
Run the test room creation script:
```bash
cd backend
python create_test_room.py
```
This will output a room ID like: `test_room_a1b2c3d4`

### 2. Start the Servers
```bash
# Terminal 1: Backend (with WebSocket support)
cd backend
source venv/bin/activate  # or your virtual environment
daphne -b 0.0.0.0 -p 8001 yogya_project.asgi:application

# Terminal 2: Frontend
cd frontend
npm run dev
```

## Testing Steps

### Step 1: Login as Interviewer
1. Open **Chrome** browser
2. Navigate to `http://localhost:5173`
3. Login with:
   - **Email**: `interviewer@yogya.com`
   - **Password**: `interviewer123`
4. Navigate to **AI Assistant** in the sidebar
5. Click **"Start Video Call"**
6. Enter the room ID from step 1 (e.g., `test_room_a1b2c3d4`)
7. Click **"Join Call"**

### Step 2: Login as Candidate
1. Open **Safari** browser (or different browser/incognito)
2. Navigate to `http://localhost:5173`
3. Login with:
   - **Email**: `akhiltripathi.t1@gmail.com`
   - **Password**: `candidate123`
4. Navigate to **Video Call Test** in the sidebar
5. Click **"Start Video Call"**
6. Enter the same room ID
7. Click **"Join Call"**

## Expected Results

### Interviewer Side (Chrome)
- ✅ **Local Video**: Should see "You (John)" with your camera feed
- ✅ **Remote Video**: Should see "Akhil Tripathi" with candidate's camera feed
- ✅ **Controls**: Mute, video toggle, screen share, fullscreen, chat buttons
- ✅ **Participant List**: Shows both participants

### Candidate Side (Safari)
- ✅ **Local Video**: Should see "You (Akhil)" with your camera feed
- ✅ **Remote Video**: Should see "John Interviewer" with interviewer's camera feed
- ✅ **Controls**: Same control buttons as interviewer
- ✅ **Participant List**: Shows both participants

## Feature Testing Checklist

### Basic Video Call
- [ ] Both participants can see each other's video
- [ ] Both participants can see their own video
- [ ] Audio is working (test with microphone)
- [ ] Video quality is acceptable

### Controls Testing
- [ ] **Mute Button**: Click to mute/unmute audio
- [ ] **Video Toggle**: Click to enable/disable camera
- [ ] **Screen Share**: Test screen sharing functionality
- [ ] **Fullscreen**: Test fullscreen mode
- [ ] **Chat**: Test chat functionality (if implemented)

### Connection Testing
- [ ] **Reconnection**: Disconnect and reconnect to test stability
- [ ] **Multiple Participants**: Test with more than 2 participants
- [ ] **Network Issues**: Test behavior with poor network conditions

### Browser Compatibility
- [ ] **Chrome**: Full functionality
- [ ] **Safari**: Full functionality
- [ ] **Firefox**: Test compatibility
- [ ] **Edge**: Test compatibility

## Troubleshooting

### Common Issues

#### 1. "Cannot access camera/microphone"
**Solution**: 
- Check browser permissions
- Allow camera/microphone access when prompted
- Refresh the page and try again

#### 2. "Room not found" error
**Solution**:
- Verify the room ID is correct
- Run `python create_test_room.py` to create a new room
- Check backend server is running

#### 3. "WebSocket connection failed"
**Solution**:
- Ensure Daphne server is running (not regular Django server)
- Check port 8001 is not blocked
- Verify ASGI configuration

#### 4. "Local video not showing"
**Solution**:
- Check camera permissions
- Try refreshing the page
- Check browser console for errors

#### 5. "Remote video not showing"
**Solution**:
- Ensure both participants are in the same room
- Check network connectivity
- Verify WebRTC signaling is working

### Debug Information
Check browser console for these log messages:
- ✅ `🎥 Local video element created`
- ✅ `✅ Setting srcObject to local video element`
- ✅ `📺 Remote stream received for user: [user-id]`
- ✅ `👥 Participants updated: [participants]`

## Advanced Testing

### Performance Testing
- Test with different video qualities
- Monitor CPU and memory usage
- Test with multiple concurrent calls

### Security Testing
- Verify JWT authentication is working
- Test unauthorized access attempts
- Check WebSocket authentication

### Load Testing
- Test with multiple rooms simultaneously
- Test with multiple participants per room
- Monitor server performance under load

## API Endpoints

### WebRTC Endpoints
- `POST /api/interview/webrtc/create-room/` - Create interview room
- `POST /api/interview/webrtc/join-room/` - Join interview room
- `POST /api/interview/webrtc/leave-room/` - Leave interview room

### WebSocket Endpoints
- `ws://localhost:8001/ws/interview/{room_id}/` - WebSocket connection

## Technical Details

### WebRTC Configuration
- **Signaling**: WebSocket-based signaling
- **STUN/TURN**: Currently using STUN servers
- **Codecs**: VP8/VP9 for video, Opus for audio
- **Bandwidth**: Adaptive based on network conditions

### Browser Requirements
- **Chrome**: 60+
- **Safari**: 11+
- **Firefox**: 55+
- **Edge**: 79+

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all prerequisites are met
3. Test with different browsers
4. Check network connectivity
5. Review the troubleshooting section above

## Future Enhancements
- [ ] Screen recording functionality
- [ ] Interview notes and feedback
- [ ] AI-powered interview assistance
- [ ] Multi-party video calls
- [ ] Recording and playback features
