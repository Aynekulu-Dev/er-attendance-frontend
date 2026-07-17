import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

function App() {
  const [activeTab, setActiveTab] = useState('user'); // 'user' ወይም 'admin'
  const [volunteerId, setVolunteerId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  // --- ADMIN AUTHENTICATION STATES ---
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authToken, setAuthToken] = useState(localStorage.getItem('admin_token') || '');

  // --- ADMIN FORM STATES ---
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [team, setTeam] = useState('General'); // መነሻው (default) General እንዲሆን ተደርጓል
  const [volunteersList, setVolunteersList] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [adminStatus, setAdminStatus] = useState({ type: '', message: '' });

  // ቶክን ካለ ሎጊን መሆኑን ያረጋግጣል
  useEffect(() => {
    if (authToken) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('admin_token', authToken);
    } else {
      setIsAdminLoggedIn(false);
      localStorage.removeItem('admin_token');
    }
  }, [authToken]);

  // 1. የአድሚን መግቢያ (Admin Login)
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (!adminUsername || !adminPassword) {
      setAdminStatus({ type: 'error', message: 'እባክህ የተጠቃሚ ስም እና የይለፍ ቃል አስገባ!' });
      return;
    }

    // ለ OAuth2PasswordRequestForm በ form-data ፎርማት መላክ አለበት
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
        setAdminUsername('');
        setAdminPassword('');
      } else {
        setAdminStatus({ type: 'error', message: data.detail || 'የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል!' });
      }
    })
    .catch(() => {
      setAdminStatus({ type: 'error', message: 'ከባክኤንድ ጋር መገናኘት አልተቻለም።' });
    });
  };

  // 2. ከአድሚን መውጫ (Admin Logout)
  const handleAdminLogout = () => {
    setAuthToken('');
    setIsAdminLoggedIn(false);
  };

  // 3. የአድሚን ዳታዎችን መጫኛ (Volunteers & Analytics)
  const fetchAdminData = () => {
    if (!authToken) return;

    // ሀ. ቮለንቲየሮችን መጫን
    fetch("https://er-attendance-backend.onrender.com/api/volunteers", {
      headers: { "Authorization": `Bearer ${authToken}` }
    })
    .then((res) => {
      if (res.status === 401) handleAdminLogout();
      return res.json();
    })
    .then((data) => setVolunteersList(data || []))
    .catch(() => console.log("ቮለንቲየሮችን መጫን አልተቻለም"));

    // ለ. አናሊቲክስ መጫን
    fetch("https://er-attendance-backend.onrender.com/api/admin/analytics", {
      headers: { "Authorization": `Bearer ${authToken}` }
    })
    .then((res) => res.json())
    .then((data) => setAnalytics(data))
    .catch(() => console.log("አናሊቲክስ መጫን አልተቻለም"));
  };

  useEffect(() => {
    if (activeTab === 'admin' && isAdminLoggedIn) {
      fetchAdminData();
    }
  }, [activeTab, isAdminLoggedIn]);

  // 4. የ Check-In / Check-Out ሎጂክ (Public)
  const handleAttendance = (action) => {
    if (!volunteerId.trim()) {
      setStatus({ type: 'error', message: 'እባክህ መጀመሪያ የቮለንቲየር መለያ ቁጥርህን (ID) አስገባ!' });
      return;
    }

    if (!navigator.geolocation) {
      setStatus({ type: 'error', message: 'ይህ ስልክ የሎኬሽን አገልግሎት አይደግፍም።' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'ሎኬሽንህን በማጣራት ላይ... እባክህ ጠብቅ።' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        fetch("https://er-attendance-backend.onrender.com/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            volunteer_id: volunteerId.trim(),
            user_lat: latitude,
            user_lon: longitude,
            action: action
          })
        })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            setStatus({ type: 'success', message: data.message });
            setVolunteerId('');
          } else {
            setStatus({ type: 'error', message: data.detail || 'የማይታወቅ ስህተት አጋጥሟል።' });
          }
        })
        .catch(() => {
          setStatus({ type: 'error', message: 'ከባክኤንድ ሰርቨር ጋር መገናኘት አልተቻለም።' });
        })
        .finally(() => {
          setLoading(false);
        });
      },
      (error) => {
        setLoading(false);
        setStatus({ 
          type: 'error', 
          message: 'የስልክህን ሎኬሽን (GPS) መፍቀድ አለብህ! እባክህ የስልክህን ሎኬሽን አብርተህ በድጋሚ ሞክር።' 
        });
      },
      { enableHighAccuracy: true }
    );
  };

  // 5. አዲስ ቮለንቲየር መመዝገቢያ (Protected with Admin Token)
  const handleRegisterVolunteer = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setAdminStatus({ type: 'error', message: 'እባክህ ሙሉ ስም አስገባ!' });
      return;
    }

    fetch("https://er-attendance-backend.onrender.com/api/volunteers", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({
        // volunteer_id መላክ አያስፈልግም፣ ባክኤንድ ራሱ ያመነጫል
        full_name: fullName.trim(),
        phone_number: phone.trim() || null,
        team: team.trim() || "General"
      })
    })
    .then(async (res) => {
      const data = await res.json();
      if (res.ok) {
        setAdminStatus({ 
          type: 'success', 
          message: `ቮለንቲየር ${fullName} በመለያ ቁጥር ${data.volunteer_id} በተሳካ ሁኔታ ተመዝግቧል!` 
        });
        setFullName('');
        setPhone('');
        setTeam('General');
        fetchAdminData(); // ዝርዝሩንና አናሊቲክሱን ለማደስ
      } else {
        setAdminStatus({ type: 'error', message: data.detail || 'መመዝገብ አልተቻለም።' });
      }
    })
    .catch(() => {
      setAdminStatus({ type: 'error', message: 'ከባክኤንድ ጋር መገናኘት አልተቻለም።' });
    });
  };

  // 6. CSV ዳውንሎድ ማድረጊያ (Protected with Admin Token)
  const downloadCSV = () => {
    fetch("https://er-attendance-backend.onrender.com/api/admin/export-csv", {
      headers: { "Authorization": `Bearer ${authToken}` }
    })
    .then(async (res) => {
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ethiopia_reads_attendance_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const data = await res.json();
        alert(data.detail || "ፋይሉን ማውረድ አልተቻለም።");
      }
    })
    .catch(() => alert("ከባክኤንድ ጋር መገናኘት አልተቻለም።"));
  };

  // 7. QR Code Download
  const downloadQRCode = () => {
    const svg = document.getElementById("qr-gen");
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.href = pngFile;
      downloadLink.download = "EthiopiaReads_Attendance_QR.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4 font-sans">
      
      {/* Header Tab Switcher */}
      <div className="flex justify-between items-center max-w-6xl mx-auto mb-6">
        <div className="bg-white p-1 rounded-xl shadow-md flex space-x-2 border border-green-100">
          <button
            onClick={() => setActiveTab('user')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'user' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Check-In / Out Portal
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              setAdminStatus({ type: '', message: '' });
            }}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'admin' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Admin Dashboard
          </button>
        </div>

        {activeTab === 'admin' && isAdminLoggedIn && (
          <button
            onClick={handleAdminLogout}
            className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition"
          >
            Logout (ውጣ)
          </button>
        )}
      </div>

      {/* -------------------- USER TAB -------------------- */}
      {activeTab === 'user' && (
        <div className="flex flex-col items-center justify-center pt-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-green-100">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-3 shadow-md">
                <span className="text-white text-2xl font-bold">ER</span>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-800">Ethiopia Reads</h1>
              <p className="text-sm text-gray-500 mt-1">Volunteer Attendance Portal</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                የቮለንቲየር መለያ ቁጥር (Volunteer ID)
              </label>
              <input
                type="text"
                placeholder="ለምሳሌ፡ ER-001"
                value={volunteerId}
                onChange={(e) => setVolunteerId(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleAttendance('check-in')}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition disabled:opacity-50"
              >
                Check In (ግባ)
              </button>
              <button
                onClick={() => handleAttendance('check-out')}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition disabled:opacity-50"
              >
                Check Out (ውጣ)
              </button>
            </div>

            {status.message && (
              <div className={`p-4 rounded-lg text-sm font-medium ${
                status.type === 'success' ? 'bg-green-100 text-green-800' :
                status.type === 'error' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {status.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- ADMIN TAB (LOGIN REQUIRED) -------------------- */}
      {activeTab === 'admin' && !isAdminLoggedIn && (
        <div className="flex flex-col items-center justify-center pt-12">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-sm w-full border border-green-100">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-6">የአድሚን መግቢያ (Admin Login)</h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Username</label>
                <input
                  type="text"
                  placeholder="የተጠቃሚ ስም"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="የይለፍ ቃል"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition text-sm"
              >
                ግባ (Sign In)
              </button>
            </form>
            {adminStatus.message && (
              <div className={`mt-4 p-3 rounded-lg text-xs font-medium text-center ${
                adminStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {adminStatus.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- ADMIN PORTAL (SECURED VIEW) -------------------- */}
      {activeTab === 'admin' && isAdminLoggedIn && (
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-green-50 flex flex-col">
              <span className="text-xs font-bold text-gray-400">ጠቅላላ ቮለንቲየሮች</span>
              <span className="text-2xl font-black text-green-700 mt-1">
                {analytics?.total_volunteers || 0}
              </span>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-green-50 flex flex-col">
              <span className="text-xs font-bold text-gray-400">ዛሬ የተገኙ</span>
              <span className="text-2xl font-black text-blue-700 mt-1">
                {analytics?.today_attendance_count || 0}
              </span>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-green-50 flex flex-col">
              <span className="text-xs font-bold text-gray-400">የ 7 ሳምንት ሰርተፍኬት ብቁ</span>
              <span className="text-2xl font-black text-amber-600 mt-1">
                {analytics?.certified_volunteers_count || 0}
              </span>
            </div>
            {/* CSV Backup Export */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-green-50 flex items-center justify-center">
              <button
                onClick={downloadCSV}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition text-sm w-full"
              >
                📥 Export CSV Backup
              </button>
            </div>
          </div>

          {/* ዋናው የአድሚን ገጽታ Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: አዲስ ቮለንቲየር መመዝገቢያ */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">አዲስ ቮለንቲየር መመዝገቢያ</h2>
              <form onSubmit={handleRegisterVolunteer} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">ሙሉ ስም *</label>
                  <input
                    type="text"
                    placeholder="ስም እና የአባት ስም"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">ስልክ ቁጥር</label>
                  <input
                    type="text"
                    placeholder="09..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">የስራ ክፍል (Team) *</label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ Academic Tutoring ወይም Library"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg shadow-md transition"
                >
                  ይመዝገብ
                </button>
              </form>
              {adminStatus.message && (
                <div className={`mt-4 p-3 rounded-lg text-xs font-medium ${
                  adminStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {adminStatus.message}
                </div>
              )}
            </div>

            {/* Column 2: የተመዘገቡት ዝርዝር */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 md:col-span-1">
              <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">የተመዘገቡ ቮለንቲየሮች</h2>
              <div className="overflow-y-auto max-h-96 space-y-3">
                {volunteersList.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">ምንም የተመዘገበ ቮለንቲየር የለም።</p>
                ) : (
                  volunteersList.map((vol) => (
                    <div key={vol.id} className="p-3 border rounded-xl hover:bg-gray-50 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{vol.full_name}</p>
                        <p className="text-xs text-gray-500">{vol.team} • ID: {vol.volunteer_id}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-bold">
                        Active
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: QR Code Poster */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 flex flex-col items-center justify-between text-center">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">የግድግዳ QR ኮድ ማተሚያ</h2>
                <p className="text-xs text-gray-500 mb-4">ይህንን QR ኮድ አውርደህ በኤፎር (A4) ወረቀት በማተም ግድግዳው ላይ መለጠፍ ትችላለህ።</p>
              </div>
              
              <div className="p-4 border-2 border-dashed border-green-400 rounded-xl bg-gray-50 flex flex-col items-center">
                <span className="text-xs font-bold text-green-700 tracking-wider mb-2">ETHIOPIA READS</span>
                <QRCodeSVG
                  id="qr-gen"
                  value="http://localhost:5173" // በሞባይል ስካን ሲደረግ የሚከፈተው የእውነተኛው ፖርታል ሊንክ
                  size={180}
                  level={"H"}
                  includeMargin={true}
                />
                <span className="text-[10px] font-bold text-gray-500 mt-2">SCAN TO CHECK-IN / CHECK-OUT</span>
              </div>

              <button
                onClick={downloadQRCode}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-md transition flex items-center justify-center space-x-2"
              >
                <span>Download QR Code (PNG)</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;