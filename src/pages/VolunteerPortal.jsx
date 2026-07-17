import React, { useState } from 'react';

const VolunteerPortal = () => {
  const [volunteerId, setVolunteerId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleAttendance = (action) => {
    if (!volunteerId.trim()) return setStatus({ type: 'error', message: 'እባክዎ ID ያስገቡ!' });
    setLoading(true);
    
    // የሎኬሽን ሎጂክህ እዚህ ይቀጥላል
    navigator.geolocation.getCurrentPosition((position) => {
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
        setStatus({ type: res.ok ? 'success' : 'error', message: data.message });
        if (res.ok) setVolunteerId(''); // ከተሳካ ID ሳጥኑን ባዶ ያደርገዋል
      })
      .catch(() => setStatus({ type: 'error', message: 'ግንኙነት ተቋርጧል!' }))
      .finally(() => setLoading(false));
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* የምስሉ ዲዛይን የሚመስል ካርድ */}
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
            onClick={() => handleAttendance('check-in')} 
            className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition"
          >
            Check In
          </button>
          <button 
            onClick={() => handleAttendance('check-out')} 
            className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition"
          >
            Check Out
          </button>
        </div>

        {/* የStatus መልእክት */}
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