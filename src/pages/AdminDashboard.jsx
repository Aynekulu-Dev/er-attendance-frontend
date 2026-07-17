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
    const [vRes, aRes] = await Promise.all([
      fetch("https://er-attendance-backend.onrender.com/api/volunteers", { headers }),
      fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", { headers })
    ]);
    if (vRes.ok) setVolunteers(await vRes.json());
    if (aRes.ok) setStats(await aRes.json());
  };

  const handleLogout = () => { localStorage.removeItem('admin_token'); window.location.href = '/login'; };

  const handleRegister = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const res = await fetch("https://er-attendance-backend.onrender.com/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) { alert("Registered!"); setFormData({ full_name: '', phone_number: '', team: 'General' }); fetchData(); }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-6 py-2 rounded">Logout</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">Total: {volunteers.length}</div>
        <div className="bg-white p-6 rounded shadow">Present: {stats.present_today}</div>
        <div className="bg-white p-6 rounded shadow">Qualified: {stats.qualified}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow">
          <input className="w-full p-2 border mb-2" placeholder="Name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
          <input className="w-full p-2 border mb-2" placeholder="Phone" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
          <button type="submit" className="w-full bg-green-600 text-white p-2">Register</button>
        </form>
        <div className="bg-white p-6 rounded shadow text-center">
          <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={120} className="mx-auto" />
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;