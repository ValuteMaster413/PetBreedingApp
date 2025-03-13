from django.urls import path
from .views import all_chats, create_chat, delete_chat, all_messages, create_message, edit_message, delete_message

urlpatterns = [
    path('all_chats/', all_chats, name='all_chats'),
    path('create_chat/<int:user_id>/', create_chat, name='create_chat'),
    path('delete_chat/<int:chat_id>/', delete_chat, name='delete_chat'),
    path('all_messages/<int:chat_id>/', all_messages, name='all_messages'),
    path('create_message/<int:chat_id>/', create_message, name='create_message'),
    path('edit_message/<int:message_id>/', edit_message, name='edit_message'),
    path('delete_message/<int:message_id>/', delete_message, name='delete_message'),
]
