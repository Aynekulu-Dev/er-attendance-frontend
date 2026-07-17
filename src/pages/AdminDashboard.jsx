import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [volunteersList, setVolunteersList] = useState([]);
  const [analytics, setAnalytics] = useState({ present_today: 0, qualified: 0 });
  const [formData, setFormData] = useState({ full_name: '', phone_number: '', team: 'General' });

  // 1. መረጃዎችን መሳብ
  const fetchAdminData = async () => {
    const token = localStorage.getItem('admin_token');
    const headers = { "Authorization": `Bearer ${token}` };
    
    // Volunteers
    const volRes = await fetch("https://er-attendance-backend.onrender.com/api/volunteers", { headers });
    if (volRes.ok) setVolunteersList(await volRes.json());
    
    // Analytics
    const anaRes = await fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", { headers });
    if (anaRes.ok) setAnalytics(await anaRes.json());
  };

  useEffect(() => { fetchAdminData(); }, []);

  // 2. መመዝገቢያ (Form Submit)
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
    }
  };

  // 3. CSV Export
  const handleExport = async () => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch("https://er-attendance-backend.onrender.com/api/admin/export-csv", { headers: { "Authorization": `Bearer ${token}` } });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = "volunteers.csv"; a.click();
    }
  };

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Volunteers</p>
          <h2 className="text-3xl font-black">{volunteersList.length}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Present Today</p>
          <h2 className="text-3xl font-black text-blue-700">{analytics.present_today}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Certified Eligible</p>
          <h2 className="text-3xl font-black text-amber-600">{analytics.qualified}</h2>
        </div>
        {/* አዝራሩ እዚህ ላይ onClick አለው */}
        <button onClick={handleExport} className="bg-green-700 text-white rounded-xl font-bold hover:bg-green-800">Export CSV</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Registration Form */}
        <form onSubmit={handleRegister} className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold mb-4">New Volunteer Registration</h3>
          <input className="w-full border p-2 mb-2 rounded" placeholder="Full Name *" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
          <input className="w-full border p-2 mb-2 rounded" placeholder="Phone Number" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
          <input className="w-full border p-2 mb-4 rounded" value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded font-bold">Register</button>
        </form>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold mb-4">Registered Volunteers</h3>
          <div className="space-y-2">
            {volunteersList.map(v => (
              <div key={v.id} className="border-b pb-2 flex justify-between">
                <span>{v.full_name}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
              </div>
            ))}
          </div>
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