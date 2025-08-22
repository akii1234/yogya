# 🚀 ASGI Deployment Guide for Yogya

## 📋 Overview

Yogya uses **ASGI (Asynchronous Server Gateway Interface)** instead of WSGI to support real-time features like WebSocket connections for video calls and live interview sessions. This guide covers everything you need to know about ASGI deployment.

## 🎯 Why ASGI Instead of WSGI?

### **WSGI Limitations:**
- ❌ **Synchronous only** - Can't handle real-time connections
- ❌ **No WebSocket support** - Required for video calls
- ❌ **Blocking operations** - Poor performance for concurrent users
- ❌ **Limited scalability** - Can't handle multiple simultaneous connections

### **ASGI Benefits:**
- ✅ **Asynchronous support** - Handles concurrent connections efficiently
- ✅ **WebSocket support** - Essential for real-time video calls
- ✅ **Better performance** - Non-blocking operations
- ✅ **Future-proof** - Modern Python web standard
- ✅ **Scalable** - Handles multiple simultaneous users

## 🏗️ ASGI Architecture in Yogya

```
┌─────────────────────────────────┐
│         Client Browser          │
├─────────────────────────────────┤
│      WebSocket Connection       │ ← Real-time video calls
│      HTTP Connection            │ ← Regular API calls
├─────────────────────────────────┤
│         ASGI Server             │ ← Daphne/Uvicorn
├─────────────────────────────────┤
│      Django Channels            │ ← WebSocket handling
│      Django REST Framework      │ ← HTTP API handling
├─────────────────────────────────┤
│         Django App              │ ← Your Yogya application
└─────────────────────────────────┘
```

## 🚀 Quick Start

### **1. Install ASGI Dependencies**

```bash
# Navigate to backend directory
cd yogya/backend

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install ASGI dependencies
pip install daphne
pip install channels
pip install channels-redis  # For production Redis backend
```

### **2. Update Django Settings**

Add to `yogya_project/settings.py`:

```python
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# ASGI Configuration
ASGI_APPLICATION = 'yogya_project.asgi.application'

# Channels Configuration
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
        # For production, use Redis:
        # 'BACKEND': 'channels_redis.core.RedisChannelLayer',
        # 'CONFIG': {
        #     "hosts": [('127.0.0.1', 6379)],
        # },
    },
}

# Add 'channels' to INSTALLED_APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'channels',  # Add this line
    # ... your other apps
]
```

### **3. Configure ASGI Application**

Update `yogya_project/asgi.py`:

```python
import os
import django
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from interview_management.routing import websocket_urlpatterns

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yogya_project.settings')
django.setup()

# Import after Django setup
from interview_management.websocket_auth import JWTAuthMiddleware

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        AuthMiddlewareStack(
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})
```

### **4. Create WebSocket Routing**

Create `interview_management/routing.py`:

```python
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/interview/(?P<room_id>[^/]+)/$', consumers.InterviewConsumer.as_asgi()),
]
```

### **5. Create WebSocket Consumer**

Create `interview_management/consumers.py`:

```python
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import InterviewRoom, RoomParticipant

class InterviewConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'interview_{self.room_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'room_id': self.room_id
        }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'webrtc_signal':
            # Handle WebRTC signaling
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'webrtc_signal',
                    'message': data
                }
            )
        elif message_type == 'chat_message':
            # Handle chat messages
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': data
                }
            )

    async def webrtc_signal(self, event):
        # Send WebRTC signal to WebSocket
        await self.send(text_data=json.dumps(event['message']))

    async def chat_message(self, event):
        # Send chat message to WebSocket
        await self.send(text_data=json.dumps(event['message']))
```

## 🚀 Running with ASGI

### **Development Server**

```bash
# Using Daphne (recommended)
daphne -b 0.0.0.0 -p 8001 yogya_project.asgi:application

# Using Uvicorn (alternative)
uvicorn yogya_project.asgi:application --host 0.0.0.0 --port 8001

# Using Hypercorn (alternative)
hypercorn yogya_project.asgi:application --bind 0.0.0.0:8001
```

### **Production Deployment**

#### **Option 1: Daphne with Gunicorn**

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn yogya_project.asgi:application -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

#### **Option 2: Daphne with Supervisor**

Create `/etc/supervisor/conf.d/yogya.conf`:

```ini
[program:yogya]
command=/path/to/yogya/backend/venv/bin/daphne -b 0.0.0.0 -p 8001 yogya_project.asgi:application
directory=/path/to/yogya/backend
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/yogya/daphne.log
```

#### **Option 3: Docker Deployment**

Create `Dockerfile`:

```dockerfile
FROM python:3.9

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["daphne", "-b", "0.0.0.0", "-p", "8001", "yogya_project.asgi:application"]
```

## 🔧 Configuration Options

### **Environment Variables**

```bash
# Development
export DJANGO_SETTINGS_MODULE=yogya_project.settings
export DEBUG=True

# Production
export DJANGO_SETTINGS_MODULE=yogya_project.settings
export DEBUG=False
export ALLOWED_HOSTS=your-domain.com
export SECRET_KEY=your-secret-key
```

### **Channel Layers Configuration**

#### **Development (In-Memory)**
```python
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    },
}
```

#### **Production (Redis)**
```python
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}
```

#### **Production (Redis with Authentication)**
```python
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [{
                "host": "127.0.0.1",
                "port": 6379,
                "password": "your-redis-password"
            }],
        },
    },
}
```

## 🔍 Testing ASGI Setup

### **1. Test WebSocket Connection**

```bash
# Install websocat for testing
brew install websocat  # macOS
# or
sudo apt-get install websocat  # Ubuntu

# Test WebSocket connection
websocat ws://localhost:8001/ws/interview/test-room-123/
```

### **2. Test with Python Script**

Create `test_websocket.py`:

```python
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8001/ws/interview/test-room-123/"
    
    async with websockets.connect(uri) as websocket:
        # Send test message
        await websocket.send(json.dumps({
            'type': 'chat_message',
            'message': 'Hello from test client!'
        }))
        
        # Receive response
        response = await websocket.recv()
        print(f"Received: {response}")

asyncio.run(test_websocket())
```

### **3. Test Video Call Integration**

```bash
# Start the ASGI server
cd yogya/backend
daphne -b 0.0.0.0 -p 8001 yogya_project.asgi:application

# In another terminal, test video call
python test_video_call.py
```

## 🚨 Troubleshooting

### **Common Issues**

#### **1. "ModuleNotFoundError: No module named 'channels'"**
```bash
# Solution: Install channels
pip install channels
```

#### **2. "WebSocket connection failed"**
```bash
# Check if ASGI server is running
ps aux | grep daphne

# Check firewall settings
sudo ufw allow 8001
```

#### **3. "Redis connection failed"**
```bash
# Install and start Redis
sudo apt-get install redis-server  # Ubuntu
brew install redis  # macOS

# Start Redis
sudo systemctl start redis-server
```

#### **4. "Permission denied"**
```bash
# Fix permissions
sudo chown -R www-data:www-data /path/to/yogya
sudo chmod -R 755 /path/to/yogya
```

### **Debug Mode**

Enable debug logging in `settings.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'channels': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
        'daphne': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## 📊 Performance Monitoring

### **Monitor WebSocket Connections**

```python
# Add to your consumer
async def connect(self):
    # Log connection
    print(f"WebSocket connected: {self.channel_name}")
    await super().connect()

async def disconnect(self, close_code):
    # Log disconnection
    print(f"WebSocket disconnected: {self.channel_name}, code: {close_code}")
    await super().disconnect(close_code)
```

### **Monitor Channel Layer Performance**

```python
# Add to settings.py
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
            "capacity": 1500,  # Maximum number of messages in a channel
            "expiry": 10,      # Message expiry in seconds
        },
    },
}
```

## 🔒 Security Considerations

### **1. WebSocket Authentication**

```python
# Custom authentication middleware
class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Extract token from query parameters
        query_string = scope.get('query_string', b'').decode()
        query_params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
        token = query_params.get('token', None)
        
        if token:
            # Validate JWT token
            try:
                # Your JWT validation logic here
                scope['user'] = await self.get_user(token)
            except:
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()
            
        return await self.app(scope, receive, send)
```

### **2. Rate Limiting**

```python
# Add rate limiting to consumers
from channels.middleware import BaseMiddleware
import asyncio

class RateLimitMiddleware(BaseMiddleware):
    def __init__(self, app, rate_limit=100):
        self.app = app
        self.rate_limit = rate_limit
        self.requests = {}

    async def __call__(self, scope, receive, send):
        # Implement rate limiting logic
        return await self.app(scope, receive, send)
```

## 📚 Additional Resources

- [Django Channels Documentation](https://channels.readthedocs.io/)
- [Daphne Documentation](https://github.com/django/daphne)
- [ASGI Specification](https://asgi.readthedocs.io/)
- [WebSocket Protocol](https://tools.ietf.org/html/rfc6455)

## 🎯 Summary

Yogya uses ASGI to support real-time features like video calls and live interview sessions. The key components are:

1. **Daphne** - ASGI server for running the application
2. **Django Channels** - WebSocket support and real-time features
3. **Redis** - Channel layer backend for production
4. **Custom Authentication** - JWT-based WebSocket authentication

This setup enables Yogya to provide seamless real-time video interview experiences while maintaining the performance and scalability needed for enterprise use.

---

**Need Help?** Contact: django.devakhil21@gmail.com
