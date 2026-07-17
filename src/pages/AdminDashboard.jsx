import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [stats, setStats] = useState({ 
    total_volunteers: 0, 
    active_today: 0, 
    today_attendance_count: 0, 
    certified_volunteers_count: 0 
  });
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
    } catch (err) { console.error("Error loading data:", err); }
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
      // 1. የ schemas.py ምላሽን (Response) በቀጥታ መጠቀም
      const data = await res.json();
      alert(`${data.message}\n\nName: ${data.full_name}\nID: ${data.volunteer_id}\nTeam: ${data.team}`);
      
      setFormData({ full_name: '', phone_number: '', team: 'General' });
      fetchData(); // ዳታውን ዳግም ሎድ ለማድረግ
    } else {
      alert("Registration failed! Please try again.");
    }
  };

  // 2. የጠፋውን የ Export CSV ፋንክሽን መመለስ
  const handleExport = async () => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch("https://er-attendance-backend.onrender.com/api/admin/export-csv", { 
      headers: { "Authorization": `Bearer ${token}` } 
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); 
      a.href = url; 
      a.download = "attendance_report.csv"; 
      a.click();
    } else {
      alert("Failed to export CSV. Please check the backend connection.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        
        {/* Export CSV Button - አሁን ከ Header ጋር አብሮ ገብቷል */}
        <div className="flex gap-4">
          <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition">
            Export CSV
          </button>
          <button onClick={() => { localStorage.removeItem('admin_token'); window.location.href = '/login'; }} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition">
            Logout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Volunteers", value: stats.total_volunteers, color: "text-gray-900" },
          { label: "Active Today", value: stats.active_today, color: "text-blue-600" },
          { label: "Check-in Count", value: stats.today_attendance_count, color: "text-orange-600" },
          { label: "Certified Ready", value: stats.certified_volunteers_count, color: "text-green-600" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">{item.label}</p>
            <h2 className={`text-3xl font-bold mt-2 ${item.color}`}>{item.value}</h2>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Register Form */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Add New Volunteer</h3>
          <form onSubmit={handleRegister} className="space-y-4">
            <input 
              className="w-full p-3 border border-gray-200 rounded-lg" 
              placeholder="Full Name" 
              value={formData.full_name} 
              onChange={e => setFormData({...formData, full_name: e.target.value})} 
              required 
            />
            <input 
              className="w-full p-3 border border-gray-200 rounded-lg" 
              placeholder="Phone Number" 
              value={formData.phone_number} 
              onChange={e => setFormData({...formData, phone_number: e.target.value})} 
            />
            
            {/* Team Input Field - አሁን እንደ Input field ተቀይሯል */}
            <input 
            className="w-full p-3 border border-gray-200 rounded-lg" 
            placeholder="Team (e.g. Media, Logistics)" 
            value={formData.team} 
            onChange={e => setFormData({...formData, team: e.target.value})} 
            required 
            />

            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition">
              Register
            </button>
          </form>
          
          <div className="mt-8 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-2">Check-In QR Code</p>
            <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={140} />
          </div>
        </div>

        {/* Volunteers Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <h3 className="font-bold text-lg mb-4">Registered Volunteers</h3>
          <div className="overflow-x-auto max-h-[450px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 text-sm font-semibold text-gray-600">Name</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Phone</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">Team</th>
                  <th className="p-3 text-sm font-semibold text-gray-600">ID</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map(v => (
                  <tr key={v.volunteer_id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-gray-700 font-medium">{v.full_name}</td>
                    <td className="p-3 text-gray-600">{v.phone_number}</td>
                    <td className="p-3 text-gray-600">{v.team}</td>
                    <td className="p-3 font-bold text-green-700">{v.volunteer_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;