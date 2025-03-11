from django.urls import path
from .views import get_csrf_token, login_page, registration_page, user_exit, change_premium_status, get_premium_status

urlpatterns = [
    path('csrf-token/', get_csrf_token, name='csrf-token'),
    path('login/', login_page, name='login'),
    path('register/', registration_page, name='register'),
    path('logout/', user_exit, name='logout'),
    path('change_premium_status/', change_premium_status, name='change_premium_status'),
    path('get_premium_status/', get_premium_status, name='get_premium_status'),
]
