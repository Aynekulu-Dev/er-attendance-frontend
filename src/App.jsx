import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function App() {
  const [activeTab, setActiveTab] = useState('user'); 
  const [volunteerId, setVolunteerId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authToken, setAuthToken] = useState(localStorage.getItem('admin_token') || '');

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [team, setTeam] = useState('General');
  const [volunteersList, setVolunteersList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [adminStatus, setAdminStatus] = useState({ type: '', message: '' });

  // አድሚን መግቢያውን በURL ለመቀበል (admin=true)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('admin') === 'true') {
      setActiveTab('admin');
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('admin_token', authToken);
    } else {
      setIsAdminLoggedIn(false);
      localStorage.removeItem('admin_token');
    }
  }, [authToken]);

  // --- ADMIN FUNCTIONS ---
  const handleAdminLogin = (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append('username', adminUsername);
    formData.append('password', adminPassword);

    fetch("https://er-attendance-backend.onrender.com/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData
    })
    .then(async (res) => {
      const data = await res.json();
      if (res.ok) {
        setAuthToken(data.access_token);
        setAdminStatus({ type: 'success', message: 'በስኬት ገብተዋል!' });
      } else {
        setAdminStatus({ type: 'error', message: 'የተሳሳተ መረጃ!' });
      }
    });
  };

  const handleAdminLogout = () => {
    setAuthToken('');
    setIsAdminLoggedIn(false);
    setActiveTab('user');
    window.history.pushState({}, document.title, "/"); // URL ማጽጃ
  };

  const fetchAdminData = () => {
    if (!authToken) return;
    fetch("https://er-attendance-backend.onrender.com/api/volunteers", { headers: { "Authorization": `Bearer ${authToken}` } })
      .then((res) => res.json()).then((data) => setVolunteersList(data || []));
    fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", { headers: { "Authorization": `Bearer ${authToken}` } })
      .then((res) => res.json()).then((data) => setAnalytics(data));
  };

  useEffect(() => {
    if (activeTab === 'admin' && isAdminLoggedIn) fetchAdminData();
  }, [activeTab, isAdminLoggedIn]);

  // --- USER ATTENDANCE LOGIC ---
  const handleAttendance = (action) => {
    if (!volunteerId.trim()) return setStatus({ type: 'error', message: 'እባክህ ID አስገባ!' });
    setLoading(true);
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      fetch("https://er-attendance-backend.onrender.com/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteer_id: volunteerId.trim(), user_lat: latitude, user_lon: longitude, action: action })
      }).then(async (res) => {
        const data = await res.json();
        if (res.ok) { setStatus({ type: 'success', message: data.message }); setVolunteerId(''); }
        else { setStatus({ type: 'error', message: data.detail }); }
      }).finally(() => setLoading(false));
    }, () => { setLoading(false); setStatus({ type: 'error', message: 'ሎኬሽን ፍቀድ!' }); }, { enableHighAccuracy: true });
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-gen");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "EthiopiaReads_QR.png";
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 font-sans">
      
      {/* 1. Header: ምንም አይነት የአድሚን በተን የለም */}
      <div className="flex justify-center items-center max-w-6xl mx-auto mb-6">
        <h1 className="text-xl font-bold text-green-700">Ethiopia Reads Portal</h1>
      </div>

      {/* 2. USER TAB (ይህ ብቻ ነው ለቮለንቲየር የሚታየው) */}
      {activeTab === 'user' && (
        <div className="flex flex-col items-center justify-center pt-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-green-100">
            <h1 className="text-2xl font-extrabold text-gray-800 text-center mb-6">Attendance</h1>
            <input type="text" placeholder="Volunteer ID" value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)} className="w-full p-3 border rounded-lg mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleAttendance('check-in')} className="bg-green-600 text-white py-3 rounded-lg font-bold">Check In</button>
              <button onClick={() => handleAttendance('check-out')} className="bg-red-600 text-white py-3 rounded-lg font-bold">Check Out</button>
            </div>
            {status.message && <p className="mt-4 text-center text-sm">{status.message}</p>}
          </div>
        </div>
      )}

      {/* 3. ADMIN TAB (በ URL ብቻ የሚገባ) */}
      {activeTab === 'admin' && (
        <div className="max-w-6xl mx-auto">
          {!isAdminLoggedIn ? (
            <div className="flex justify-center pt-12">
               <form onSubmit={handleAdminLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
                 <h2 className="text-xl font-bold mb-4">Admin Login</h2>
                 <input type="text" placeholder="Username" onChange={(e) => setAdminUsername(e.target.value)} className="w-full p-3 border rounded-lg mb-3" />
                 <input type="password" placeholder="Password" onChange={(e) => setAdminPassword(e.target.value)} className="w-full p-3 border rounded-lg mb-3" />
                 <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg">Sign In</button>
               </form>
            </div>
          ) : (
            <div>
              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Admin Dashboard</h2>
                <button onClick={handleAdminLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Logout</button>
              </div>
              {/* QR Code Section: ለቮለንቲየር የሚሆን ሊንክ */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border text-center max-w-xs">
                <QRCodeSVG id="qr-gen" value="https://er-attendance-frontend.onrender.com" size={180} />
                <button onClick={downloadQRCode} className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg w-full">Download QR</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;