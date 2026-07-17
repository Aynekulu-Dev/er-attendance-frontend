import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const API_BASE_URL = "https://er-attendance-backend.onrender.com";

// --- 1. VOLUNTEER PORTAL ---
function VolunteerPortal() {
  const [volunteerId, setVolunteerId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleAttendance = (action) => {
    if (!volunteerId.trim()) { setStatus({ type: 'error', message: 'እባክህ ID አስገባ!' }); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetch(`${API_BASE_URL}/api/attendance`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            volunteer_id: volunteerId.trim(),
            user_lat: pos.coords.latitude,
            user_lon: pos.coords.longitude,
            action: action
          })
        })
        .then(res => res.json())
        .then(data => {
            if (res.ok) setStatus({ type: 'success', message: data.message });
            else setStatus({ type: 'error', message: data.detail || 'ስህተት ተፈጥሯል' });
        })
        .finally(() => setLoading(false));
      },
      () => { setLoading(false); setStatus({ type: 'error', message: 'GPS ፍቀድ!' }); },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-green-100">
        <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-gray-800">Ethiopia Reads</h1>
            <p className="text-sm text-gray-500">Volunteer Attendance</p>
        </div>
        <input 
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-green-500" 
            placeholder="Volunteer ID" 
            value={volunteerId} 
            onChange={(e) => setVolunteerId(e.target.value)} 
        />
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleAttendance('check-in')} className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-bold shadow-md">Check In</button>
            <button onClick={() => handleAttendance('check-out')} className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg font-bold shadow-md">Check Out</button>
        </div>
        {status.message && <p className={`mt-4 text-center text-sm font-medium ${status.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{status.message}</p>}
      </div>
    </div>
  );
}

// --- 2. ADMIN DASHBOARD ---
function AdminDashboard() {
  const [volunteers, setVolunteers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin/login'); return; }
    
    fetch(`${API_BASE_URL}/api/volunteers`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : navigate('/admin/login'))
      .then(data => setVolunteers(data));

    fetch(`${API_BASE_URL}/api/admin/analytics`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setAnalytics(data));
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <button onClick={() => {localStorage.removeItem('admin_token'); navigate('/admin/login');}} className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold">Logout</button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-6 shadow-md rounded-xl border-l-4 border-green-500">
                <p className="text-gray-500 text-sm">Total Volunteers</p>
                <p className="text-2xl font-black">{analytics?.total_volunteers || 0}</p>
            </div>
            <div className="bg-white p-6 shadow-md rounded-xl border-l-4 border-blue-500">
                <p className="text-gray-500 text-sm">Today's Attendance</p>
                <p className="text-2xl font-black">{analytics?.today_attendance_count || 0}</p>
            </div>
        </div>
        <div className="bg-white p-6 shadow-md rounded-xl">
            <h2 className="font-bold text-lg mb-4">Volunteers List</h2>
            {volunteers.map(v => (
                <div key={v.id} className="border-b py-3 flex justify-between">
                    <span className="font-semibold">{v.full_name}</span>
                    <span className="text-gray-500 text-sm">{v.volunteer_id}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// --- 3. ADMIN LOGIN ---
function AdminLogin() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const login = (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append('username', creds.username);
    formData.append('password', creds.password);

    fetch(`${API_BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.access_token) {
        localStorage.setItem('admin_token', data.access_token);
        navigate('/admin');
      } else alert("የተሳሳተ መረጃ!");
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={login} className="p-8 bg-white shadow-2xl rounded-2xl w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
        <input className="w-full p-3 border rounded-lg mb-4" placeholder="Username" onChange={e => setCreds({...creds, username: e.target.value})} />
        <input className="w-full p-3 border rounded-lg mb-6" type="password" placeholder="Password" onChange={e => setCreds({...creds, password: e.target.value})} />
        <button className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-bold">Login</button>
      </form>
    </div>
  );
}

// --- 4. MAIN APP ---
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VolunteerPortal />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;