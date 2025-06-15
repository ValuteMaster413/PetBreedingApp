from django.urls import path
from .views import find_matches, like, likes_from_me, likes_to_me, get_sympathy, get_all_sympathys, dislike

urlpatterns = [
    path('match/<int:pet_id>/', find_matches, name='find_matches'),
    path('like/<int:pet_id_like_from>/<int:pet_id_like_to>/', like, name='like'),
    path('match/<int:pet_id_dislike_from>/dislike/<int:pet_id_dislike_to>/', dislike, name='dislike'),
    path('likes_to_me/<int:pet_id>/', likes_to_me, name='likes_to_me'),
    path('likes_from_me/<int:pet_id>/', likes_from_me, name='likes_from_me'),
    path('sympathy/<int:pet_id>/', get_sympathy, name='get_sympathy'),
    path('sympathys/<int:pet_id>/', get_all_sympathys, name='get_all_sympathys'),
]