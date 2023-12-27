import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './authcontext';


function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const { setUser } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const loginEndpoint = 'http://localhost:8000/api/login/';
  
    try {
      const response = await fetch(loginEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
      if (response.ok) {
        const { token, username } = data; 
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        setUser({ username, token });
        navigate('/profile');
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Network error', error);
    }
  };
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [location, setLocation] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleRegister = async (event) => {
    event.preventDefault();
  
    const registerEndpoint = 'http://localhost:8000/api/register/';
  
    try {
      const response = await fetch(registerEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username: registerUsername,
          location: location,
          password: registerPassword,
          confirm_password: confirmPassword,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log('Registration successful', data);
  
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
  
        setUser({ username: data.username, token: data.token });
  
        navigate('/profile'); 
      } else {
        console.error('Registration failed', data);

      }
    } catch (error) {
      console.error('Network error', error);

    }
  };
  
  return (
    <div className="flex h-screen">

    {showRegister && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg w-1/2">
                <h2 className="text-2xl mb-10">Create Your Account</h2>
                <form onSubmit={handleRegister} className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-gray-700">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="p-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-gray-700">Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-gray-700">Username</label>
                        <input
                            type="text"
                            value={registerUsername}
                            onChange={(e) => setRegisterUsername(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-gray-700">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-gray-700">Password</label>
                        <input
                            type="password"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <button type="submit" className="col-span-2 bg-red-400 hover:bg-red-600 text-white p-2 mt-6 rounded-3xl">Confirm Registration</button>
                </form>
                <button onClick={() => setShowRegister(false)} className="mt-4 text-gray-500">Close</button>
            </div>
        </div>
    )}


      <div className="flex-1 flex flex-col justify-center items-center bg-red-400">
        <h1 className="text-white text-4xl justify-left">LinkUp</h1>
        <h3 className="text-white">Planning made easier</h3>
      </div>
      <div className="flex-1 flex justify-center items-center">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 border border-gray-300 rounded-xl shadow-2xl"
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 border border-gray-300 rounded-xl shadow-xl"
          />
          <button type="submit" className="bg-red-400 hover:bg-red-600 text-white p-2 rounded-3xl shadow-xl">Login</button>
          <p className="text-sm">
            new here? <button onClick={() => setShowRegister(true)} className="text-red-400">Register here</button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

