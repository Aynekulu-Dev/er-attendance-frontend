import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [authToken] = useState(localStorage.getItem('admin_token') || '');
  const [analytics, setAnalytics] = useState({ total_volunteers: 0, today_attendance: 0, qualified: 0 });
  const [volunteersList, setVolunteersList] = useState([]);

  // መረጃዎችን ከባክኤንድ የሚጠራበት
  useEffect(() => {
    if (!authToken) return;
    fetch("https://er-attendance-backend.onrender.com/api/volunteers", { headers: { "Authorization": `Bearer ${authToken}` } })
      .then(res => res.json()).then(data => setVolunteersList(data || []));
    
    fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", { headers: { "Authorization": `Bearer ${authToken}` } })
      .then(res => res.json()).then(data => setAnalytics(data));
  }, [authToken]);

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      {/* የላይኛው የ Navigation አዝራሮች */}
      <div className="flex gap-4 mb-6">
        <button className="bg-white px-6 py-2 rounded-lg shadow font-bold">Check-In / Out Portal</button>
        <button className="bg-green-600 text-white px-6 py-2 rounded-lg shadow font-bold">Admin Dashboard</button>
      </div>

      {/* 3ቱ የስታቲስቲክስ ሳጥኖች */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <p className="text-gray-500 text-sm">ጠቅላላ ቮለንቲየሮች</p>
          <h2 className="text-3xl font-black text-green-700">{analytics.total_volunteers}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <p className="text-gray-500 text-sm">ዛሬ የተገኙ</p>
          <h2 className="text-3xl font-black text-blue-700">{analytics.today_attendance}</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <p className="text-gray-500 text-sm">የ 7 ሰኞት ሰርተፍኬት ብቁ</p>
          <h2 className="text-3xl font-black text-amber-600">{analytics.qualified}</h2>
        </div>
        <button className="bg-green-700 text-white p-6 rounded-xl font-bold shadow hover:bg-green-800">📥 Export CSV Backup</button>
      </div>

      {/* ዋናዎቹ 3 ክፍሎች */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* መመዝገቢያ */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="font-bold text-lg mb-4">አዲስ ቮለንቲየር መመዝገቢያ</h3>
          <input className="w-full border p-3 rounded-lg mb-3" placeholder="ሙሉ ስም *" />
          <input className="w-full border p-3 rounded-lg mb-3" placeholder="ስልክ ቁጥር" />
          <input className="w-full border p-3 rounded-lg mb-4" defaultValue="General" />
          <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold">ይመዝገቡ</button>
        </div>

        {/* ዝርዝር */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="font-bold text-lg mb-4">የተመዘገቡ ቮለንቲየሮች</h3>
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

        {/* QR ኮድ */}
        <div className="bg-white p-6 rounded-xl shadow border border-gray-100 text-center flex flex-col items-center">
          <h3 className="font-bold text-lg mb-2">የግድግዳ QR ኮድ ማተሚያ</h3>
          <p className="text-xs text-gray-500 mb-4">ይህንን QR ኮድ አውርደህ በኤፎር (A4) ወረቀት በማተም ግድግዳው ላይ መለጠፍ ትችላለህ።</p>
          <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={180} />
          <button className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-bold">Download QR Code (PNG)</button>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;