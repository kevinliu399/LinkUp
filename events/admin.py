from django.contrib import admin
from .models import Event, UserEvent, Rating

# Register your models here.
admin.site.register(Event)
admin.site.register(UserEvent)
admin.site.register(Rating)