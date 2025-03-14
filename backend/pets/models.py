from django.db import models
from django.contrib.auth.models import User

gender_choices=[
    ('male', 'male'), 
    ('female', 'female')
]

class Pet(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    species = models.CharField(max_length=100)
    gender = models.CharField(max_length=10, choices=gender_choices)
    breed = models.CharField(max_length=100, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    coat_color = models.CharField(max_length=50, blank=True, null=True)
    age = models.PositiveIntegerField(help_text="age in months")

class Photo(models.Model):
    image = models.ImageField(upload_to='pet_photos/')
    pet = models.ForeignKey(Pet, on_delete=models.CASCADE)