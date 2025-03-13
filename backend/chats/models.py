from django.db import models
from django.db import models
from users.models import User

class Chat(models.Model):
    user_1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chats1')
    user_2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chats2')
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} at {self.timestamp}"

