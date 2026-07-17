import React, { useState } from 'react';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://er-attendance-backend.onrender.com/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData)
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('admin_token', data.access_token);
        window.location.href = '/er-secret-portal-2026';
      } else {
        alert("Login failed! Check credentials.");
      }
    } catch (err) { alert("Connection error!"); }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <input className="w-full p-3 border rounded mb-3" placeholder="Username" onChange={e => setFormData({...formData, username: e.target.value})} />
        <input className="w-full p-3 border rounded mb-6" type="password" placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} />
        <button className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700">Login</button>
      </form>
    </div>
  );
};
export default Login;