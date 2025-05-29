from django.urls import path
from .views import create_pet, edit_pet, delete_pet, all_pets, get_pet, all_my_pets

urlpatterns = [
    path('create_pet/', create_pet, name='create_pet'),
    path('edit_pet/<int:pet_id>/', edit_pet, name='edit_pet'),
    path('delete_pet/<int:pet_id>/', delete_pet, name='delete_pet'),
    path('all_my_pets/', all_my_pets, name='all_my_pets'),
    path('all_pets/<int:user_id>/', all_pets, name='all_pets'),
    path('get_pet/', get_pet, name='get_pet'),
]