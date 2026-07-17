import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [stats, setStats] = useState({ 
    total_volunteers: 0, 
    active_today: 0, 
    today_attendance_count: 0, 
    certified_volunteers_count: 0 
  });
  const [formData, setFormData] = useState({ full_name: '', phone_number: '', team: '' });
  const qrRef = useRef(null);

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
      if (aRes.ok) {
        const data = await aRes.json();
        setStats({
          total_volunteers: data.total_volunteers,
          active_today: data.active_today,
          today_attendance_count: data.today_attendance_count,
          certified_volunteers_count: data.certified_volunteers_count
        });
      }
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
      const data = await res.json();
      alert(`${data.message}\n\nID: ${data.volunteer_id}\nTeam: ${data.team}`);
      setFormData({ full_name: '', phone_number: '', team: '' });
      fetchData();
    } else { alert("Registration failed!"); }
  };

  const handleExport = async () => {
    const token = localStorage.getItem('admin_token');
    const res = await fetch("https://er-attendance-backend.onrender.com/api/admin/export-csv", { 
      headers: { "Authorization": `Bearer ${token}` } 
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); 
      a.href = url; a.download = "attendance_report.csv"; a.click();
    } else { alert("Failed to export CSV."); }
  };

  const downloadQR = () => {
    const svg = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "CheckIn_QR.png";
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-lg">Export CSV</button>
          <button onClick={() => { localStorage.removeItem('admin_token'); window.location.href = '/login'; }} className="bg-red-500 text-white px-4 py-2 rounded-lg">Logout</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Volunteers", value: stats.total_volunteers },
          { label: "Active Today", value: stats.active_today },
          { label: "Check-in Count", value: stats.today_attendance_count },
          { label: "Certified Ready", value: stats.certified_volunteers_count }
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-gray-500 text-sm">{item.label}</p>
            <h2 className="text-3xl font-bold">{item.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="font-bold mb-4">Add New Volunteer</h3>
          <form onSubmit={handleRegister} className="space-y-4">
            <input className="w-full p-3 border rounded" placeholder="Full Name" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
            <input className="w-full p-3 border rounded" placeholder="Phone" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
            <input className="w-full p-3 border rounded" placeholder="Team" value={formData.team} onChange={e => setFormData({...formData, team: e.target.value})} required />
            <button type="submit" className="w-full bg-green-600 text-white py-3 rounded">Register</button>
          </form>
          <div className="mt-8 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-2 cursor-pointer" onClick={downloadQR}>Click QR to Download</p>
            <div ref={qrRef} onClick={downloadQR} className="cursor-pointer">
              <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={140} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border overflow-x-auto">
          <h3 className="font-bold mb-4">Registered Volunteers</h3>
          <table className="w-full text-left">
            <thead><tr className="border-b"><th className="p-2">Name</th><th className="p-2">Phone</th><th className="p-2">Team</th><th className="p-2">ID</th></tr></thead>
            <tbody>
              {volunteers.map(v => (
                <tr key={v.volunteer_id} className="border-b">
                  <td className="p-2">{v.full_name}</td>
                  <td className="p-2">{v.phone_number}</td>
                  <td className="p-2">{v.team}</td>
                  <td className="p-2 font-bold text-green-700">{v.volunteer_id}</td>
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