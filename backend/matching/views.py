from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from pets.models import Pet
from .models import Like, Sympathy, Dislike
from django.db.models import Q

def find_matches(request, pet_id):
    pet = get_object_or_404(Pet, id=pet_id)
    
    liked_pet_ids = Like.objects.filter(petLikeFrom=pet).values_list('petLikeTo__id', flat=True)
    disliked_pet_ids = Dislike.objects.filter(petDislikeFrom=pet).values_list('petDislikeTo__id', flat=True)

    matches = Pet.objects.filter(species=pet.species)

    opposite_gender = 'male' if pet.gender == 'female' else 'female'
    matches = matches.filter(gender=opposite_gender)

    min_age = max(0, pet.age - 6)
    max_age = pet.age + 6
    matches = matches.filter(age__gte=min_age, age__lte=max_age)

    if pet.breed:
        matches = matches.filter(breed=pet.breed)

    matches = matches.exclude(id__in=liked_pet_ids)
    matches = matches.exclude(id__in=disliked_pet_ids)

    results = [{
        "id": match.id,
        "coat_color": match.coat_color,
        "species": match.species,
        "gender": match.gender,
        "breed": match.breed,
        "price": match.price,
        "age": match.age,
        "photos": [photo.image.url for photo in match.photo_set.all()]
    } for match in matches]

    return JsonResponse({"matches": results})

def like(request, pet_id_like_from,pet_id_like_to):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        pet_from = get_object_or_404(Pet, id=pet_id_like_from)
        pet_to = get_object_or_404(Pet, id=pet_id_like_to)

        if Like.objects.filter(petLikeFrom=pet_from, petLikeTo=pet_to).exists():
            return JsonResponse({'success': False, 'message': 'Like already exists'})

        like = Like.objects.create(petLikeFrom=pet_from, petLikeTo=pet_to)

        like.save()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def likes_to_me(request, pet_id):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        likes = Like.objects.filter(petLikeTo = pet_id)
        data = [{'from': like.petLikeFrom.id} for like in likes]

        return JsonResponse({"likes_to_me": data})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def likes_from_me(request, pet_id):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        likes = Like.objects.filter(petLikeFrom = pet_id)
        data = [{'to': like.petLikeTo.id} for like in likes]

        return JsonResponse({"likes_from_me": data})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def dislike(request, pet_id_dislike_from, pet_id_dislike_to):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        pet_from = get_object_or_404(Pet, id=pet_id_dislike_from)
        pet_to = get_object_or_404(Pet, id=pet_id_dislike_to)

        if Dislike.objects.filter(petDislikeFrom=pet_from, petDislikeTo=pet_to).exists():
            return JsonResponse({'success': False, 'message': 'Dislike already exists'})

        dislike = Dislike.objects.create(petDislikeFrom=pet_from, petDislikeTo=pet_to)
        dislike.save()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def get_sympathy(request, pet_id):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        pet = get_object_or_404(Pet, id=pet_id)

        likes_from = Like.objects.filter(petLikeFrom=pet)

        for like in likes_from:
            if Like.objects.filter(petLikeFrom=like.petLikeTo, petLikeTo=pet).exists():
                pet1, pet2 = sorted([pet.id, like.petLikeTo.id])
                if not Sympathy.objects.filter(pet1_id=pet1, pet2_id=pet2).exists():
                    Sympathy.objects.create(pet1_id=pet1, pet2_id=pet2)

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    
def get_all_sympathys(request, pet_id):
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        sympathys = Sympathy.objects.filter(Q(pet1_id=pet_id) | Q(pet2_id=pet_id))
        
        data = [{'pet1': s.pet1.id, 'pet2': s.pet2.id} for s in sympathys]

        return JsonResponse({"sympathys": data})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
