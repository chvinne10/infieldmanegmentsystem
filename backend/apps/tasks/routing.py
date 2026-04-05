"""
WebSocket routing for Tasks app using Django Channels.
"""
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/tasks/updates/$', consumers.TaskConsumer.as_asgi()),
]
