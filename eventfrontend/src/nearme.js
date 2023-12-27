import React, { useState, useEffect } from 'react';
import NavBar from './navbar';
import { Range } from 'react-range';

function NearMePage() {
    const [activities, setActivities] = useState([]);
    const [filters, setFilters] = useState({
        name: '',
        startDate: '',
        endDate: '',
        location: '',
        minPrice: 0,
        maxPrice: 100,
        minRating: 0,
    });
    const [currentPosition, setCurrentPosition] = useState(0);
    const itemsToShow = 2; 
    const localUsername = localStorage.getItem('username');
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(1000);
    const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);

    useEffect(() => {
        const fetchPublicEvents = async () => {
            const token = localStorage.getItem('token');
    
            if (!token) {
                console.error('No token found');
                return;
            }
    
            const response = await fetch('http://localhost:8000/api/public-events/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.ok) {
                const events = await response.json();
                let filteredEvents = events;

                console.log(localUsername)
                
                filteredEvents = events.filter(event => event.User.username !== localUsername);

                const prices = events.map(event => event.price);
                setMinPrice(Math.min(...prices));
                setMaxPrice(Math.max(...prices));
                setPriceRange([Math.min(...prices), Math.max(...prices)]);
                setActivities(filteredEvents);

            } else {
                console.error('Failed to fetch public events');
            }
        };
    
        fetchPublicEvents();
    }, []);

    const handleFilterChange = (e) => {
        setFilters(filters => ({ ...filters, [e.target.name]: e.target.value }));
        setCurrentPosition(0);
    };

    const handlePriceChange = (values) => {
        setPriceRange(values);
        setFilters({ ...filters, minPrice: values[0], maxPrice: values[1] });
    };

    const filteredActivities = activities.filter(activity => {
        const nameMatches = activity.name.toLowerCase().includes(filters.name.toLowerCase());
        let dateMatches = true;
        let locationMatches = activity.location.toLowerCase().includes(filters.location.toLowerCase());
        let priceMatches = activity.price >= filters.minPrice && activity.price <= filters.maxPrice;
        let ratingMatches = activity.User.rating >= filters.minRating;
    
        if (filters.startDate && filters.endDate) {
            const eventDate = new Date(activity.date);
            const start = new Date(filters.startDate);
            const end = new Date(filters.endDate);
    
            dateMatches = eventDate >= start && eventDate <= end;
        }
    
        return nameMatches && dateMatches && locationMatches && priceMatches && ratingMatches;
    });

    const handleNavigation = (direction) => {
        if (direction === 'left' && currentPosition > 0) {
            setCurrentPosition(currentPosition - 1);
        } else if (direction === 'right' && currentPosition < activities.length - itemsToShow) {
            setCurrentPosition(currentPosition + 1);
        }
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
            alert('Successfully joined the event');
            const updatedActivities = activities.filter(activity => activity.id !== eventId);
            setActivities(updatedActivities);
        } else {
            console.error('Failed to join event');
            alert('Failed to join event. Please try again.');
        }
    };

    const hasActivitiesToShow = filteredActivities.length > 0;

    return (
        <>
            <NavBar />
            <div className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 60px)' }}>
                <div className="flex-2 flex flex-col items-center justify-center space-y-4 p-4 bg-gray-100">
                    <p className="text-2xl font-bold">Filter Activities</p>

                    {/* Filter Section */}
                    <input type="text" name="name" placeholder="Filter by Name" value={filters.name} onChange={handleFilterChange} className="block py-2.5 px-0 w-60 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0"/>
                    <input type="text" name="location" placeholder="Filter by Location" value={filters.location} onChange={handleFilterChange} className="block py-2.5 px-0 w-60 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0"/>
                    <div className="flex flex-col items-center">
                        <label className="mb-2">
                            From:<br/>
                            <input type="date" name="startDate" placeholder="From Date" value={filters.startDate} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-lg" />
                        </label>
                        <label className="mb-2">
                            To:<br/>
                            <input type="date" name="endDate" placeholder="To Date" value={filters.endDate} onChange={handleFilterChange} className="p-2 border border-gray-300 rounded-lg" />
                        </label>
                    </div>
                    
                    <div className="w-full px-4 py-2">
                        <Range
                            step={1}
                            min={minPrice}
                            max={maxPrice}
                            values={priceRange}
                            onChange={handlePriceChange}
                            renderTrack={({ props, children }) => (
                                <div {...props} style={{...props.style, height: '4px', width: '100%', backgroundColor: '#f87171'}}>{children}</div>
                            )}
                            renderThumb={({ props }) => (
                                <div {...props} style={{...props.style, height: '10px', width: '10px', backgroundColor: '#f87171', borderRadius: '50%', display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',}} />
                            )}
                        />
                        <div>Price: {priceRange[0]} to {priceRange[1]}</div>
                    </div>

                    <label className="w-full px-4">
                        Minimum Rating:
                        <input 
                            type="range" 
                            name="minRating" 
                            min="1" 
                            max="5" 
                            value={filters.minRating} 
                            onChange={handleFilterChange} 
                            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                            style={{
                                background: 'linear-gradient(to right, #f87171 0%, #f87171 ' + (filters.minRating - 1) * 25 + '%, #e5e7eb ' + (filters.minRating - 1) * 25 + '%, #e5e7eb 100%)',
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
                                }

                                input[type='range']:active::-webkit-slider-thumb {
                                    cursor: grabbing;
                                }

                                input[type='range']::-moz-range-thumb {
                                    width: 10px;
                                    height: 10px;
                                    background: #f87171;
                                    border-radius: 50%;
                                    cursor: grab;
                                }

                                input[type='range']:active::-moz-range-thumb {
                                    cursor: grabbing;
                                }
                            `}
                        </style>
                    </label>
                </div>
                
                <div className="flex-1 relative">
                    <div className="w-full h-full flex items-center justify-center">
                        {hasActivitiesToShow &&  <button onClick={() => handleNavigation('left')} className="text-6xl text-gray-500 hover:text-gray-600 p-2">{"<"}</button>}

                            <div className="flex justify-center items-center">
                                {hasActivitiesToShow ? (
                                    filteredActivities.slice(currentPosition, currentPosition + itemsToShow).map((activity, index) => (
                                        <div key={index} className="w-96 h-96 mx-4 bg-gray-50 border-2 border-red-400 p-4 rounded-lg shadow-2xl flex-none relative ">
                                            <h3 className="text-lg font-bold mb-10">{activity.name}</h3>
                                            <p className="text-gray-700 mb-1"><span className="font-semibold">Date:</span> {activity.date.split('T')[0]}</p>
                                            <p className="text-gray-700 mb-1"><span className="font-semibold">Location:</span> {activity.location}</p>
                                            <p className="text-gray-700 mb-1"><span className="font-semibold">Price:</span> {activity.price}</p>
                                            <p className="text-gray-700 mb-1"><span className="font-semibold">Organizer:</span> {activity.User.username}</p>
                                            <p className="text-gray-700 mb-1"><span className="font-semibold">{activity.User.username}'s rating:</span> {Number(activity.User.rating).toFixed(2)}</p>
                                            <p className="text-gray-700 mb-1"><span className="font-semibold">Description:</span> {activity.description}</p>
                                            <button 
                                                onClick={() => handleJoinEvent(activity.id)} 
                                                className="bg-red-400 hover:bg-red-500 text-white rounded-lg shadow-md p-2 absolute bottom-0 left-0 m-4">
                                                Join
                                            </button>
                                        </div>
                                ))
                            ) : (
                                <div className="text-center my-10">
                                    <p>No activities at the moment!</p>
                                </div>
                            )}
                        </div>
                        {hasActivitiesToShow &&  <button onClick={() => handleNavigation('right')} className="text-6xl text-gray-500 hover:text-gray-600 p-2">{">"}</button>}
                    </div>
                </div>
            </div>
        </>
    );
}
    
export default NearMePage;


