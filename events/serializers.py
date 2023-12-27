from rest_framework import serializers
from .models import Event, Rating
from django.db.models import Avg
from users.serializers import CustomUserSerializer

class EventSerializer(serializers.ModelSerializer):
    User = CustomUserSerializer(source='organizer', read_only=True)

    class Meta:
        model = Event
        fields = '__all__'

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['rating', 'event', 'user']
        read_only_fields = ['event', 'user']

    def save(self, **kwargs):
        event_id = kwargs.get('event_id')
        user = kwargs.get('user')
        rating_value = self.validated_data['rating']



        # Create and save the rating
        rating = Rating(event_id=event_id, user=user, rating=rating_value)
        rating.save()



        # Recalculate and update the organizer rating
        event = Event.objects.get(id=event_id)
        organizer = event.organizer

        new_avg_rating = Rating.objects.filter(event__organizer=organizer).aggregate(Avg('rating'))['rating__avg'] or 0.0
        organizer.rating = new_avg_rating
        organizer.save()

        return rating
