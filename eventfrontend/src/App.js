import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './home'; 
import ProfilePage from './profile'; 
import MyActivityPage from './activities'; 
import NearMePage from './nearme';
import { AuthProvider } from './authcontext';

function App() {
  return (
    < AuthProvider >
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/myactivity" element={<MyActivityPage />} />
          <Route path="/near-me" element={<NearMePage />} />
        </Routes>
      </Router>    
    </AuthProvider>

  );
}

export default App;