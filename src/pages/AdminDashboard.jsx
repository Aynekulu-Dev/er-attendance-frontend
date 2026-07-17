import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [authToken] = useState(localStorage.getItem('admin_token') || '');
  const [volunteersList, setVolunteersList] = useState([]);
  const [analytics, setAnalytics] = useState({ present_today: 0, qualified: 0 });
  
  // ለፎርም ስቴት
  const [formData, setFormData] = useState({ full_name: '', phone_number: '', team: 'General' });

  // ዳታ ለመጫን
  const fetchAdminData = async () => {
    if (!authToken) return;
    try {
      const headers = { "Authorization": `Bearer ${authToken}` };
      
      // 1. Volunteers List
      const resVol = await fetch("https://er-attendance-backend.onrender.com/api/volunteers", { headers });
      const dataVol = await resVol.json();
      setVolunteersList(dataVol || []);

      // 2. Analytics
      const resAna = await fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", { headers });
      const dataAna = await resAna.json();
      setAnalytics(dataAna);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => { fetchAdminData(); }, [authToken]);

  // አዲስ ቮለንቲየር መመዝገቢያ
  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await fetch("https://er-attendance-backend.onrender.com/api/volunteers", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}` 
      },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      alert("Volunteer Registered!");
      setFormData({ full_name: '', phone_number: '', team: 'General' });
      fetchAdminData(); // ዝርዝሩን ለማደስ
    }
  };

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      <div className="flex gap-4 mb-6">
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg shadow font-bold">Admin Dashboard</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <p className="text-gray-500 text-sm">Total Volunteers</p>
          <h2 className="text-3xl font-black text-green-700">{volunteersList.length}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <p className="text-gray-500 text-sm">Present Today</p>
          <h2 className="text-3xl font-black text-blue-700">{analytics.present_today}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <p className="text-gray-500 text-sm">Certified Eligible</p>
          <h2 className="text-3xl font-black text-amber-600">{analytics.qualified}</h2>
        </div>
        <button className="bg-green-700 text-white p-6 rounded-xl font-bold shadow">Export CSV</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleRegister} className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-lg mb-4">New Volunteer Registration</h3>
          <input className="w-full border p-3 rounded-lg mb-3" placeholder="Full Name *" 
            value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
          <input className="w-full border p-3 rounded-lg mb-3" placeholder="Phone Number" 
            value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
          <input className="w-full border p-3 rounded-lg mb-4" defaultValue="General" 
            onChange={e => setFormData({...formData, team: e.target.value})} />
          <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">Register</button>
        </form>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-lg mb-4">Registered Volunteers</h3>
          <div className="max-h-60 overflow-y-auto">
            {volunteersList.map(v => (
              <div key={v.id} className="border-b py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold">{v.full_name}</p>
                  <p className="text-xs text-gray-400">ID: {v.volunteer_id}</p>
                </div>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow text-center">
          <h3 className="font-bold text-lg mb-4">QR Code Printing</h3>
          <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={180} className="mx-auto" />
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;