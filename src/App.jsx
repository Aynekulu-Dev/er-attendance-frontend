import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VolunteerPortal from './pages/VolunteerPortal';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VolunteerPortal />} />
        <Route path="/er-secret-portal-2026" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}
export default App;