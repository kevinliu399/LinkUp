import React, { useState } from 'react';
import { useAuth } from './authcontext';
import { useNavigate } from 'react-router-dom';

function NavBar() {
  const { setUser } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('username'); 
    setUser(null);                  
    navigate('/');                   
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const goToProfile = () => {
    navigate('/profile'); 
  };

  return (
    <div className="flex justify-between items-center bg-gray-100 p-4">
      <div className="text-xl font-bold">
        Link<span className="text-red-400">Up</span>
      </div>
      <div className="space-x-32">
        <a href="/myactivity" className="hover:text-red-400">.myactivity</a>
        <a href="/near-me" className="hover:text-red-400">.near-me</a>
      </div>
      <div className="text-lg relative">
        <div onClick={toggleDropdown} className="cursor-pointer hover:text-red-400">
          {username}
          {showDropdown && (
            <div className="absolute bg-white border mt-2 p-2 right-0 z-50">
              <button onClick={goToProfile} className="text-gray-500 hover:text-gray-800 block w-full text-left p-2">Profile</button>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-600 block w-full text-left p-2">Logout</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavBar;
