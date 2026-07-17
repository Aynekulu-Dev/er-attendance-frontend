import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem('admin_token') || '');
  const [analytics, setAnalytics] = useState(null);
  const [volunteersList, setVolunteersList] = useState([]);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const fetchAdminData = () => {
    if (!authToken) return;
    
    fetch("https://er-attendance-backend.onrender.com/api/volunteers", { 
      headers: { "Authorization": `Bearer ${authToken}` } 
    })
    .then(res => res.json())
    .then(data => setVolunteersList(data || []))
    .catch(err => console.error("Error:", err));
    
    fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", { 
      headers: { "Authorization": `Bearer ${authToken}` } 
    })
    .then(res => res.json())
    .then(data => setAnalytics(data))
    .catch(err => console.error("Error:", err));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch("https://er-attendance-backend.onrender.com/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      setAuthToken(data.access_token);
      localStorage.setItem('admin_token', data.access_token);
      setIsAdminLoggedIn(true);
      fetchAdminData();
    } else {
      setLoginError("Invalid username or password!");
    }
  };

  useEffect(() => {
    if (authToken) {
      setIsAdminLoggedIn(true);
      fetchAdminData();
    }
  }, [authToken]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {!isAdminLoggedIn ? (
        <div className="max-w-sm mx-auto bg-white p-6 rounded-xl shadow mt-20">
          <h2 className="text-xl font-bold mb-4">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Username" className="w-full p-2 border rounded mb-2" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full p-2 border rounded mb-4" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded font-bold">Login</button>
          </form>
          {loginError && <p className="text-red-500 mt-2 text-sm">{loginError}</p>}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded shadow text-center flex flex-col items-center">
            <h3 className="font-bold mb-2">Volunteer QR Code</h3>
            <QRCodeSVG 
              value="https://er-attendance-frontend.onrender.com/" 
              size={180} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;