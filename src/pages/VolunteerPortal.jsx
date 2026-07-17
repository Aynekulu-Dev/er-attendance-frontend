import React, { useState } from 'react';

const VolunteerPortal = () => {
  const [volunteerId, setVolunteerId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleAttendance = (action) => {
    if (!volunteerId.trim()) return setStatus({ type: 'error', message: 'Please enter your Volunteer ID!' });
    
    setLoading(true);
    setStatus({ type: '', message: 'Checking location...' });

    // 1. የGPS ትክክለኛነት ለመጨመር options
    const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // 2. ወደ Backend መላኪያ
        fetch("https://er-attendance-backend.onrender.com/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            volunteer_id: volunteerId.trim(), 
            user_lat: position.coords.latitude, 
            user_lon: position.coords.longitude, 
            action 
          })
        })
        .then(async (res) => {
          const data = await res.json();
          
          // 3. የBackend ምላሽ (status) መፈተሽ
          if (data.status === 'success') {
            setStatus({ type: 'success', message: `${action.toUpperCase()} successful!` });
            setVolunteerId(''); // ስኬታማ ከሆነ ID-ውን ያጸዳዋል
          } else {
            // Backend የሚልክልን error መልእክት (ለምሳሌ ርቀት፣ anti-cheat)
            setStatus({ type: 'error', message: data.message });
          }
        })
        .catch(() => setStatus({ type: 'error', message: 'Server connection failed!' }))
        .finally(() => setLoading(false));
      },
      (error) => {
        setLoading(false);
        setStatus({ type: 'error', message: 'Location access is required for attendance!' });
      },
      options
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Ethiopia Reads Portal</h2>
        
        <input 
          type="text" 
          placeholder="Volunteer ID" 
          value={volunteerId} 
          onChange={(e) => setVolunteerId(e.target.value)} 
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500 outline-none" 
        />
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            disabled={loading}
            onClick={() => handleAttendance('check-in')} 
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Check In'}
          </button>
          <button 
            disabled={loading}
            onClick={() => handleAttendance('check-out')} 
            className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Check Out'}
          </button>
        </div>

        {status.message && (
          <p className={`mt-4 text-sm font-medium ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default VolunteerPortal;