import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [volunteersList, setVolunteersList] = useState([]);
  const [analytics, setAnalytics] = useState({ present_today: 0, qualified: 0 });
  const [formData, setFormData] = useState({ full_name: '', phone_number: '', team: 'General' });

  // 1. መረጃዎችን መሳብ
  const fetchAdminData = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      window.location.href = '/login'; // ቶከን ከሌለ ወደ login ይወስዳል
      return;
    }
    
    const headers = { "Authorization": `Bearer ${token}` };
    try {
      const [volRes, anaRes] = await Promise.all([
        fetch("https://er-attendance-backend.onrender.com/api/volunteers", { headers }),
        fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", { headers })
      ]);
      
      if (volRes.ok) setVolunteersList(await volRes.json());
      if (anaRes.ok) setAnalytics(await anaRes.json());
    } catch (err) { console.error("Error fetching data:", err); }
  };

  useEffect(() => { fetchAdminData(); }, []);

  // 2. Logout ተግባር
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  // 3. መመዝገቢያ (Register)
  const handleRegister = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const res = await fetch("https://er-attendance-backend.onrender.com/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      alert("Volunteer Registered!");
      setFormData({ full_name: '', phone_number: '', team: 'General' });
      fetchAdminData();
    } else {
      const err = await res.json();
      alert("Error: " + (err.detail || "Registration failed"));
    }
  };

  // 4. CSV Export
  const handleExport = async () => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch("https://er-attendance-backend.onrender.com/api/admin/export-csv", { 
      headers: { "Authorization": `Bearer ${token}` } 
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = "volunteers.csv"; a.click();
    } else {
      alert("Export failed!");
    }
  };

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600">Logout</button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow"><p className="text-gray-500">Total Volunteers</p><h2 className="text-3xl font-black">{volunteersList.length}</h2></div>
        <div className="bg-white p-6 rounded-xl shadow"><p className="text-gray-500">Present Today</p><h2 className="text-3xl font-black text-blue-700">{analytics.present_today}</h2></div>
        <div className="bg-white p-6 rounded-xl shadow"><p className="text-gray-500">Certified Eligible</p><h2 className="text-3xl font-black text-amber-600">{analytics.qualified}</h2></div>
        <button onClick={handleExport} className="bg-green-700 text-white rounded-xl font-bold hover:bg-green-800">Export CSV</button>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleRegister} className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold mb-4">New Volunteer Registration</h3>
          <input className="w-full border p-2 mb-2 rounded" placeholder="Full Name *" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
          <input className="w-full border p-2 mb-2 rounded" placeholder="Phone Number" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
          <input className="w-full border p-2 mb-4 rounded" value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold">Register</button>
        </form>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold mb-4">Registered Volunteers</h3>
          <div className="space-y-2">{volunteersList.map(v => <div key={v.id} className="border-b pb-2 flex justify-between"><span>{v.full_name}</span></div>)}</div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="font-bold mb-4">QR Code Printing</h3>
          <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={140} className="mx-auto" />
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;