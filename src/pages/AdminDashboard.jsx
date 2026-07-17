import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [stats, setStats] = useState({ present_today: 0, qualified: 0 });
  const [formData, setFormData] = useState({ full_name: '', phone_number: '', team: 'General' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) { window.location.href = '/login'; return; }
    
    const headers = { "Authorization": `Bearer ${token}` };
    try {
      const [vRes, aRes] = await Promise.all([
        fetch("https://er-attendance-backend.onrender.com/api/volunteers", { headers }),
        fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", { headers })
      ]);
      if (vRes.ok) setVolunteers(await vRes.json());
      if (aRes.ok) setStats(await aRes.json());
    } catch (err) { console.error("Error fetching data:", err); }
  };

  const handleLogout = () => { 
    localStorage.removeItem('admin_token'); 
    window.location.href = '/login'; 
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const res = await fetch("https://er-attendance-backend.onrender.com/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) { 
        alert("Volunteer Registered Successfully!"); 
        setFormData({ full_name: '', phone_number: '', team: 'General' }); 
        fetchData(); 
    } else { alert("Registration Failed"); }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition">
          Logout
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm font-medium">Total Volunteers</p>
            <h2 className="text-3xl font-bold">{volunteers.length}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm font-medium">Present Today</p>
            <h2 className="text-3xl font-bold text-blue-600">{stats.present_today}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500 text-sm font-medium">Certified Eligible</p>
            <h2 className="text-3xl font-bold text-green-600">{stats.qualified}</h2>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Registration Form */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold mb-6">Register New Volunteer</h3>
          <form onSubmit={handleRegister} className="space-y-4">
            <input className="w-full p-3 border rounded-lg" placeholder="Full Name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
            <input className="w-full p-3 border rounded-lg" placeholder="Phone Number" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold">Register</button>
          </form>
        </div>

        {/* QR Code Section */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
          <h3 className="text-lg font-bold mb-4">Check-in QR Code</h3>
          <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={180} />
          <p className="text-gray-400 text-xs mt-4">Scan to access the check-in portal</p>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;