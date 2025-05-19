from django.urls import path
from .views import find_matches

urlpatterns = [
    path('match/<int:pet_id>/', find_matches, name='find_matches'),
    path('match/<int:pet_id>/like/', find_matches, name='like'),
]