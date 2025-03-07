from django.urls import path
from .views import get_csrf_token, login_page, registration_page, user_exit

urlpatterns = [
    path('csrf-token/', get_csrf_token, name='csrf-token'),
    path('login/', login_page, name='login'),
    path('register/', registration_page, name='register'),
    path('logout/', user_exit, name='logout'),
]
