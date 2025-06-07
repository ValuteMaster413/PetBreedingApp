import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Chat, Message
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.room_group_name = f"chat_{self.chat_id}"
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        try:
            chat = await database_sync_to_async(Chat.objects.select_related('user_1', 'user_2').get)(id=self.chat_id)
            self.chat = chat
            self.chat_user1_id = chat.user_1_id
            self.chat_user2_id = chat.user_2_id

            if self.user.id not in [self.chat_user1_id, self.chat_user2_id]:
                await self.close()
                return

        except ObjectDoesNotExist:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            if action == 'send':
                await self.send_message(data)
            elif action == 'edit':
                await self.edit_message(data)
            elif action == 'delete':
                await self.delete_message(data)
            else:
                await self.send_error("Unknown action.")
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON.")
        except Exception as e:
            await self.send_error(f"Unexpected error: {str(e)}")

    async def send_message(self, data):
        message_text = data.get('message')
        if not message_text:
            await self.send_error("Empty message.")
            return

        message = await database_sync_to_async(Message.objects.create)(
            chat=self.chat,
            sender=self.user,
            text=message_text
        )

        response = {
            'type': 'chat_message',
            'action': 'send',
            'message_id': message.id,
            'message': message.text,
            'sender_id': self.user.id
        }

        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'chat_message',
            'message': response
        })

    async def edit_message(self, data):
        message_id = data.get('message_id')
        new_text = data.get('message')

        if not message_id or not new_text:
            await self.send_error("Missing message ID or text for edit.")
            return

        try:
            message = await self.get_message(message_id)
            if message.sender_id != self.user.id:
                await self.send_error("Permission denied.")
                return

            message.text = new_text
            await self.save_message(message)

            response = {
                'type': 'chat_message',
                'action': 'edit',
                'message_id': message.id,
                'message': message.text
            }

            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'chat_message',
                'message': response
            })

        except Message.DoesNotExist:
            await self.send_error("Message not found.")

    async def delete_message(self, data):
        message_id = data.get('message_id')

        if not message_id:
            await self.send_error("Missing message ID for deletion.")
            return

        try:
            message = await self.get_message(message_id)
            if message.sender_id != self.user.id:
                await self.send_error("Permission denied.")
                return

            await self.delete_message_obj(message)

            response = {
                'type': 'chat_message',
                'action': 'delete',
                'message_id': message_id
            }

            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'chat_message',
                'message': response
            })

        except Message.DoesNotExist:
            await self.send_error("Message not found.")

    @database_sync_to_async
    def get_message(self, message_id):
        return Message.objects.get(id=message_id)

    @database_sync_to_async
    def save_message(self, message):
        message.save()

    @database_sync_to_async
    def delete_message_obj(self, message):
        message.delete()

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))
        
    async def send_error(self, message):
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))
