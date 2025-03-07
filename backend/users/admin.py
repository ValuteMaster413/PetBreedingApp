from django.contrib import admin
from .models import UserProfile, Review, SubscriptionPlan, Subscription

admin.site.register(UserProfile)
admin.site.register(Review)
admin.site.register(SubscriptionPlan)
admin.site.register(Subscription)