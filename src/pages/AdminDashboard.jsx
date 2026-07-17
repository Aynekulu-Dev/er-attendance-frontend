import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AdminDashboard = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  // ... (እዚህ ውስጥ የቀድሞውን የአድሚን ሎጂክ እና ፎርም አስገባ)
  
  return (
    <div className="p-8">
      {!isAdminLoggedIn ? (
        /* የአድሚን መግቢያ ፎርም */
        <p>Login Page</p>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <h3 className="font-bold mb-4">Print QR Code</h3>
          {/* ሊንኩ ወደ ዋናው ፖርታል ብቻ ነው የሚጠቁመው */}
          <QRCodeSVG value="https://er-attendance-frontend.onrender.com/" size={200} />
          <p className="mt-2">ይህ QR ኮድ ቮለንቲየርን ወደ Check-in ፖርታል ይወስዳል።</p>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;