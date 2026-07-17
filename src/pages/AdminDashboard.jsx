import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('admin_token') || '');
  const [volunteers, setVolunteers] = useState([]);
  // ... ሌሎች ስቴቶች እንደ አስፈላጊነቱ

  useEffect(() => {
    if (!authToken) window.location.href = '/er-secret-portal-2026'; // ወይም ወደ Login ይመልሰው
  }, [authToken]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* የQR ኮዱ መድረሻ ወደ ዋናው ፖርታል መሆኑን አረጋግጥ */}
      <div className="bg-white p-6 rounded shadow inline-block">
        <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={150} />
        <p className="text-xs mt-2">Scan to access Check-In Portal</p>
      </div>
    </div>
  );
};
export default AdminDashboard;