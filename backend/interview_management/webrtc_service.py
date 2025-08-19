import json
import logging
from typing import Dict, List, Optional
from django.conf import settings
from .models import InterviewRoom, RoomParticipant, ChatMessage, InterviewSession
from django.contrib.auth.models import User
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)

class WebRTCService:
    """Service for managing WebRTC connections and signaling"""
    
    def __init__(self):
        try:
            self.channel_layer = get_channel_layer()
        except:
            self.channel_layer = None
        self.ice_servers = [
            {"urls": "stun:stun.l.google.com:19302"},
            {"urls": "stun:stun1.l.google.com:19302"},
        ]
    
    def create_room(self, interview_id: str, room_config: Dict = None) -> InterviewRoom:
        """Create a new interview room"""
        try:
            interview = InterviewSession.objects.get(id=interview_id)
            
            room_id = f"room_{interview_id}_{interview.created_at.strftime('%Y%m%d_%H%M%S')}"
            
            room = InterviewRoom.objects.create(
                room_id=room_id,
                interview=interview,
                ice_servers=self.ice_servers,
                recording_enabled=room_config.get('recording_enabled', True) if room_config else True,
                screen_sharing_enabled=room_config.get('screen_sharing_enabled', True) if room_config else True,
                chat_enabled=room_config.get('chat_enabled', True) if room_config else True,
            )
            
            logger.info(f"Created interview room: {room_id}")
            return room
            
        except Exception as e:
            logger.error(f"Error creating room: {e}")
            raise
    
    def join_room(self, room_id: str, user_id: int, participant_type: str, peer_id: str = None) -> RoomParticipant:
        """Join an interview room"""
        try:
            room = InterviewRoom.objects.get(room_id=room_id, is_active=True)
            user = User.objects.get(id=user_id)
            
            # Check if user is already a participant
            participant, created = RoomParticipant.objects.get_or_create(
                room=room,
                user=user,
                defaults={
                    'participant_type': participant_type,
                    'peer_id': peer_id,
                    'connection_state': 'connecting'
                }
            )
            
            if not created:
                # Update existing participant
                participant.is_active = True
                participant.connection_state = 'connecting'
                if peer_id:
                    participant.peer_id = peer_id
                participant.save()
            
            # Send join notification to other participants
            self._notify_participants(room_id, 'user_joined', {
                'user_id': user_id,
                'user_email': user.email,
                'participant_type': participant_type,
                'peer_id': peer_id
            })
            
            logger.info(f"User {user.email} joined room {room_id}")
            return participant
            
        except Exception as e:
            logger.error(f"Error joining room: {e}")
            raise
    
    def leave_room(self, room_id: str, user_id: int) -> bool:
        """Leave an interview room"""
        try:
            participant = RoomParticipant.objects.get(
                room__room_id=room_id,
                user_id=user_id,
                is_active=True
            )
            
            participant.leave_room()
            
            # Send leave notification to other participants
            self._notify_participants(room_id, 'user_left', {
                'user_id': user_id,
                'user_email': participant.user.email,
                'peer_id': participant.peer_id
            })
            
            logger.info(f"User {participant.user.email} left room {room_id}")
            return True
            
        except RoomParticipant.DoesNotExist:
            logger.warning(f"User {user_id} not found in room {room_id}")
            return False
        except Exception as e:
            logger.error(f"Error leaving room: {e}")
            raise
    
    def send_offer(self, room_id: str, from_user_id: int, to_user_id: int, offer: Dict) -> bool:
        """Send WebRTC offer"""
        try:
            self._notify_user(room_id, to_user_id, 'webrtc_offer', {
                'from_user_id': from_user_id,
                'offer': offer
            })
            return True
        except Exception as e:
            logger.error(f"Error sending offer: {e}")
            return False
    
    def send_answer(self, room_id: str, from_user_id: int, to_user_id: int, answer: Dict) -> bool:
        """Send WebRTC answer"""
        try:
            self._notify_user(room_id, to_user_id, 'webrtc_answer', {
                'from_user_id': from_user_id,
                'answer': answer
            })
            return True
        except Exception as e:
            logger.error(f"Error sending answer: {e}")
            return False
    
    def send_ice_candidate(self, room_id: str, from_user_id: int, to_user_id: int, candidate: Dict) -> bool:
        """Send ICE candidate"""
        try:
            self._notify_user(room_id, to_user_id, 'ice_candidate', {
                'from_user_id': from_user_id,
                'candidate': candidate
            })
            return True
        except Exception as e:
            logger.error(f"Error sending ICE candidate: {e}")
            return False
    
    def send_chat_message(self, room_id: str, user_id: int, message: str) -> ChatMessage:
        """Send a chat message"""
        try:
            room = InterviewRoom.objects.get(room_id=room_id)
            user = User.objects.get(id=user_id)
            
            chat_message = ChatMessage.objects.create(
                room=room,
                sender=user,
                message=message
            )
            
            # Notify all participants about the message
            self._notify_participants(room_id, 'chat_message', {
                'message_id': str(chat_message.id),
                'user_id': user_id,
                'user_email': user.email,
                'message': message,
                'timestamp': chat_message.timestamp.isoformat()
            })
            
            return chat_message
            
        except Exception as e:
            logger.error(f"Error sending chat message: {e}")
            raise
    
    def get_room_participants(self, room_id: str) -> List[Dict]:
        """Get all active participants in a room"""
        try:
            participants = RoomParticipant.objects.filter(
                room__room_id=room_id,
                is_active=True
            ).select_related('user')
            
            return [{
                'user_id': p.user.id,
                'user_email': p.user.email,
                'participant_type': p.participant_type,
                'peer_id': p.peer_id,
                'connection_state': p.connection_state,
                'joined_at': p.joined_at.isoformat()
            } for p in participants]
            
        except Exception as e:
            logger.error(f"Error getting room participants: {e}")
            return []
    
    def get_room_messages(self, room_id: str, limit: int = 50) -> List[Dict]:
        """Get recent chat messages for a room"""
        try:
            messages = ChatMessage.objects.filter(
                room__room_id=room_id
            ).select_related('sender').order_by('-timestamp')[:limit]
            
            return [{
                'message_id': str(m.id),
                'user_id': m.sender.id,
                'user_email': m.sender.email,
                'message': m.message,
                'timestamp': m.timestamp.isoformat(),
                'is_system_message': m.is_system_message
            } for m in reversed(messages)]  # Return in chronological order
            
        except Exception as e:
            logger.error(f"Error getting room messages: {e}")
            return []
    
    def _notify_participants(self, room_id: str, event_type: str, data: Dict):
        """Notify all participants in a room"""
        if not self.channel_layer:
            logger.warning("Channel layer not available, skipping notification")
            return
        try:
            async_to_sync(self.channel_layer.group_send)(
                f"room_{room_id}",
                {
                    "type": "interview.message",
                    "event_type": event_type,
                    "data": data
                }
            )
        except Exception as e:
            logger.error(f"Error notifying participants: {e}")
    
    def _notify_user(self, room_id: str, user_id: int, event_type: str, data: Dict):
        """Notify a specific user in a room"""
        if not self.channel_layer:
            logger.warning("Channel layer not available, skipping notification")
            return
        try:
            async_to_sync(self.channel_layer.group_send)(
                f"room_{room_id}_user_{user_id}",
                {
                    "type": "interview.message",
                    "event_type": event_type,
                    "data": data
                }
            )
        except Exception as e:
            logger.error(f"Error notifying user: {e}")

# Global WebRTC service instance
webrtc_service = WebRTCService()
