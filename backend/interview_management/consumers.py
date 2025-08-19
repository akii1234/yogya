import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import InterviewRoom, RoomParticipant

logger = logging.getLogger(__name__)

class InterviewConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for interview room communication"""
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'room_{self.room_id}'
        
        # Check if user is authenticated
        if isinstance(self.scope['user'], AnonymousUser):
            await self.close()
            return
        
        # Check if room exists and user has access
        if not await self.can_access_room():
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Notify others that user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'interview_message',
                'event_type': 'user_joined',
                'data': {
                    'user_id': self.scope['user'].id,
                    'user_email': self.scope['user'].email,
                    'message': f"{self.scope['user'].email} joined the interview"
                }
            }
        )
        
        logger.info(f"User {self.scope['user'].email} connected to room {self.room_id}")
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Notify others that user left
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'interview_message',
                    'event_type': 'user_left',
                    'data': {
                        'user_id': self.scope['user'].id,
                        'user_email': self.scope['user'].email,
                        'message': f"{self.scope['user'].email} left the interview"
                    }
                }
            )
        
        logger.info(f"User {self.scope['user'].email} disconnected from room {self.room_id}")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            event_type = data.get('event_type')
            
            if event_type == 'webrtc_signal':
                await self.handle_webrtc_signal(data)
            elif event_type == 'chat_message':
                await self.handle_chat_message(data)
            elif event_type == 'user_action':
                await self.handle_user_action(data)
            else:
                logger.warning(f"Unknown event type: {event_type}")
                
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
        except Exception as e:
            logger.error(f"Error processing message: {e}")
    
    async def handle_webrtc_signal(self, data):
        """Handle WebRTC signaling messages"""
        signal_type = data.get('signal_type')
        to_user_id = data.get('to_user_id')
        signal_data = data.get('signal_data')
        
        # Send signal to specific user
        await self.channel_layer.group_send(
            f'room_{self.room_id}_user_{to_user_id}',
            {
                'type': 'interview_message',
                'event_type': 'webrtc_signal',
                'data': {
                    'signal_type': signal_type,
                    'from_user_id': self.scope['user'].id,
                    'signal_data': signal_data
                }
            }
        )
    
    async def handle_chat_message(self, data):
        """Handle chat messages"""
        message = data.get('message', '').strip()
        
        if message:
            # Save message to database
            await self.save_chat_message(message)
            
            # Broadcast to all users in room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'interview_message',
                    'event_type': 'chat_message',
                    'data': {
                        'user_id': self.scope['user'].id,
                        'user_email': self.scope['user'].email,
                        'message': message,
                        'timestamp': str(self.scope['user'].date_joined)
                    }
                }
            )
    
    async def handle_user_action(self, data):
        """Handle user actions (mute, video toggle, etc.)"""
        action = data.get('action')
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'interview_message',
                'event_type': 'user_action',
                'data': {
                    'user_id': self.scope['user'].id,
                    'user_email': self.scope['user'].email,
                    'action': action
                }
            }
        )
    
    async def interview_message(self, event):
        """Send message to WebSocket"""
        await self.send(text_data=json.dumps({
            'event_type': event['event_type'],
            'data': event['data']
        }))
    
    @database_sync_to_async
    def can_access_room(self):
        """Check if user can access the interview room"""
        try:
            room = InterviewRoom.objects.get(room_id=self.room_id, is_active=True)
            participant = RoomParticipant.objects.filter(
                room=room,
                user=self.scope['user'],
                is_active=True
            ).first()
            
            return participant is not None
        except InterviewRoom.DoesNotExist:
            return False
    
    @database_sync_to_async
    def save_chat_message(self, message):
        """Save chat message to database"""
        try:
            room = InterviewRoom.objects.get(room_id=self.room_id)
            ChatMessage.objects.create(
                room=room,
                sender=self.scope['user'],
                message=message
            )
        except Exception as e:
            logger.error(f"Error saving chat message: {e}")
