import React, { useState, useEffect } from 'react';
import NavBar from './navbar';

function MyActivityPage() {
    const [filter, setFilter] = useState('');
    const [showCreateEventModal, setShowCreateEventModal] = useState(false);
    const [activities, setActivities] = useState([]);
    const itemsToShow = 2; 
    const [currentPosition, setCurrentPosition] = useState(0); 

    useEffect(() => {
        const fetchActivities = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
            try {
                const response = await fetch('http://localhost:8000/api/events/user_organized_events_api/', {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
                if(response.ok) {
                    let data = await response.json();

                    // Sort activities by date in ascending order
                    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    
                    setActivities(data);
                } else {
                    console.error('Failed to fetch activities');
                }
            } catch (error) {
                console.error('Error fetching activities:', error);
            }
        };
        fetchActivities();
    }, []);

    const filteredActivities = activities.filter(activity =>
        activity.name.toLowerCase().includes(filter.toLowerCase())
    );

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const handleNavigation = (direction) => {
        if (direction === 'left' && currentPosition > 0) {
            setCurrentPosition(currentPosition - 1);
        } else if (direction === 'right' && currentPosition < activities.length - itemsToShow) {
            setCurrentPosition(currentPosition + 1);
        }
    };

    const toggleCreateEventModal = () => {
        setShowCreateEventModal(!showCreateEventModal);
    };

    const handleJoinEvent = async (eventId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }
    
        const response = await fetch(`http://localhost:8000/api/events/${eventId}/join/`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
    
        if (response.ok) {
            const updatedActivities = activities.filter(activity => activity.id !== eventId);
            setActivities(updatedActivities);
        } else {
            const errorData = await response.json();
            console.error('Failed to join event:', errorData);
            alert('Failed to join event: ' + errorData.detail);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const token = localStorage.getItem('token');
        const organizerUsername = localStorage.getItem('username');
        
        if (!token) {
            console.error('No token found');
            return;
        }
    
        if (!organizerUsername) {
            console.error('Organizer username not found');
            return;
        }
    

        let organizerId = null;
        try {
            const userResponse = await fetch(`http://localhost:8000/api/profile/${organizerUsername}/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            if(userResponse.ok) {
                const userData = await userResponse.json();
                organizerId = userData.id; 
            } else {
                console.error('Failed to fetch organizer details');
                return;
            }
        } catch (error) {
            console.error('Error fetching organizer details:', error);
            return;
        }

        const isPublic = e.target.is_public.checked;
        
        const eventData = {
            name: e.target.name.value,
            date: e.target.date.value,
            location: e.target.location.value,
            price: e.target.price.value,
            description: e.target.description.value,
            is_public: isPublic,
            organizer: organizerId
        };
        console.log('Event data:', eventData)

    
        try {
            const response = await fetch('http://localhost:8000/api/events/user_events_api/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });
    
            if (response.ok) {
                const newEvent = await response.json();
                console.log('New Event:', newEvent);
                setActivities([...activities, newEvent]);
                setShowCreateEventModal(false);
                await handleJoinEvent(newEvent.id);
            } else {
                const errorData = await response.json();
                console.error('Failed to create event:', errorData);
                alert('Failed to create event: ' + (errorData.detail || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error creating event:', error);
        }
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
        setActivities(prevEvents => prevEvents.filter(event => event.id !== eventId));
      } else {
        console.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Network error', error);
    }
  };


    const hasActivitiesToShow = filteredActivities.length > 0;
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [currentDescription, setCurrentDescription] = useState('');

    const DescriptionModal = ({ description, onClose }) => (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg max-w-lg max-h-full overflow-y-auto" style={{ maxHeight: '100vh' }}>
                <p className="whitespace-pre-wrap text-justify leading-relaxed">{description}</p>
                <button onClick={onClose} className="mt-4 bg-red-400 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">Close</button>
            </div>
        </div>
    );
    
    

    return (
        <>
            <NavBar />
            <div className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 60px)' }}>

                {/* Filter and Create Event Section */}
                <div className="lg:w-1/4 flex flex-col items-center justify-center space-y-8 p-4">
                    <input type="text"  value={filter} onChange={handleFilterChange} className="block py-2.5 px-0 w-72 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0" placeholder="Filter by Name" />
                    <button className="p-2 bg-red-400 hover:bg-red-600 text-white rounded-lg shadow-lg" onClick={toggleCreateEventModal}>Create Event</button>
                </div>
                
                {/* Activities Gallery Section */}
                <div className="lg:w-3/4 flex flex-col items-center justify-center p-4 h-full">
                    <div className="w-full h-full flex items-center justify-center overflow-auto">
                        {hasActivitiesToShow && <button onClick={() => handleNavigation('left')} className="text-6xl text-gray-500 hover:text-gray-600 p-2">{"<"}</button>}
                        <div className="flex justify-center items-center h-full">
                            {hasActivitiesToShow ? (
                                filteredActivities.slice(currentPosition, currentPosition + itemsToShow).map((activity, index) => (
                                    <div key={index} className="w-96 h-96 mx-4 bg-gray-50 border-2 border-red-400 p-4 rounded-lg shadow-2xl flex-none">
                                        <h3 className="text-xl font-bold text-black mb-10">{activity.name} - {activity.is_public ? 'Public' : 'Private'}</h3>
                                        <p className="text-gray-700 mb-1"><span className="font-semibold">Date:</span> {activity.date.split('T')[0]}</p>
                                        <p className="text-gray-700 mb-1"><span className="font-semibold">Location:</span> {activity.location}</p>
                                        <p className="text-gray-700 mb-1"><span className="font-semibold">Price:</span> {activity.price}</p>
                                        <p className="text-gray-700 mb-1"><span className="font-semibold">Organizer:</span> {activity.User.username}</p>
                                        <p className="text-gray-700 mb-1"><span className="font-semibold">My rating:</span> {Number(activity.User.rating).toFixed(2)}</p>
                                        <p className="text-gray-700 mb-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                            <span className="font-semibold" onClick={() => {setCurrentDescription(activity.description); setShowDescriptionModal(true);}}>Description: </span>{activity.description}
                                        </p>
                                        <button 
                                            onClick={() => handleDeleteEvent(activity.description)} 
                                            className="bg-red-400 hover:bg-red-500 text-white rounded-lg shadow-md mt-16 bottom-0 left-0 p-2">
                                            Delete
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center my-10">
                                    <p>No activities at the moment!</p>
                                </div>
                            )}
                        </div>
                        {hasActivitiesToShow && <button onClick={() => handleNavigation('right')} className="text-6xl text-gray-500 hover:text-gray-600 p-2">{">"}</button>}
                        {showDescriptionModal && <DescriptionModal description={currentDescription} onClose={() => setShowDescriptionModal(false)} />}
                    </div>
                </div>
            </div>
            
            {showCreateEventModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                    <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-md">
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">Name:</label>
                                <input type="text" name="name" required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Date:</label>
                                <input type="date" name="date" required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Location:</label>
                                <input type="text" name="location" required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Price:</label>
                                <input type="number" name="price" required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold mb-2">Short Description:</label>
                                <textarea name="description" required className="w-full p-2 border border-gray-300 rounded-lg"></textarea>
                            </div>
                            <div className="col-span-2 flex items-center">
                                <label className="block text-sm font-bold mr-2">Public Event:</label>
                                <input type="checkbox" name="is_public" />
                            </div>
                            <div className="col-span-2 flex justify-between items-center">
                                <button type="submit" className="bg-red-400 hover:bg-red-600 text-white font-bold p-2 rounded-lg">Submit</button>
                                <button onClick={() => setShowCreateEventModal(false)} className="text-gray-500 p-2 hover:text-gray-700">Close</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </>
    );
}

export default MyActivityPage;
