import React from "react";
import { Routes, Route } from "react-router-dom";
import VolunteerPage from "./pages/VolunteerPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<VolunteerPage />} />
      <Route path="/er-secret-portal-2026" element={<AdminPage />} />
    </Routes>
  );
}
