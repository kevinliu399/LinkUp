import React, { useState, useEffect } from 'react';
import NavBar from './navbar';

function EventDetailModal({ event, onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
      <div className="bg-white p-10 rounded-lg w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4">
        <h2 className="text-2xl font-bold mb-6">{event.name}</h2>
        <p className="mb-2"><strong>Date:</strong> {event.date.split('T')[0]}</p>
        <p className="mb-2"><strong>Location:</strong> {event.location}</p>
        <p className="mb-2"><strong>Price:</strong> {event.price}</p>
        <p className="mb-4"><strong>Description:</strong> {event.description}</p>
        <button onClick={onClose} className="bg-red-400 hover:bg-red-600 text-white font-semibold p-2 rounded-lg shadow-lg">Close</button>
      </div>
    </div>
  );
}

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editableUser, setEditableUser] = useState({
    first_name: '',
    last_name: '',
    location: '',
  });
  const [submittedRatings, setSubmittedRatings] = useState({});
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [ratings, setRatings] = useState(() => {
    const initialRatings = {};
    events.forEach(event => {
      initialRatings[event.id] = event.initialRating || 1;
    });
    return initialRatings;
  });
  
  useEffect(() => {
    if (user) {
      setEditableUser({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        location: user.location || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const username = localStorage.getItem('username');
        const response = await fetch(`http://localhost:8000/api/profile/${username}/`);
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    const fetchEventsData = async () => {
      const token = localStorage.getItem('token');
      const eventsEndpoint = 'http://localhost:8000/api/events/user_attended_events_api/';
      try {
        const response = await fetch(eventsEndpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          data.sort((a, b) => new Date(a.date) - new Date(b.date));
          setEvents(data); 
        } else {
          console.error('Events fetch failed');
        }
      } catch (error) {
        console.error('Network error', error);
      }
    };

    
    fetchUserData();
    fetchEventsData();
    const loadedSubmittedRatings = JSON.parse(localStorage.getItem('submittedRatings') || '{}');
    setSubmittedRatings(loadedSubmittedRatings);
  }, []);

  const handleUserEdit = async () => {
    const token = localStorage.getItem('token');
    const username = user?.username || localStorage.getItem('username');
  
    const editData = {
      first_name: editableUser.first_name,
      last_name: editableUser.last_name,
      location: editableUser.location,
    };
  
    if (!username) {
      console.error('Username is undefined');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8000/api/profile/${username}/edit/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(editData),
      });
  
      if (response.ok) {

        const updatedUser = await response.json();
        setUser(updatedUser);
      } else {
        console.error('Profile update failed', await response.text());
      }
    } catch (error) {
      console.error('Network error', error);
    }
  };
  

  const handleEventClick = async (eventId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/events/${eventId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
      });
  
      if (response.ok) {
        const data = await response.json();
        setSelectedEvent(data);
        setShowModal(true);
      } else {
        console.error('Event fetch failed');

      }
    } catch (error) {
      console.error('Network error', error);

    }
  };

  const handleEventRatingChange = (eventId, newRating) => {
    setRatings(prevRatings => ({
      ...prevRatings,
      [eventId]: newRating
    }));
  };

  const handleDeleteEvent = async (eventId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8000/api/events/user_attended_events_api/${eventId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
      });
  
      if (response.ok) {

        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
      } else {
        console.error('Failed to delete event');

      }
    } catch (error) {
      console.error('Network error', error);

    }
  };

  const handleEventRatingSubmit = async (eventId) => {
    const rating = ratings[eventId] || 1;
    const ratingEndpoint = `http://localhost:8000/api/events/${eventId}/rate/`;
    const token = localStorage.getItem('token');
    console.log("Sending rating data:", { rating });
  
    try {
      const response = await fetch(ratingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ rating }),
      });
  
      if (response.ok) {
        const newSubmittedRatings = { ...submittedRatings, [eventId]: true };
        setSubmittedRatings(newSubmittedRatings);
        localStorage.setItem('submittedRatings', JSON.stringify(newSubmittedRatings));
      } else {

        console.error('Rating submission failed');
      }
    } catch (error) {
      console.error('Network error', error);
    }
  };
  
  
 return (
    <div>
      <NavBar />
      <div className="flex" style={{ height: 'calc(100vh - 60px)' }}>

        <div className="flex-1 p-4 flex flex-col justify-center items-center rounded-lg mx-2">
          <h2 className="text-3xl font-bold mb-6 text-left">{user?.username}'s Profile</h2>
          <div className="edit-section w-1/2">
            <div className="flex flex-col mb-4">
              <label className="font-semibold mb-1 text-left">First Name: </label>
              <input type="text" value={editableUser.first_name} onChange={e => setEditableUser({...editableUser, first_name: e.target.value})} className="border border-gray-300 p-2 rounded-lg shadow-lg mb-3" />
              <label className="font-semibold mb-1 text-left">Last Name: </label>
              <input type="text" value={editableUser.last_name} onChange={e => setEditableUser({...editableUser, last_name: e.target.value})} className="border border-gray-300 p-2 rounded-lg shadow-lg mb-3" />
              <label className="font-semibold mb-1 text-left">Location: </label>
              <input type="text" value={editableUser.location} onChange={e => setEditableUser({...editableUser, location: e.target.value})} className="border border-gray-300 p-2 rounded-lg shadow-lg mb-3" />
            </div>
            <div className="flex justify-center">
              <button onClick={handleUserEdit} className="bg-red-400 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-lg shadow-lg">Edit</button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 border rounded-2xl shadow-md">
          <h2 className="text-xl text-center mt-2 font-bold">Attended Events</h2>
          {events.length > 0 ? (
            <div className="event-list mt-4 overflow-auto rounded-lg" style={{ height: '680px' }}>
              {events.map(event => (
                <div key={event.id} className="event-card bg-white p-4 border rounded-2xl shadow-md my-2 flex items-center justify-between" style={{ height: '100px' }}>
                  <span className="block truncate w-1/3 cursor-pointer" onClick={() => handleEventClick(event.id)}>
                    {event.name}
                  </span>
                  {!submittedRatings[event.id] ? (
                    <div className="flex items-center w-2/3 justify-between">
                      <label className="flex-1 mx-2">
                        <input 
                          type="range"
                          min="1"
                          max="5"
                          value={ratings[event.id] || 1}
                          onChange={(e) => handleEventRatingChange(event.id, e.target.value)}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: 'linear-gradient(to right, #f87171 0%, #f87171 ' + ((ratings[event.id] || 1) - 1) * 25 + '%, #e5e7eb ' + ((ratings[event.id] || 1) - 1) * 25 + '%, #e5e7eb 100%)',
                            WebkitAppearance: 'none'
                          }} 
                        />   
                        <style>
                          {`
                            input[type='range']::-webkit-slider-thumb {
                              -webkit-appearance: none;
                              appearance: none;
                              width: 15px;
                              height: 15px;
                              background: #f87171;
                              border-radius: 50%;
                              cursor: grab;
                            
                            input[type='range']:active::-webkit-slider-thumb {
                              cursor: grabbing;
                            
                            input[type='range']::-moz-range-thumb {
                              width: 10px;
                              height: 10px;
                              background: #f87171;
                              border-radius: 50%;
                              cursor: grab;
                            
                            input[type='range']:active::-moz-range-thumb {
                              cursor: grabbing;
                            }
                          `}
                        </style>
                      </label>
              
                      <span className="text-red-400 mx-2">{ratings[event.id] || 1}</span>
                      <button onClick={() => handleEventRatingSubmit(event.id)} className="bg-red-400 text-white p-2 rounded-2xl shadow-xl hover:bg-red-600 mx-2">
                        Submit
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="text-gray-600 cursor-pointer" 
                      onMouseEnter={() => setHoveredEventId(event.id)}
                      onMouseLeave={() => setHoveredEventId(null)}
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      {hoveredEventId === event.id ? "Delete" : 'Rated'}
                    </div>
                  )}
                </div>
              ))}
    
            </div>
          ) : (
            <div className="text-center justify-center mt-60">
              <h3 className="text-lg font-semibold">LinkUp!</h3>
              <p>No attended events yet.</p>
            </div>
          )}
        </div>
      </div>
      {showModal && selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}


    export default ProfilePage;


