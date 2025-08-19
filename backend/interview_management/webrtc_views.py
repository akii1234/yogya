from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import InterviewRoom, RoomParticipant, ChatMessage, InterviewSession
from .webrtc_service import webrtc_service
from .serializers import InterviewRoomSerializer, RoomParticipantSerializer, ChatMessageSerializer
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_interview_room(request):
    """Create a new interview room"""
    try:
        interview_id = request.data.get('interview_id')
        room_config = request.data.get('room_config', {})
        
        if not interview_id:
            return Response(
                {'error': 'interview_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify interview exists and user has access
        interview = get_object_or_404(InterviewSession, id=interview_id)
        
        # Check if user is interviewer or HR for this interview
        if not (request.user.role == 'interviewer' or request.user.role == 'hr'):
            return Response(
                {'error': 'Unauthorized to create interview room'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create room
        room = webrtc_service.create_room(interview_id, room_config)
        
        serializer = InterviewRoomSerializer(room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error creating interview room: {e}")
        return Response(
            {'error': 'Failed to create interview room'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_interview_room(request):
    """Join an interview room"""
    try:
        room_id = request.data.get('room_id')
        participant_type = request.data.get('participant_type', 'candidate')
        peer_id = request.data.get('peer_id')
        
        if not room_id:
            return Response(
                {'error': 'room_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Join room
        participant = webrtc_service.join_room(
            room_id=room_id,
            user_id=request.user.id,
            participant_type=participant_type,
            peer_id=peer_id
        )
        
        # Get room details
        room = participant.room
        room_data = InterviewRoomSerializer(room).data
        
        # Get current participants
        participants = webrtc_service.get_room_participants(room_id)
        
        # Get recent messages
        messages = webrtc_service.get_room_messages(room_id)
        
        return Response({
            'room': room_data,
            'participant': RoomParticipantSerializer(participant).data,
            'participants': participants,
            'messages': messages
        }, status=status.HTTP_200_OK)
        
    except InterviewRoom.DoesNotExist:
        return Response(
            {'error': 'Interview room not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error joining interview room: {e}")
        return Response(
            {'error': 'Failed to join interview room'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def leave_interview_room(request):
    """Leave an interview room"""
    try:
        room_id = request.data.get('room_id')
        
        if not room_id:
            return Response(
                {'error': 'room_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        success = webrtc_service.leave_room(room_id, request.user.id)
        
        if success:
            return Response({'message': 'Successfully left room'}, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'User not found in room'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
    except Exception as e:
        logger.error(f"Error leaving interview room: {e}")
        return Response(
            {'error': 'Failed to leave interview room'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_webrtc_signal(request):
    """Send WebRTC signaling (offer, answer, ICE candidate)"""
    try:
        room_id = request.data.get('room_id')
        signal_type = request.data.get('signal_type')  # 'offer', 'answer', 'ice_candidate'
        to_user_id = request.data.get('to_user_id')
        signal_data = request.data.get('signal_data')
        
        if not all([room_id, signal_type, to_user_id, signal_data]):
            return Response(
                {'error': 'room_id, signal_type, to_user_id, and signal_data are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        success = False
        
        if signal_type == 'offer':
            success = webrtc_service.send_offer(room_id, request.user.id, to_user_id, signal_data)
        elif signal_type == 'answer':
            success = webrtc_service.send_answer(room_id, request.user.id, to_user_id, signal_data)
        elif signal_type == 'ice_candidate':
            success = webrtc_service.send_ice_candidate(room_id, request.user.id, to_user_id, signal_data)
        else:
            return Response(
                {'error': 'Invalid signal_type'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if success:
            return Response({'message': 'Signal sent successfully'}, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Failed to send signal'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    except Exception as e:
        logger.error(f"Error sending WebRTC signal: {e}")
        return Response(
            {'error': 'Failed to send signal'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_chat_message(request):
    """Send a chat message in the interview room"""
    try:
        room_id = request.data.get('room_id')
        message = request.data.get('message')
        
        if not all([room_id, message]):
            return Response(
                {'error': 'room_id and message are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(message.strip()) == 0:
            return Response(
                {'error': 'Message cannot be empty'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send message
        chat_message = webrtc_service.send_chat_message(room_id, request.user.id, message)
        
        serializer = ChatMessageSerializer(chat_message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error sending chat message: {e}")
        return Response(
            {'error': 'Failed to send message'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_room_participants(request, room_id):
    """Get all participants in an interview room"""
    try:
        participants = webrtc_service.get_room_participants(room_id)
        return Response(participants, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting room participants: {e}")
        return Response(
            {'error': 'Failed to get participants'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_room_messages(request, room_id):
    """Get chat messages for an interview room"""
    try:
        limit = request.GET.get('limit', 50)
        messages = webrtc_service.get_room_messages(room_id, int(limit))
        return Response(messages, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error getting room messages: {e}")
        return Response(
            {'error': 'Failed to get messages'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_room_recording(request):
    """Start recording the interview room"""
    try:
        room_id = request.data.get('room_id')
        recording_type = request.data.get('recording_type', 'video')  # 'video', 'audio', 'screen'
        
        if not room_id:
            return Response(
                {'error': 'room_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify user has permission to start recording
        room = get_object_or_404(InterviewRoom, room_id=room_id)
        participant = get_object_or_404(
            RoomParticipant, 
            room=room, 
            user=request.user, 
            is_active=True
        )
        
        if participant.participant_type not in ['interviewer', 'hr']:
            return Response(
                {'error': 'Only interviewers and HR can start recording'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # TODO: Implement actual recording logic
        # For now, just return success
        return Response({
            'message': 'Recording started',
            'recording_type': recording_type
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error starting room recording: {e}")
        return Response(
            {'error': 'Failed to start recording'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def stop_room_recording(request):
    """Stop recording the interview room"""
    try:
        room_id = request.data.get('room_id')
        
        if not room_id:
            return Response(
                {'error': 'room_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # TODO: Implement actual recording stop logic
        return Response({
            'message': 'Recording stopped'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error stopping room recording: {e}")
        return Response(
            {'error': 'Failed to stop recording'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
