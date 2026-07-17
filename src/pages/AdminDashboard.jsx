import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [authToken] = useState(localStorage.getItem('admin_token') || '');
  const [analytics, setAnalytics] = useState({ present_today: 0, qualified: 0 });
  const [volunteersList, setVolunteersList] = useState([]);

  useEffect(() => {
    if (!authToken) return;
    
    // Volunteers ዝርዝር
    fetch("https://er-attendance-backend.onrender.com/api/volunteers", { 
      headers: { "Authorization": `Bearer ${authToken}` } 
    })
    .then(res => res.json()).then(data => setVolunteersList(data || []));
    
    // Analytics
    fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", { 
      headers: { "Authorization": `Bearer ${authToken}` } 
    })
    .then(res => res.json()).then(data => setAnalytics(data));
  }, [authToken]);

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      <div className="flex gap-4 mb-6">
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg shadow font-bold">Admin Dashboard</button>
      </div>

      {/* Stats - volunteersList.length ተጠቀምኩ */}
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
        <button className="bg-green-700 text-white p-6 rounded-xl font-bold shadow hover:bg-green-800">Export CSV Backup</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Registration */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="font-bold text-lg mb-4">New Volunteer Registration</h3>
          <input className="w-full border p-3 rounded-lg mb-3" placeholder="Full Name *" />
          <input className="w-full border p-3 rounded-lg mb-3" placeholder="Phone Number" />
          <input className="w-full border p-3 rounded-lg mb-4" defaultValue="General" />
          <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">Register</button>
        </div>

        {/* List */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Registered Volunteers</h3>
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

        {/* QR */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 text-center flex flex-col items-center">
          <h3 className="font-bold text-lg mb-2">QR Code Printing</h3>
          <p className="text-xs text-gray-500 mb-4">Print this QR code and paste it on the wall.</p>
          <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={180} />
          <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold">Download QR Code (PNG)</button>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;