import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Chat, Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.chat_group_name = f'chat_{self.chat_id}'
        self.user = self.scope['user']

        if not self.user.is_authenticated or not await self.is_chat_member():
            await self.close()
            return

        await self.channel_layer.group_add(self.chat_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.chat_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get('action')

        if action == 'send':
            text = data.get('text')
            if text:
                message = await self.save_message(text)
                await self.channel_layer.group_send(
                    self.chat_group_name,
                    {
                        'type': 'chat_message',
                        'message': {
                            'type': 'send',
                            'message_id': message.id,
                            'sender': message.sender.username,
                            'text': message.text,
                            'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M:%S')
                        }
                    }
                )

        elif action == 'edit':
            message_id = data.get('message_id')
            new_text = data.get('text')
            if message_id and new_text:
                success = await self.edit_message(message_id, new_text)
                if success:
                    await self.channel_layer.group_send(
                        self.chat_group_name,
                        {
                            'type': 'chat_message',
                            'message': {
                                'type': 'edit',
                                'message_id': message_id,
                                'text': new_text
                            }
                        }
                    )

        elif action == 'delete':
            message_id = data.get('message_id')
            if message_id:
                success = await self.delete_message(message_id)
                if success:
                    await self.channel_layer.group_send(
                        self.chat_group_name,
                        {
                            'type': 'chat_message',
                            'message': {
                                'type': 'delete',
                                'message_id': message_id
                            }
                        }
                    )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def is_chat_member(self):
        try:
            chat = Chat.objects.get(id=self.chat_id)
            return self.user == chat.user_1 or self.user == chat.user_2
        except Chat.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, text):
        chat = Chat.objects.get(id=self.chat_id)
        return Message.objects.create(chat=chat, sender=self.user, text=text)

    @database_sync_to_async
    def edit_message(self, message_id, new_text):
        try:
            message = Message.objects.get(id=message_id, sender=self.user)
            message.text = new_text
            message.save()
            return True
        except Message.DoesNotExist:
            return False

    @database_sync_to_async
    def delete_message(self, message_id):
        try:
            message = Message.objects.get(id=message_id, sender=self.user)
            message.delete()
            return True
        except Message.DoesNotExist:
            return False