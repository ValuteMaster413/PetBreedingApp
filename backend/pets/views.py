from datetime import datetime, timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404, render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import Pet, Photo
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from django.http import JsonResponse
import json

def create_pet(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        data = json.loads(request.body)
        species = data.get('species')
        gender = data.get('gender')
        breed = data.get('breed')
        price = data.get('price')
        coat_color = data.get('coat_color')
        age = data.get('age')
        
        pet = Pet.objects.create(
            owner=request.user, 
            species=species, 
            gender=gender, 
            breed=breed, 
            price=price, 
            coat_color=coat_color, 
            age=age
        )

        pet.save()

        files = request.FILES.getlist('photos')

        for photo in files:
            Photo.objects.create(image=photo, pet=pet)

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def edit_pet(request, pet_id):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        pet = get_object_or_404(Pet, id=pet_id)

        data = request.POST
        files = request.FILES.getlist('photos')

        pet.species = data.get('species')
        pet.gender = data.get('gender')
        pet.breed = data.get('breed')
        pet.price = data.get('price')
        pet.coat_color = data.get('coat_color')
        pet.age = data.get('age')
        
        pet.save()

        delete_photos = data.getlist('delete_photo')
        for photo_id in delete_photos:
            photo_to_delete = get_object_or_404(Photo, id=photo_id)
            photo_to_delete.delete()
        
        for file in files:
            Photo.objects.create(pet=pet, image=file)

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def delete_pet(request, pet_id):
    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        pet = get_object_or_404(Pet, id=pet_id)
        pet.delete()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def all_pets(request):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        pets = Pet.objects.filter(owner=request.user)

        pets_list = [{
            'species': pet.species, 
            'gender': pet.gender, 
            'breed': pet.breed, 
            'price': pet.price, 
            'coat_color': pet.coat_color, 
            'age': pet.age,
            'photos': [photo.image.url for photo in pet.photo_set.all()]
        } for pet in pets]
        
        return JsonResponse({'reports': pets_list})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def get_pet(request, pet_id):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        pet = get_object_or_404(Pet, id=pet_id)
        photos = [photo.image.url for photo in pet.photo_set.all()]

        report_data = {
            'species': pet.species, 
            'gender': pet.gender, 
            'breed': pet.breed, 
            'price': pet.price, 
            'coat_color': pet.coat_color, 
            'age': pet.age,
            'photos': photos
        }

        return JsonResponse({'report': report_data})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    