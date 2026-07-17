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

  const handleExport = async () => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch("https://er-attendance-backend.onrender.com/api/admin/export-csv", { 
      headers: { "Authorization": `Bearer ${token}` } 
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = "volunteer_attendance_report.csv"; a.click();
    } else { alert("Failed to export CSV."); }
  };

  const handleLogout = () => { localStorage.removeItem('admin_token'); window.location.href = '/login'; };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-600">Logout</button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border">
          <p className="text-gray-500">Total Volunteers</p>
          <h2 className="text-2xl font-bold">{volunteers.length}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <p className="text-gray-500">Present Today</p>
          <h2 className="text-2xl font-bold text-blue-600">{stats.present_today}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border">
          <p className="text-gray-500">Qualified (7 Weeks)</p>
          <h2 className="text-2xl font-bold text-green-600">{stats.qualified}</h2>
        </div>
        <button onClick={handleExport} className="bg-green-700 text-white rounded-xl font-bold hover:bg-green-800 transition">
          Export Full Report (CSV)
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Volunteer List Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow border">
          <h3 className="font-bold mb-4">Registered Volunteers List</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Team</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map(v => (
                  <tr key={v.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">{v.full_name}</td>
                    <td className="py-3">{v.phone_number || 'N/A'}</td>
                    <td className="py-3">{v.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Section */}
        <div className="bg-white p-6 rounded-xl shadow border flex flex-col items-center">
          <h3 className="font-bold mb-4">Check-In QR</h3>
          <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={200} />
          <p className="text-sm text-gray-500 mt-4">Place this at the entrance.</p>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;