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
    } catch (err) { console.error("Error:", err); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.full_name) { alert("Please enter the volunteer's name!"); return; }
    
    const token = localStorage.getItem('admin_token');
    const res = await fetch("https://er-attendance-backend.onrender.com/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      const data = await res.json();
      alert(`Success! Volunteer Registered.\nID: ${data.volunteer_id}\nName: ${formData.full_name}`);
      setFormData({ full_name: '', phone_number: '', team: 'General' });
      fetchData();
    } else {
      alert("Registration failed! Please check the connection.");
    }
  };

  const handleExport = async () => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch("https://er-attendance-backend.onrender.com/api/admin/export-csv", { 
      headers: { "Authorization": `Bearer ${token}` } 
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = "attendance_report.csv"; a.click();
    } else { alert("Failed to export."); }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={() => { localStorage.removeItem('admin_token'); window.location.href = '/login'; }} className="bg-red-500 text-white px-6 py-2 rounded">Logout</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow"> <p>Total Volunteers</p> <h2 className="text-2xl font-bold">{volunteers.length}</h2> </div>
        <div className="bg-white p-6 rounded shadow"> <p>Present Today</p> <h2 className="text-2xl font-bold text-blue-600">{stats.present_today}</h2> </div>
        <div className="bg-white p-6 rounded shadow"> <p>Qualified (7 Weeks)</p> <h2 className="text-2xl font-bold text-green-600">{stats.qualified}</h2> </div>
        <button onClick={handleExport} className="bg-green-700 text-white rounded font-bold">Export CSV Report</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="font-bold mb-4">Add New Volunteer</h3>
          <form onSubmit={handleRegister} className="space-y-4">
            <input className="w-full p-2 border rounded" placeholder="Full Name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
            <input className="w-full p-2 border rounded" placeholder="Phone" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Register Volunteer</button>
          </form>
          <div className="mt-8 flex flex-col items-center">
            <h3 className="font-bold mb-2">Check-In QR Code</h3>
            <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={150} />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded shadow overflow-y-auto max-h-[500px]">
          <h3 className="font-bold mb-4">Registered Volunteers</h3>
          <table className="w-full text-left">
            <thead><tr className="border-b"><th>Name</th><th>Phone</th><th>Team</th><th>ID</th></tr></thead>
            <tbody>
              {volunteers.map(v => (
                <tr key={v.volunteer_id} className="border-b">
                  <td className="py-2">{v.full_name}</td>
                  <td className="py-2">{v.phone_number}</td>
                  <td className="py-2">{v.team}</td>
                  <td className="py-2 font-bold">{v.volunteer_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;