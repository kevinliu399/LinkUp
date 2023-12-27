from django.urls import path
from . import views

urlpatterns = [
    # ... existing URL patterns ...
    path('api/events/', views.event_list_api, name='event_list_api'),
    path('api/events/<int:event_id>/', views.event_detail_api, name='event_detail_api'),
    path('api/events/<int:event_id>/rate/', views.submit_rating_api, name='submit_rating_api'),
    path('api/events/<int:event_id>/attend/', views.attend_event_api, name='attend_event_api'),
    path('api/public-events/', views.public_event_hub_api, name='public_event_hub_api'),
    path('api/events/<int:event_id>/join/', views.add_to_my_events_api, name='add_to_my_events_api'),
    path('api/events/user_attended_events_api/', views.user_attended_events_api, name='user_attended_events_api'),
    path('api/events/user_organized_events_api/', views.get_user_activities_api, name='get_user_activities_api'),
    path('api/events/user_events_api/', views.create_event_api, name='user_events_api'),
    path('api/events/user_attended_events_api/<int:event_id>/delete/', views.delete_event_api, name='delete_event_api'),
]   