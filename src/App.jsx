import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VolunteerPortal from './pages/VolunteerPortal';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Check-In / Out Portal */}
        <Route path="/" element={<VolunteerPortal />} />
        {/* Admin Secret Portal */}
        <Route path="/er-secret-portal-2026" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}
export default App;