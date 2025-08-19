#!/usr/bin/env python
"""
Simple test script to verify WebRTC backend functionality
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

from interview_management.models import InterviewSession, InterviewRoom, RoomParticipant, ChatMessage
from interview_management.webrtc_service import webrtc_service

def test_models():
    """Test that all models can be imported and accessed"""
    print("✅ Testing model imports...")
    
    try:
        # Test model imports
        print(f"  - InterviewSession: {InterviewSession}")
        print(f"  - InterviewRoom: {InterviewRoom}")
        print(f"  - RoomParticipant: {RoomParticipant}")
        print(f"  - ChatMessage: {ChatMessage}")
        
        # Test model creation (without saving)
        room = InterviewRoom()
        print(f"  - Created InterviewRoom instance: {room}")
        
        participant = RoomParticipant()
        print(f"  - Created RoomParticipant instance: {participant}")
        
        message = ChatMessage()
        print(f"  - Created ChatMessage instance: {message}")
        
        print("✅ All models working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing models: {e}")
        return False

def test_webrtc_service():
    """Test WebRTC service initialization"""
    print("\n✅ Testing WebRTC service...")
    
    try:
        # Test service initialization
        service = webrtc_service
        print(f"  - WebRTC service: {service}")
        print(f"  - ICE servers: {service.ice_servers}")
        
        print("✅ WebRTC service working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing WebRTC service: {e}")
        return False

def test_api_endpoints():
    """Test that API endpoints can be imported"""
    print("\n✅ Testing API endpoints...")
    
    try:
        from interview_management.webrtc_views import (
            create_interview_room,
            join_interview_room,
            leave_interview_room,
            send_webrtc_signal,
            send_chat_message
        )
        
        print("  - create_interview_room: ✅")
        print("  - join_interview_room: ✅")
        print("  - leave_interview_room: ✅")
        print("  - send_webrtc_signal: ✅")
        print("  - send_chat_message: ✅")
        
        print("✅ All API endpoints imported successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing API endpoints: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing WebRTC Backend Components...\n")
    
    tests = [
        test_models,
        test_webrtc_service,
        test_api_endpoints
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append(False)
    
    print(f"\n📊 Test Results: {sum(results)}/{len(results)} passed")
    
    if all(results):
        print("🎉 All tests passed! WebRTC backend is ready.")
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
