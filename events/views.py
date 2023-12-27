from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Event, UserEvent
from .serializers import EventSerializer, RatingSerializer
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import F
from django.db.models import Avg

@api_view(['GET'])
def event_list_api(request):
    events = Event.objects.all()
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def event_detail_api(request, event_id):
    event = get_object_or_404(Event, pk=event_id)
    serializer = EventSerializer(event)
    return Response(serializer.data)


@api_view(['POST'])
def submit_rating_api(request, event_id):
    user = request.user
    data = request.data
    data['event'] = event_id
    data['user'] = user.id

    serializer = RatingSerializer(data=data)

    if serializer.is_valid():
        serializer.save(event_id=event_id, user=user)
        return Response(serializer.data, status=201)
    else:
        return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def attend_event_api(request, event_id):
    try:
        event = Event.objects.get(pk=event_id)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

    # Check if the user has already attended the event
    if UserEvent.objects.filter(user=request.user, event=event).exists():
        return Response({'error': 'User already attending this event'}, status=status.HTTP_400_BAD_REQUEST)

    user_event = UserEvent(user=request.user, event=event)
    user_event.save()
    return Response({'message': 'Successfully attending the event'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def public_event_hub_api(request):
    public_events = Event.objects.filter(is_public=True)
    serializer = EventSerializer(public_events, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_my_events_api(request, event_id):
    event = get_object_or_404(Event, pk=event_id)

    # Check if the user has already joined the event
    user_event, created = UserEvent.objects.get_or_create(user=request.user, event=event)

    if created:
        return Response({'message': 'You have successfully joined the event.'}, status=status.HTTP_201_CREATED)
    else:
        return Response({'message': 'You have already joined this event.'}, status=status.HTTP_200_OK)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_attended_events_api(request):
    # Fetch UserEvent instances for the logged-in user and annotate them with the event's date
    user_events = UserEvent.objects.filter(user=request.user).annotate(event_date=F('event__date')).order_by('-event_date')

    # Extract the Event instances
    events = [user_event.event for user_event in user_events]
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_activities_api(request):
    user = request.user
    events = Event.objects.filter(organizer=user).order_by('-date')
    serializer = EventSerializer(events, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_event_api(request):
    serializer = EventSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(organizer=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_event_api(request, event_id):
    event = get_object_or_404(Event, pk=event_id)
    event.delete()
    return Response({'message': 'Event deleted successfully'}, status=status.HTTP_204_NO_CONTENT)