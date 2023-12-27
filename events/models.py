from django.db import models
from users.models import CustomUser

class Event(models.Model):
    name = models.CharField(max_length=200)
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    organizer = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="organized_events")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(default="Placeholder")
    is_public = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Rating(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='event_ratings')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='user_ratings')
    rating = models.PositiveIntegerField(choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')])

    def __str__(self):
        return f"{self.user.username}'s rating for {self.event.name} is {self.rating}"

class UserEvent(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} attended {self.event.name}"
