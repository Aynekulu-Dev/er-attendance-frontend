import React, { useState } from 'react';

const VolunteerPortal = () => {
  const [volunteerId, setVolunteerId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleAttendance = (action) => {
    if (!volunteerId.trim()) return setStatus({ type: 'error', message: 'እባክዎ ID ያስገቡ!' });
    setLoading(true);
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      fetch("https://er-attendance-backend.onrender.com/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteer_id: volunteerId.trim(), user_lat: latitude, user_lon: longitude, action })
      })
      .then(async (res) => {
        const data = await res.json();
        setStatus({ type: res.ok ? 'success' : 'error', message: data.message });
      }).finally(() => setLoading(false));
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-6">Ethiopia Reads Portal</h2>
        <input type="text" placeholder="Volunteer ID" value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)} className="w-full p-3 border rounded-lg mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleAttendance('check-in')} className="bg-green-600 text-white py-3 rounded-lg font-bold">Check In</button>
          <button onClick={() => handleAttendance('check-out')} className="bg-red-600 text-white py-3 rounded-lg font-bold">Check Out</button>
        </div>
        {status.message && <p className="mt-4">{status.message}</p>}
      </div>
    </div>
  );
};
export default VolunteerPortal;