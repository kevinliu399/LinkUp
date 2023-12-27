from django.urls import path
from .views import user_profile_api, register_api, login_api, edit_user_profile_api

urlpatterns = [
    path('api/profile/<str:username>/', user_profile_api, name='user_profile_api'),
    path('api/register/', register_api, name='register_api'),
    path('api/login/', login_api, name='login_api'),
    path('api/profile/<str:username>/edit/', edit_user_profile_api, name='edit_user_profile_api'),    
]
