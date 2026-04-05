"""
WebSocket consumers for real-time task updates.
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()


class TaskConsumer(AsyncWebsocketConsumer):
    """Consumer for real-time task updates."""
    
    async def connect(self):
        """Handle WebSocket connection."""
        self.user = self.scope['user']
        
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Create a room name based on user
        self.room_name = f'user_{self.user.id}'
        self.room_group_name = f'tasks_{self.room_name}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"User {self.user.username} connected to {self.room_group_name}")
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"User {self.user.username} disconnected")
    
    async def receive(self, text_data):
        """Receive message from WebSocket."""
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'task.message')
            
            # Broadcast to group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': message_type,
                    'data': data
                }
            )
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON'
            }))
    
    # Handler for task.update messages
    async def task_update(self, event):
        """Send task update to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'task_update',
            'data': event.get('data')
        }))
    
    # Handler for task.created messages
    async def task_created(self, event):
        """Send new task notification."""
        await self.send(text_data=json.dumps({
            'type': 'task_created',
            'data': event.get('data')
        }))
    
    # Handler for task.completed messages
    async def task_completed(self, event):
        """Send task completion notification."""
        await self.send(text_data=json.dumps({
            'type': 'task_completed',
            'data': event.get('data')
        }))
    
    # Generic message handler
    async def task_message(self, event):
        """Send generic message to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'message',
            'data': event.get('data')
        }))


async def broadcast_task_update(user_id, data):
    """Helper function to broadcast task updates."""
    from channels.layers import get_channel_layer
    channel_layer = get_channel_layer()
    
    await channel_layer.group_send(
        f'tasks_user_{user_id}',
        {
            'type': 'task_update',
            'data': data
        }
    )
