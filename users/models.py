from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Avg


class CustomUser(AbstractUser):
    location = models.CharField(max_length=100, blank=True)
    interest = models.TextField(blank=True)
    rating = models.FloatField(default=0)

    class Meta:
        db_table = 'custom_user'

    def get_organizer_rating(self):
        average_rating = self.ratings.aggregate(Avg('rating'))['rating__avg']
        return average_rating if average_rating is not None else 0 
    

