import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function App() {
  const currentPath = window.location.pathname; // URL-ን መለየት
  const [volunteerId, setVolunteerId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // Admin states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(!!localStorage.getItem('admin_token'));
  const [analytics, setAnalytics] = useState(null);
  const [volunteersList, setVolunteersList] = useState([]);

  // 1. Volunteer Page (Check-in/out)
  const renderVolunteerPage = () => (
    <div className="flex flex-col items-center justify-center pt-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border">
        <h1 className="text-2xl font-bold text-center mb-6">Ethiopia Reads</h1>
        <input
          className="w-full p-3 border rounded-lg mb-4"
          placeholder="Volunteer ID (e.g. ER-001)"
          value={volunteerId}
          onChange={(e) => setVolunteerId(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => alert('Check-in Logic')} className="bg-green-600 text-white py-3 rounded-lg">Check In</button>
          <button onClick={() => alert('Check-out Logic')} className="bg-red-600 text-white py-3 rounded-lg">Check Out</button>
        </div>
        {status.message && <p className="mt-4 text-center">{status.message}</p>}
      </div>
    </div>
  );

  // 2. Login Page
  const renderLoginPage = () => (
    <div className="flex flex-col items-center justify-center pt-20">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-bold mb-6 text-center">Admin Login</h2>
        <button 
          onClick={() => { setIsAdminLoggedIn(true); window.history.pushState({}, '', '/er-secret-portal-2026'); window.location.reload(); }}
          className="w-full bg-green-600 text-white py-3 rounded-lg"
        >
          Sign In
        </button>
      </div>
    </div>
  );

  // 3. Admin Portal
  const renderAdminDashboard = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={() => { localStorage.removeItem('admin_token'); window.location.href = '/'; }} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      </div>
      {/* Stats and Table here */}
      <div className="bg-white p-6 rounded-xl shadow">
         <h2 className="text-lg font-bold">Welcome to Admin Portal</h2>
         <p>Manage your volunteers and download reports.</p>
      </div>
    </div>
  );

  // Router logic
  if (currentPath === '/er-secret-portal-2026') {
    return isAdminLoggedIn ? renderAdminDashboard() : renderLoginPage();
  }

  return renderVolunteerPage();
}

export default App;