from django.urls import path
from .views import get_csrf_token, login_page, registration_page, user_exit, change_premium_status, get_premium_status, user_edit, create_review, edit_review, delete_review, user_info

urlpatterns = [
    path('csrf-token/', get_csrf_token, name='csrf-token'),
    path('login/', login_page, name='login'),
    path('register/', registration_page, name='register'),
    path('logout/', user_exit, name='logout'),
    path('user_edit/<int:user_id>/', user_edit, name='user_edit'),
    path('user_info/', user_info, name='user_info'),
    path('change_premium_status/', change_premium_status, name='change_premium_status'),
    path('get_premium_status/', get_premium_status, name='get_premium_status'),
    path('create_review/<int:user_id>/', create_review, name='create_review'),
    path('edit_review/<int:review_id>/', edit_review, name='edit_review'),
    path('delete_review/<int:review_id>/', delete_review, name='delete_review'),
]
