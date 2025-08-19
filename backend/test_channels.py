#!/usr/bin/env python
"""
Test Django Channels configuration
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

try:
    print("Testing Django Channels configuration...")
    
    # Test channels imports
    from channels.layers import get_channel_layer
    print("✅ Channels imported successfully")
    
    # Test channel layer
    channel_layer = get_channel_layer()
    print(f"✅ Channel layer: {channel_layer}")
    
    # Test ASGI application
    from yogya_project.asgi import application
    print("✅ ASGI application configured")
    
    # Test WebSocket routing
    from interview_management.routing import websocket_urlpatterns
    print(f"✅ WebSocket patterns: {len(websocket_urlpatterns)} patterns")
    
    # Test consumer
    from interview_management.consumers import InterviewConsumer
    print("✅ InterviewConsumer imported")
    
    print("🎉 Django Channels is properly configured!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
