import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function App() {
  const [activeTab, setActiveTab] = useState('user');
  const [volunteerId, setVolunteerId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authToken, setAuthToken] = useState(localStorage.getItem('admin_token') || '');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [team, setTeam] = useState('General');
  const [volunteersList, setVolunteersList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [adminStatus, setAdminStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (authToken) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('admin_token', authToken);
    } else {
      setIsAdminLoggedIn(false);
      localStorage.removeItem('admin_token');
    }
  }, [authToken]);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append('username', adminUsername);
    formData.append('password', adminPassword);

    fetch("https://er-attendance-backend.onrender.com/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    })
    .then(async (res) => {
      const data = await res.json();
      if (res.ok) {
        setAuthToken(data.access_token);
        setAdminStatus({ type: 'success', message: 'Successfully Logged In!' });
      } else {
        setAdminStatus({ type: 'error', message: data.detail || 'Login failed!' });
      }
    });
  };

  const handleAdminLogout = () => {
    setAuthToken('');
    setIsAdminLoggedIn(false);
  };

  const fetchAdminData = () => {
    if (!authToken) return;
    fetch("https://er-attendance-backend.onrender.com/api/volunteers", { headers: { "Authorization": `Bearer ${authToken}` } })
      .then(res => res.json()).then(data => setVolunteersList(data || []));
    
    fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", { headers: { "Authorization": `Bearer ${authToken}` } })
      .then(res => res.json()).then(data => setAnalytics(data));
  };

  useEffect(() => {
    if (activeTab === 'admin' && isAdminLoggedIn) fetchAdminData();
  }, [activeTab, isAdminLoggedIn]);

  const handleAttendance = (action) => {
    if (!volunteerId.trim()) return setStatus({ type: 'error', message: 'Enter Volunteer ID!' });
    setLoading(true);
    navigator.geolocation.getCurrentPosition((position) => {
      fetch("https://er-attendance-backend.onrender.com/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteer_id: volunteerId.trim(), user_lat: position.coords.latitude, user_lon: position.coords.longitude, action: action })
      }).then(res => res.json()).then(data => {
        setStatus({ type: 'success', message: data.message });
        setVolunteerId('');
      }).finally(() => setLoading(false));
    });
  };

  const handleRegisterVolunteer = (e) => {
    e.preventDefault();
    fetch("https://er-attendance-backend.onrender.com/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${authToken}` },
      body: JSON.stringify({ full_name: fullName, phone_number: phone, team: team })
    }).then(() => {
      setAdminStatus({ type: 'success', message: 'Registered!' });
      fetchAdminData();
    });
  };

  const downloadCSV = () => {
    fetch("https://er-attendance-backend.onrender.com/api/admin/export-csv", { headers: { "Authorization": `Bearer ${authToken}` } })
      .then(res => res.blob()).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "attendance.csv";
        a.click();
      });
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-gen");
    const img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(new XMLSerializer().serializeToString(svg));
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.download = "EthiopiaReads_QR.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  return (
    <div className="min-h-screen bg-green-50 p-4">
      <div className="flex justify-center space-x-4 mb-6">
        <button onClick={() => setActiveTab('user')} className="bg-white px-4 py-2 rounded shadow">User</button>
        <button onClick={() => setActiveTab('admin')} className="bg-white px-4 py-2 rounded shadow">Admin</button>
      </div>

      {activeTab === 'user' ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded shadow text-center">
          <input value={volunteerId} onChange={e => setVolunteerId(e.target.value)} className="w-full border p-2 mb-4" placeholder="Volunteer ID" />
          <div className="flex gap-2">
            <button onClick={() => handleAttendance('check-in')} className="bg-green-600 text-white p-2 w-full">Check In</button>
            <button onClick={() => handleAttendance('check-out')} className="bg-red-600 text-white p-2 w-full">Check Out</button>
          </div>
          {status.message && <p className="mt-4">{status.message}</p>}
        </div>
      ) : (
        isAdminLoggedIn ? (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 shadow">Total: {volunteersList.length}</div>
              <button onClick={downloadCSV} className="bg-blue-600 text-white p-2">Export CSV</button>
              <button onClick={handleAdminLogout} className="bg-red-600 text-white p-2">Logout</button>
            </div>
            <div className="bg-white p-6 shadow">
              <QRCodeSVG id="qr-gen" value="https://er-attendance-frontend.onrender.com/" size={150} />
              <button onClick={downloadQRCode} className="mt-4 bg-gray-800 text-white p-2">Download QR</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} className="max-w-xs mx-auto bg-white p-6 shadow">
            <input placeholder="Username" onChange={e => setAdminUsername(e.target.value)} className="w-full border p-2 mb-2" />
            <input type="password" placeholder="Password" onChange={e => setAdminPassword(e.target.value)} className="w-full border p-2 mb-2" />
            <button className="w-full bg-green-600 text-white p-2">Login</button>
          </form>
        )
      )}
    </div>
  );
}
export default App;