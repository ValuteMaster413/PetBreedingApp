from datetime import datetime, timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404, render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from .models import UserProfile, Review
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from django.http import JsonResponse
import json

def get_csrf_token(request):
    if request.method == "GET":
        csrf_token = get_token(request)
        return JsonResponse({'csrfToken': csrf_token})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def login_page(request): 
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            login(request, user)
            print(user.id)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def registration_page(request): 
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        phone = data.get('phone')

        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)
        
        user = User.objects.create_user(username=username, password=password, email=email)
        user.save()
        
        user_profile = UserProfile.objects.create(user=user, phone=phone)
        user_profile.save()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def user_exit(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def user_edit(request, user_id):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)
        
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        phone = data.get('phone')

        user = get_object_or_404(User, id=user_id)

        if (User.objects.filter(username=username).exists()) and (user.username != username):
            return JsonResponse({'error': 'Username already exists'}, status=400)

        user.username=username
        user.password=password
        user.email=email
        
        user.save()

        user_profile = get_object_or_404(UserProfile, user=user)
        user_profile.phone=phone

        user_profile.save()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
        
def change_premium_status(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user_id = data.get('user_id')

        user = User.objects.filter(id=user_id).first()
        if not user:
            return JsonResponse({'error': 'User not found'}, status=404)
        
        user_profile = UserProfile.objects.filter(user=user).first()
        if not user_profile:
            return JsonResponse({'error': 'UserProfile not found'}, status=404)
        
        if user_profile.is_premium_active:
            user_profile.is_premium = False
            user_profile.premium_start_date = None
            user_profile.premium_end_date = None
        else:
            now_utc = timezone.now()
            user_profile.is_premium = True
            user_profile.premium_start_date = now_utc
            user_profile.premium_end_date = now_utc + timedelta(days=30)

        user_profile.save()

        return JsonResponse({
            'success': True,
            'is_premium': user_profile.is_premium_active,
            'premium_start_date': user_profile.premium_start_date,
            'premium_end_date': user_profile.premium_end_date
        })
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

def get_premium_status(request):
    data = json.loads(request.body)
    user_id = data.get('user_id')
    user = User.objects.filter(id=user_id).first()

    if not user:
        return JsonResponse({'error': 'User not found'}, status=404)

    user_profile = UserProfile.objects.filter(user=user).first()
    
    if not user_profile:
        return JsonResponse({'error': 'UserProfile not found'}, status=404)
    
    if user_profile.is_premium_active == False:
        user_profile.is_premium = False
        user_profile.save()

    return JsonResponse({
        'is_premium': user_profile.is_premium_active,
        'premium_start_date': user_profile.premium_start_date,
        'premium_end_date': user_profile.premium_end_date
    })

def create_review(request, user_id):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        data = json.loads(request.body)
        rating = data.get('rating')
        comment = data.get('comment')

        review = Review.objects.create(reviewer=request.user, reviewee=User.objects.filter(id=user_id).first(), rating=rating, comment=comment)
        review.save()

        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def edit_review(request, review_id):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        data = json.loads(request.body)
        rating = data.get('rating')
        comment = data.get('comment')

        review = get_object_or_404(Review, id=review_id)

        review.rating=rating
        review.comment=comment

        review.save()
        
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
def delete_review(request, review_id):
    if request.method == "DELETE":
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'User not authenticated'}, status=401)

        review = get_object_or_404(Review, id=review_id)
        
        review.delete()
        
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)


