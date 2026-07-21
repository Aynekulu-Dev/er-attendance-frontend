import axios from "axios";

// Production ላይ Render backend URL ን ይጠቀማል (.env.production)
// Local ላይ ስትሰራ localhost:8000 ይጠቀማል (.env.development)
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// admin login ካደረገ በኋላ token ን localStorage ውስጥ እናስቀምጣለን፣
// እያንዳንዱ admin request ላይ በራሱ Authorization header ይጨመራል።
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("er_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- PUBLIC: Volunteer check-in / check-out ---
export const recordAttendance = ({ volunteer_id, user_lat, user_lon, action }) =>
  api
    .post("/api/attendance", { volunteer_id, user_lat, user_lon, action })
    .then((r) => r.data);

// --- ADMIN: login (OAuth2PasswordRequestForm ስለሆነ form-urlencoded መላክ አለበት) ---
export const adminLogin = (username, password) => {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);
  return api
    .post("/api/admin/login", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    .then((r) => {
      localStorage.setItem("er_admin_token", r.data.access_token);
      return r.data;
    });
};

export const adminLogout = () => localStorage.removeItem("er_admin_token");
export const isAdminLoggedIn = () => Boolean(localStorage.getItem("er_admin_token"));

export const adminRegisterVolunteer = (payload) =>
  api.post("/api/volunteers", payload).then((r) => r.data);

export const adminListVolunteers = () => api.get("/api/volunteers").then((r) => r.data);

// NEW: admin dashboard "edit volunteer" - sends only the fields that were
// actually changed (see AdminPage's inline edit row), backend ignores
// anything left unset so it won't overwrite other fields with nulls.
export const adminUpdateVolunteer = (volunteerId, updates) =>
  api.patch(`/api/volunteers/${volunteerId}`, updates).then((r) => r.data);

export const adminGetAnalytics = () => api.get("/api/admin/analytics").then((r) => r.data);

// NEW: full attendance log with IP/device per check-in & check-out (anti-fraud review)
export const adminGetAttendanceLog = () => api.get("/api/admin/attendance-log").then((r) => r.data);

// Backend's admin endpoints only check the Authorization header (not a query
// param), so a plain <a href="..."> download link can't authenticate. We
// fetch the file as a blob (interceptor above attaches the token) and then
// trigger the browser's save dialog manually.
//
// NOTE: this used to fail silently if the request errored (e.g. no data yet,
// expired token) - clicking the button just did nothing with no feedback.
// Now we always throw a friendly message so the caller (AdminPage) can show it.
export const adminExportCsv = async () => {
  try {
    const response = await api.get("/api/admin/export-csv", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "attendance.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    if (err?.response?.status === 404) {
      throw new Error("እስካሁን የተመዘገበ የመገኘት (attendance) ዳታ የለም።");
    }
    if (err?.response?.status === 401) {
      throw new Error("የ admin session ጊዜው አልቋል። እባክህ እንደገና ግባ (log in)።");
    }
    // err.response.data is a Blob here (responseType: "blob"), so we can't
    // read err.response.data.detail directly - fall back to a generic message.
    throw new Error("CSV ማውጣት አልተሳካም። ደግመህ ሞክር፣ ችግር ከቀጠለ ገፁን አድስ (refresh)።");
  }
};