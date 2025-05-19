from django.db import models
from django.contrib.auth.models import User
from pets.models import Pet


class Like(models.Model):
    petLikeFrom = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='petLikeFrom')
    petLikeTo = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='petLikeTo')

class Sympathy (models.Model):
    pet1 = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='pet1')
    pet2 = models.ForeignKey(Pet, on_delete=models.CASCADE, related_name='pet2')