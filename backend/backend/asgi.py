import os
import django
from channels.routing import get_default_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from channels.routing import ProtocolTypeRouter, URLRouter
import chats.routing

application = ProtocolTypeRouter({
    "websocket": URLRouter(
        chats.routing.websocket_urlpatterns
    ),
})
