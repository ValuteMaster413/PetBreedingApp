from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from pets.models import Pet

def find_matches(request, pet_id):
    pet = get_object_or_404(Pet, id=pet_id)
    
    matches = Pet.objects.filter(species=pet.species)

    opposite_gender = 'male' if pet.gender == 'female' else 'female'
    matches = matches.filter(gender=opposite_gender)

    min_age = max(0, pet.age - 6)
    max_age = pet.age + 6
    matches = matches.filter(age__gte=min_age, age__lte=max_age)

    if pet.breed:
        matches = matches.filter(breed=pet.breed)

    if pet.coat_color:
        matches = matches.filter(coat_color=pet.coat_color)

    if pet.price:
        matches = matches.filter(price__lte=pet.price)

    results = [{
        "id": match.id,
        "species": match.species,
        "gender": match.gender,
        "breed": match.breed,
        "price": match.price,
        "coat_color": match.coat_color,
        "age": match.age,
        "photos": [photo.image.url for photo in match.photo_set.all()]
    } for match in matches]

    return JsonResponse({"matches": results})
