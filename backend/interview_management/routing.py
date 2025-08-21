from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/interview/(?P<room_id>[^/]+)/$', consumers.InterviewConsumer.as_asgi()),
]
