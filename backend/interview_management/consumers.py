import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from user_management.models import User
from .models import InterviewRoom, RoomParticipant
from .webrtc_service import webrtc_service

logger = logging.getLogger(__name__)

class InterviewConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for interview rooms with WebRTC signaling"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_id = None
        self.user = None
        self.room_group_name = None

    async def connect(self):
        """Handle WebSocket connection"""
        try:
            # Extract room_id from URL
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            self.room_group_name = f'room_{self.room_id}'
            
            # Get user from scope
            self.user = self.scope.get('user', AnonymousUser())
            
            if isinstance(self.user, AnonymousUser):
                await self.close()
                return
            
            logger.info(f"WebSocket connection attempt for room {self.room_id} by user {self.user.email}")
            
            # Verify room exists
            room_exists = await self.verify_room_access()
            if not room_exists:
                await self.close()
                return
            
            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
            
            logger.info(f"WebSocket connected: {self.user.email} in room {self.room_id}")
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'user_id': str(self.user.id),
                'room_id': self.room_id,
                'message': 'Connected to interview room'
            }))
            
            # Notify other participants
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_joined_room',
                    'user_id': str(self.user.id),
                    'user_email': self.user.email,
                    'user_name': self.user.get_full_name()
                }
            )
            
        except Exception as e:
            logger.error(f"Error in WebSocket connect: {e}")
            await self.close()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            if self.room_group_name:
                # Notify other participants
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_left_room',
                        'user_id': str(self.user.id),
                        'user_email': self.user.email,
                        'user_name': self.user.get_full_name()
                    }
                )
                
                # Leave room group
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
            
            logger.info(f"WebSocket disconnected: {self.user.email} from room {self.room_id}")
            
        except Exception as e:
            logger.error(f"Error in WebSocket disconnect: {e}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            logger.info(f"Received message from {self.user.email}: {message_type}")
            
            if message_type == 'webrtc_signal':
                await self.handle_webrtc_signal(data)
            elif message_type == 'chat_message':
                await self.handle_chat_message(data)
            elif message_type == 'join_room':
                await self.handle_join_room(data)
            elif message_type == 'leave_room':
                await self.handle_leave_room(data)
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error handling message: {e}")

    async def interview_message(self, event):
        """Handle interview.message from channel layer"""
        # This is a placeholder handler for channel layer messages
        # that might be sent to the consumer
        logger.info(f"Received interview.message: {event}")
        pass

    async def handle_webrtc_signal(self, data):
        """Handle WebRTC signaling messages"""
        try:
            signal_type = data.get('signal_type')  # 'offer', 'answer', 'ice_candidate'
            target_user_id = data.get('target_user_id')
            signal_data = data.get('signal_data')
            
            if not all([signal_type, target_user_id, signal_data]):
                logger.error("Missing required fields in WebRTC signal")
                return
            
            # Forward the signal to the target user
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'webrtc_signal',
                    'from_user_id': str(self.user.id),
                    'target_user_id': target_user_id,
                    'signal_type': signal_type,
                    'signal_data': signal_data
                }
            )
            
            logger.info(f"WebRTC signal forwarded: {signal_type} from {self.user.email} to {target_user_id}")
            
        except Exception as e:
            logger.error(f"Error handling WebRTC signal: {e}")

    async def handle_chat_message(self, data):
        """Handle chat messages"""
        try:
            message = data.get('message', '').strip()
            
            if not message:
                return
            
            # Save message to database
            await self.save_chat_message(message)
            
            # Broadcast to all users in room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'user_id': str(self.user.id),
                    'user_email': self.user.email,
                    'user_name': self.user.get_full_name(),
                    'message': message,
                    'timestamp': data.get('timestamp')
                }
            )
            
        except Exception as e:
            logger.error(f"Error handling chat message: {e}")

    async def handle_join_room(self, data):
        """Handle user joining room"""
        try:
            participant_type = data.get('participant_type', 'candidate')
            
            # Join room via service
            await self.join_room_service(participant_type)
            
            # Get room participants
            participants = await self.get_room_participants()
            
            # Send participants list to all users
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'participants_updated',
                    'participants': participants
                }
            )
            
        except Exception as e:
            logger.error(f"Error handling join room: {e}")

    async def handle_leave_room(self, data):
        """Handle user leaving room"""
        try:
            # Leave room via service
            await self.leave_room_service()
            
            # Get updated participants list
            participants = await self.get_room_participants()
            
            # Send updated participants list
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'participants_updated',
                    'participants': participants
                }
            )
            
        except Exception as e:
            logger.error(f"Error handling leave room: {e}")

    # WebSocket event handlers
    async def user_joined_room(self, event):
        """Handle user joined room event"""
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user_id': event['user_id'],
            'user_email': event['user_email'],
            'user_name': event['user_name']
        }))

    async def user_left_room(self, event):
        """Handle user left room event"""
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user_id': event['user_id'],
            'user_email': event['user_email'],
            'user_name': event['user_name']
        }))

    async def webrtc_signal(self, event):
        """Handle WebRTC signal event"""
        # Only send to the target user
        if str(self.user.id) == event['target_user_id']:
            await self.send(text_data=json.dumps({
                'type': 'webrtc_signal',
                'from_user_id': event['from_user_id'],
                'signal_type': event['signal_type'],
                'signal_data': event['signal_data']
            }))

    async def chat_message(self, event):
        """Handle chat message event"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'user_id': event['user_id'],
            'user_email': event['user_email'],
            'user_name': event['user_name'],
            'message': event['message'],
            'timestamp': event['timestamp']
        }))

    async def participants_updated(self, event):
        """Handle participants updated event"""
        await self.send(text_data=json.dumps({
            'type': 'participants_updated',
            'participants': event['participants']
        }))

    # Database operations
    @database_sync_to_async
    def verify_room_access(self):
        """Verify user has access to the room"""
        try:
            room = InterviewRoom.objects.get(room_id=self.room_id, is_active=True)
            return True
        except InterviewRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def join_room_service(self, participant_type):
        """Join room via service"""
        try:
            webrtc_service.join_room(
                room_id=self.room_id,
                user_id=self.user.id,
                participant_type=participant_type
            )
        except Exception as e:
            logger.error(f"Error joining room service: {e}")

    @database_sync_to_async
    def leave_room_service(self):
        """Leave room via service"""
        try:
            webrtc_service.leave_room(
                room_id=self.room_id,
                user_id=self.user.id
            )
        except Exception as e:
            logger.error(f"Error leaving room service: {e}")

    @database_sync_to_async
    def get_room_participants(self):
        """Get room participants"""
        try:
            return webrtc_service.get_room_participants(self.room_id)
        except Exception as e:
            logger.error(f"Error getting participants: {e}")
            return []

    @database_sync_to_async
    def save_chat_message(self, message):
        """Save chat message to database"""
        try:
            room = InterviewRoom.objects.get(room_id=self.room_id)
            from .models import ChatMessage
            ChatMessage.objects.create(
                room=room,
                sender=self.user,
                message=message
            )
        except Exception as e:
            logger.error(f"Error saving chat message: {e}")
