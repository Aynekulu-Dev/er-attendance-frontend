import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function App() {
  const [volunteerId, setVolunteerId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  // --- ADMIN STATES ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authToken, setAuthToken] = useState(localStorage.getItem('admin_token') || '');
  const [volunteersList, setVolunteersList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [adminStatus, setAdminStatus] = useState({ type: '', message: '' });

  // እባክህ ይህንን ወደ Render Backend ሊንክ ቀይረው
  const API_BASE = "https://er-attendance-backend.onrender.com";

  // አድሚን መሆኑን ለማወቅ URL ቼክ ማድረግ
  const isAdminPage = window.location.pathname === '/admin';

  useEffect(() => {
    if (authToken) setIsAdminLoggedIn(true);
  }, [authToken]);

  // 1. ቮለንቲየር ATTENDANCE
  const handleAttendance = (action) => {
    if (!volunteerId.trim()) return setStatus({ type: 'error', message: 'ID አስገባ' });
    setLoading(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      fetch(`${API_BASE}/api/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          volunteer_id: volunteerId.trim(), 
          user_lat: pos.coords.latitude, 
          user_lon: pos.coords.longitude, 
          action 
        })
      })
      .then(async res => {
        const data = await res.json();
        if (res.ok) { setStatus({ type: 'success', message: data.message }); setVolunteerId(''); }
        else setStatus({ type: 'error', message: data.detail });
      }).finally(() => setLoading(false));
    }, () => { setLoading(false); setStatus({ type: 'error', message: 'GPS ፍቀድ' }); });
  };

  // 2. አድሚን ተግባራት
  const handleAdminLogin = (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append('username', adminUsername);
    formData.append('password', adminPassword);
    fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    })
    .then(async res => {
      if (res.ok) {
        const data = await res.json();
        setAuthToken(data.access_token);
        localStorage.setItem('admin_token', data.access_token);
        setIsAdminLoggedIn(true);
      } else setAdminStatus({ type: 'error', message: 'ስህተት' });
    });
  };

  useEffect(() => {
    if (isAdminPage && isAdminLoggedIn) {
      fetch(`${API_BASE}/api/volunteers`, { headers: { "Authorization": `Bearer ${authToken}` } })
        .then(res => res.json()).then(setVolunteersList);
      fetch(`${API_BASE}/api/admin/analytics`, { headers: { "Authorization": `Bearer ${authToken}` } })
        .then(res => res.json()).then(setAnalytics);
    }
  }, [isAdminPage, isAdminLoggedIn]);

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Dashboard Page */}
      {isAdminPage ? (
        !isAdminLoggedIn ? (
          <div className="flex justify-center pt-20">
            <form onSubmit={handleAdminLogin} className="bg-white p-8 shadow rounded">
              <h2 className="mb-4 font-bold">Admin Login</h2>
              <input type="text" placeholder="Username" onChange={e => setAdminUsername(e.target.value)} className="border p-2 w-full mb-2"/>
              <input type="password" placeholder="Password" onChange={e => setAdminPassword(e.target.value)} className="border p-2 w-full mb-2"/>
              <button className="bg-blue-600 text-white w-full py-2">Login</button>
            </form>
          </div>
        ) : (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <div className="flex gap-10">
               <div>
                  <p>ጠቅላላ ቮለንቲየሮች: {analytics?.total_volunteers || 0}</p>
                  <h3 className="mt-4 font-bold">ዝርዝር፡</h3>
                  {volunteersList.map(v => <p key={v.id}>{v.full_name} ({v.volunteer_id})</p>)}
               </div>
               <div className="border p-4">
                  <QRCodeSVG value="https://er-attendance-frontend.onrender.com" size={150} />
                  <p className="text-xs mt-2">ይህንን QR ኮድ አትም</p>
               </div>
            </div>
          </div>
        )
      ) : (
        /* Volunteer Public Page */
        <div className="flex flex-col items-center pt-20">
          <h1 className="text-2xl font-bold mb-6">Ethiopia Reads</h1>
          <input className="border p-3 rounded w-64 mb-4" placeholder="ID (ለምሳሌ ER-001)" value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)} />
          <div className="space-x-4">
            <button onClick={() => handleAttendance('check-in')} className="bg-green-600 text-white py-2 px-6 rounded">Check In</button>
            <button onClick={() => handleAttendance('check-out')} className="bg-red-600 text-white py-2 px-6 rounded">Check Out</button>
          </div>
          {status.message && <p className="mt-6 text-sm">{status.message}</p>}
        </div>
      )}
    </div>
  );
}

export default App;