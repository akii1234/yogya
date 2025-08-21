#!/usr/bin/env python3
"""
Video Call Test Script for Yogya Platform
This script helps test the WebRTC video call functionality step by step.
"""

import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8001/api"
TEST_ROOM_ID = "test-room-123"

def get_auth_token(email, password):
    """Get JWT token for authentication"""
    try:
        response = requests.post(f"{BASE_URL}/token/", {
            "email": email,
            "password": password
        })
        
        if response.status_code == 200:
            token = response.json()["access"]
            print(f"✅ Authentication successful for {email}")
            return token
        else:
            print(f"❌ Authentication failed for {email}: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error during authentication: {e}")
        return None

def create_interview_room(token, room_id):
    """Create a new interview room"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(f"{BASE_URL}/interview/webrtc/create-room/", {
            "interview_id": "2ed51f47-54c1-4f52-ac70-d08ce1d76516",  # Test interview session
            "room_config": {
                "recording_enabled": True,
                "screen_sharing_enabled": True,
                "chat_enabled": True
            }
        }, headers=headers)
        
        if response.status_code == 201:
            print(f"✅ Room created successfully: {room_id}")
            return response.json()
        else:
            print(f"❌ Failed to create room: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error creating room: {e}")
        return None

def join_interview_room(token, room_id, participant_type="candidate"):
    """Join an existing interview room"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(f"{BASE_URL}/interview/webrtc/join-room/", {
            "room_id": room_id,
            "participant_type": participant_type
        }, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Successfully joined room: {room_id}")
            return response.json()
        else:
            print(f"❌ Failed to join room: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error joining room: {e}")
        return None

def send_chat_message(token, room_id, message):
    """Send a chat message in the room"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(f"{BASE_URL}/interview/webrtc/send-message/", {
            "room_id": room_id,
            "message": message
        }, headers=headers)
        
        if response.status_code == 200:
            message_data = response.json()
            print(f"✅ Message sent: {message}")
            return message_data
        else:
            print(f"❌ Failed to send message: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error sending message: {e}")
        return None

def get_room_participants(token, room_id):
    """Get list of participants in the room"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/interview/webrtc/participants/{room_id}/", headers=headers)
        
        if response.status_code == 200:
            participants = response.json()
            print(f"✅ Room participants: {len(participants)} users")
            for participant in participants:
                print(f"  - {participant.get('user_name', 'Unknown')} ({participant.get('participant_type', 'unknown')})")
            return participants
        else:
            print(f"❌ Failed to get participants: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error getting participants: {e}")
        return None

def leave_interview_room(token, room_id):
    """Leave the interview room"""
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(f"{BASE_URL}/interview/webrtc/leave-room/", {
            "room_id": room_id
        }, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Successfully left room: {room_id}")
            return True
        else:
            print(f"❌ Failed to leave room: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error leaving room: {e}")
        return False

def test_video_call_workflow():
    """Test the complete video call workflow"""
    print("🎥 Testing Video Call Functionality")
    print("=" * 50)
    
    # Test credentials
    interviewer_email = "interviewer@yogya.com"
    interviewer_password = "interviewer123"
    candidate_email = "akhiltripathi.t1@gmail.com"
    candidate_password = "candidate123"
    
    # Step 1: Get tokens for both users
    print("\n1️⃣ Getting authentication tokens...")
    interviewer_token = get_auth_token(interviewer_email, interviewer_password)
    candidate_token = get_auth_token(candidate_email, candidate_password)
    
    if not interviewer_token or not candidate_token:
        print("❌ Cannot proceed without valid tokens")
        return
    
    # Step 2: Create room (interviewer creates it)
    print(f"\n2️⃣ Creating interview room...")
    room_data = create_interview_room(interviewer_token, TEST_ROOM_ID)
    
    if not room_data:
        print("❌ Cannot proceed without creating a room")
        return
    
    # Step 3: Both users join the room
    room_id = room_data.get('room_id')
    print(f"\n3️⃣ Joining interview room: {room_id}")
    
    # Interviewer joins
    interviewer_join = join_interview_room(interviewer_token, room_id, "interviewer")
    if not interviewer_join:
        print("❌ Interviewer failed to join room")
        return
    
    # Candidate joins
    candidate_join = join_interview_room(candidate_token, room_id, "candidate")
    if not candidate_join:
        print("❌ Candidate failed to join room")
        return
    
    # Step 4: Check participants
    print(f"\n4️⃣ Checking room participants...")
    participants = get_room_participants(interviewer_token, room_id)
    
    # Step 5: Send some test messages
    print(f"\n5️⃣ Testing chat functionality...")
    send_chat_message(interviewer_token, room_id, "Hello! Welcome to the interview.")
    time.sleep(1)
    send_chat_message(candidate_token, room_id, "Thank you! I'm ready to begin.")
    time.sleep(1)
    send_chat_message(interviewer_token, room_id, "Great! Let's start with some questions.")
    
    # Step 6: Leave the room
    print(f"\n6️⃣ Leaving the room...")
    leave_interview_room(interviewer_token, room_id)
    leave_interview_room(candidate_token, room_id)
    
    print(f"\n✅ Video call test completed successfully!")
    print(f"\n📋 Next Steps:")
    print(f"1. Open http://localhost:5173 in your browser")
    print(f"2. Login as interviewer: {interviewer_email}")
    print(f"3. Go to 'AI Assistant' in the sidebar")
    print(f"4. Enter room ID: {room_id}")
    print(f"5. Click 'Start Video Call'")
    print(f"6. Open another tab and login as candidate")
    print(f"7. Join the same room to test peer-to-peer video calling")

if __name__ == "__main__":
    test_video_call_workflow()
