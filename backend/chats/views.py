from datetime import datetime, timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404, render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import Chat, Message
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from django.http import JsonResponse
import json
from django.db.models import Q

def all_chats(request):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        chats = Chat.objects.filter(Q(user_1=request.user) | Q(user_2=request.user))
        
        chat_list = [
            {
                "chat_id": chat.id,
                "user_1": chat.user_1.username,
                "user_2": chat.user_2.username,
                "created_at": chat.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } for chat in chats
        ]

        return JsonResponse({"chats": chat_list})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def create_chat(request, user_id):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        chat = Chat.objects.create(user_1=request.user, user_2=User.objects.filter(id=user_id).first())
        chat.save()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def delete_chat(request, chat_id):
    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        chat = get_object_or_404(Chat, id=chat_id)
        
        chat.delete()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def all_messages(request, chat_id):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        chat = get_object_or_404(Chat, id=chat_id)
        if request.user != chat.user_1 and request.user != chat.user_2:
            return JsonResponse({'error': 'Access denied'}, status=403)

        messages = Message.objects.filter(chat=chat).order_by("timestamp")
        
        message_list = [
            {
                "message_id": msg.id,
                "sender": msg.sender.username,
                "text": msg.text,
                "timestamp": msg.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            } for msg in messages
        ]

        return JsonResponse({"messages": message_list})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def create_message(request, chat_id):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        chat = get_object_or_404(Chat, id=chat_id)
        sender = request.user
        data = json.loads(request.body)
        text = data.get('text')

        message = Message.objects.create(chat=chat, sender=sender, text=text)
        message.save()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def edit_message(request, message_id):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        data = json.loads(request.body)
        text = data.get('text')

        message = get_object_or_404(Message, id=message_id)

        message.text = text

        message.save()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def delete_message(request, message_id):
    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        message = get_object_or_404(Message, id=message_id)
        message.delete()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
