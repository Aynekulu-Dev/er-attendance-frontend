import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem('admin_token') || '');
  const [analytics, setAnalytics] = useState(null);
  const [volunteersList, setVolunteersList] = useState([]);
  
  // ፎርም ስቴትስ
  const [formData, setFormData] = useState({ full_name: '', phone: '', team: 'General' });

  // 1. መረጃዎችን መጫን (Analytics & Volunteers)
  const fetchAdminData = () => {
    if (!authToken) return;
    fetch("https://er-attendance-backend.onrender.com/api/volunteers", { headers: { "Authorization": `Bearer ${authToken}` } })
      .then(res => res.json()).then(data => setVolunteersList(data || []));
    
    fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", { headers: { "Authorization": `Bearer ${authToken}` } })
      .then(res => res.json()).then(data => setAnalytics(data));
  };

  useEffect(() => {
    if (authToken) {
      setIsAdminLoggedIn(true);
      fetchAdminData();
    }
  }, [authToken]);

  // 2. CSV Export
  const downloadCSV = () => {
    fetch("https://er-attendance-backend.onrender.com/api/admin/export-csv", { headers: { "Authorization": `Bearer ${authToken}` } })
      .then(res => res.blob()).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "attendance_report.csv";
        a.click();
      });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {!isAdminLoggedIn ? (
        <div className="max-w-sm mx-auto bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Admin Login</h2>
          {/* እዚህ ውስጥ Login Logic አስገባ */}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats */}
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-bold">Total Volunteers</h3>
              <p className="text-2xl">{analytics?.total_volunteers || 0}</p>
            </div>
            
            {/* CSV Download */}
            <button onClick={downloadCSV} className="bg-blue-600 text-white p-4 rounded">Download CSV Report</button>

            {/* QR Code */}
            <div className="bg-white p-6 rounded shadow text-center">
              <h3 className="font-bold mb-2">Volunteer QR Code</h3>
              <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={120} />
            </div>
          </div>

          {/* CRUD Table */}
          <div className="bg-white p-6 rounded shadow mt-6">
            <h3 className="font-bold mb-4">Registered Volunteers</h3>
            <table className="w-full">
              <thead><tr><th>Name</th><th>Team</th></tr></thead>
              <tbody>
                {volunteersList.map(v => (
                  <tr key={v.id}><td>{v.full_name}</td><td>{v.team}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;