import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState(localStorage.getItem('admin_token') || '');
  const [analytics, setAnalytics] = useState(null);
  const [volunteersList, setVolunteersList] = useState([]);
  
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 1. መረጃዎችን መጫን (Analytics & Volunteers)
  const fetchAdminData = () => {
    if (!authToken) return;
    
    // Fetch Volunteers
    fetch("https://er-attendance-backend.onrender.com/api/volunteers", { 
      headers: { "Authorization": `Bearer ${authToken}` } 
    })
    .then(res => res.json())
    .then(data => setVolunteersList(data || []))
    .catch(err => console.error("Error fetching volunteers:", err));
    
    // Fetch Analytics
    fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", { 
      headers: { "Authorization": `Bearer ${authToken}` } 
    })
    .then(res => res.json())
    .then(data => setAnalytics(data))
    .catch(err => console.error("Error fetching analytics:", err));
  };

  // 2. Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch("https://er-attendance-backend.onrender.com/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      setAuthToken(data.access_token);
      localStorage.setItem('admin_token', data.access_token);
      setIsAdminLoggedIn(true);
      fetchAdminData();
    } else {
      setLoginError("የተጠቃሚ ስም ወይም የይለፍ ቃል ስህተት ነው!");
    }
  };

  useEffect(() => {
    if (authToken) {
      setIsAdminLoggedIn(true);
      fetchAdminData();
    }
  }, [authToken]);

  // 3. CSV Export
  const downloadCSV = () => {
    fetch("https://er-attendance-backend.onrender.com/api/admin/export-csv", { 
      headers: { "Authorization": `Bearer ${authToken}` } 
    })
    .then(res => res.blob())
    .then(blob => {
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
        <div className="max-w-sm mx-auto bg-white p-6 rounded-xl shadow mt-20">
          <h2 className="text-xl font-bold mb-4">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Username" className="w-full p-2 border rounded mb-2" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full p-2 border rounded mb-4" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded font-bold">Login</button>
          </form>
          {loginError && <p className="text-red-500 mt-2 text-sm">{loginError}</p>}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-bold text-gray-500">Total Volunteers</h3>
              <p className="text-3xl font-black text-green-700">{analytics?.total_volunteers || 0}</p>
            </div>
            
            <button onClick={downloadCSV} className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded font-bold text-lg shadow">
              📥 Export CSV Backup
            </button>

            <div className="bg-white p-6 rounded shadow text-center flex flex-col items-center">
              <h3 className="font-bold mb-2">Volunteer QR Code</h3>
              <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={120} />
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="font-bold mb-4">Registered Volunteers</h3>
            <table className="w-full text-left">
              <thead><tr className="border-b"><th>Name</th><th>Team</th></tr></thead>
              <tbody>
                {volunteersList.map(v => (
                  <tr key={v.id} className="border-b">
                    <td className="py-2">{v.full_name}</td>
                    <td className="py-2 text-gray-600">{v.team}</td>
                  </tr>
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