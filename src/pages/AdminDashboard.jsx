import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [volunteersList, setVolunteersList] = useState([]);
  const [analytics, setAnalytics] = useState({ present_today: 0, qualified: 0 });
  const [formData, setFormData] = useState({ full_name: '', phone_number: '', team: 'General' });

  const fetchAdminData = async () => {
    const token = localStorage.getItem('admin_token'); // እዚህ በቀጥታ አንብብ
    if (!token) return alert("እባክዎ መጀመሪያ ይግቡ!");
    
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const [resVol, resAna] = await Promise.all([
        fetch("https://er-attendance-backend.onrender.com/api/volunteers", { headers }),
        fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", { headers })
      ]);
      if (resVol.ok) setVolunteersList(await resVol.json());
      if (resAna.ok) setAnalytics(await resAna.json());
    } catch (err) { console.error("Data Fetch Error:", err); }
  };

  useEffect(() => { fetchAdminData(); }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const res = await fetch("https://er-attendance-backend.onrender.com/api/volunteers", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      alert("Registered!");
      setFormData({ full_name: '', phone_number: '', team: 'General' });
      fetchAdminData();
    } else {
      alert("Registration failed! Check your token or connection.");
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
      const a = document.createElement('a'); a.href = url; a.download = "volunteers.csv"; a.click();
    }
  };

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      {/* ... (UI ክፍሎችህ እንደነበሩ ይቆዩ) ... */}
      <button onClick={handleExport} className="bg-green-700 text-white p-4 rounded-xl font-bold hover:bg-green-800">Export CSV</button>
      
      {/* ... የተቀረው ክፍል ... */}
    </div>
  );
};
export default AdminDashboard;