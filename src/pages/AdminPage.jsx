import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  adminLogin,
  adminLogout,
  isAdminLoggedIn,
  adminRegisterVolunteer,
  adminListVolunteers,
  adminGetAnalytics,
  adminGetAttendanceLog,
  adminExportCsv,
} from "../api/client";

// QR code always points at the volunteer check-in page (this site's root),
// wherever it happens to be deployed - so it works automatically on Render.
const VOLUNTEER_PAGE_URL = `${window.location.origin}/`;

function LoginForm({ onSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(username, password);
      onSuccess();
    } catch {
      setError("የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል።");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-sm space-y-4 border border-gray-100"
      >
        <h1 className="text-xl font-bold text-green-700 text-center">Admin Login</h1>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
        >
          {loading ? "..." : "Log in"}
        </button>
      </form>
    </div>
  );
}

function QrDownloadCard() {
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    QRCode.toDataURL(VOLUNTEER_PAGE_URL, { width: 400, margin: 2 }).then(setQrDataUrl);
  }, []);

  function download() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "ethiopia-reads-attendance-qr.png";
    link.click();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 text-center space-y-3">
      <h2 className="font-semibold text-gray-800">Wall QR Code</h2>
      {qrDataUrl ? (
        <img src={qrDataUrl} alt="Volunteer check-in QR code" className="w-48 h-48 mx-auto rounded-lg border" />
      ) : (
        <div className="w-48 h-48 mx-auto flex items-center justify-center text-gray-400">Loading...</div>
      )}
      <p className="text-xs text-gray-400 break-all">{VOLUNTEER_PAGE_URL}</p>
      <button
        onClick={download}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
      >
        Download QR Code
      </button>
      <p className="text-xs text-gray-400">አትመው ግድግዳ ላይ ለጥፍ — volunteers ይህን scan ያደርጋሉ።</p>
    </div>
  );
}

function RegisterForm({ onCreated }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [team, setTeam] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { status, message }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const data = await adminRegisterVolunteer({
        full_name: fullName,
        phone_number: phone || null,
        team: team || "General",
      });
      setFeedback({ status: "success", message: data.message });
      setFullName("");
      setPhone("");
      setTeam("");
      onCreated();
    } catch (err) {
      setFeedback({
        status: "error",
        message: err?.response?.data?.detail || "ቮለንቲየር መመዝገብ አልተቻለም።",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
      <h2 className="font-semibold text-gray-800">Register New Volunteer</h2>
      <input
        required
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <input
        placeholder="Phone number (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <input
        placeholder="Team (e.g. Reading and Literacy)"
        value={team}
        onChange={(e) => setTeam(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      {feedback && (
        <p className={`text-sm ${feedback.status === "success" ? "text-green-600" : "text-red-600"}`}>
          {feedback.message}
        </p>
      )}
      <button
        disabled={submitting}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
      >
        {submitting ? "Adding..." : "Add Volunteer"}
      </button>
    </form>
  );
}

function AnalyticsBar({ analytics }) {
  if (!analytics) return null;
  const cards = [
    { label: "Total Volunteers", value: analytics.total_volunteers },
    { label: "Checked In Today", value: analytics.today_checkins },
    { label: "Checked Out Today", value: analytics.today_checkouts },
    { label: "Certificate Eligible", value: analytics.certified_volunteers_count },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{c.value}</p>
          <p className="text-xs text-gray-500 mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

// NEW: per-checkin/checkout IP + device, so admin can spot "friend used my ID" cases.
// A red "⚠ IP changed" badge is informational only - it does NOT block anything,
// since people legitimately switch between WiFi/mobile data.
function shortenDevice(userAgent) {
  if (!userAgent) return "—";
  if (/iphone/i.test(userAgent)) return "iPhone";
  if (/android/i.test(userAgent)) return "Android";
  if (/windows/i.test(userAgent)) return "Windows PC";
  if (/macintosh/i.test(userAgent)) return "Mac";
  return userAgent.slice(0, 40) + (userAgent.length > 40 ? "…" : "");
}

function AttendanceLogTable({ log }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-left">
          <tr>
            <th className="px-4 py-2">Volunteer</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Check-In (IP / Device)</th>
            <th className="px-4 py-2">Check-Out (IP / Device)</th>
          </tr>
        </thead>
        <tbody>
          {log.map((r) => (
            <tr key={r.id} className="border-t border-gray-100 align-top">
              <td className="px-4 py-2">
                {r.full_name} <span className="text-gray-400 font-mono text-xs">({r.volunteer_id})</span>
              </td>
              <td className="px-4 py-2">{r.date}</td>
              <td className="px-4 py-2">
                {r.check_in_time ? new Date(r.check_in_time).toLocaleTimeString() : "—"}
                <br />
                <span className="text-xs text-gray-400">
                  {r.check_in_ip || "—"} · {shortenDevice(r.check_in_device)}
                </span>
              </td>
              <td className="px-4 py-2">
                {r.check_out_time ? new Date(r.check_out_time).toLocaleTimeString() : "—"}
                <br />
                <span className="text-xs text-gray-400">
                  {r.check_out_ip || "—"} · {shortenDevice(r.check_out_device)}
                </span>
                {r.ip_mismatch && (
                  <div className="text-xs text-amber-600 mt-1">⚠ IP changed since check-in</div>
                )}
              </td>
            </tr>
          ))}
          {log.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                No attendance records yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Dashboard() {
  const [volunteers, setVolunteers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [attendanceLog, setAttendanceLog] = useState([]);
  const [tab, setTab] = useState("volunteers"); // "volunteers" | "log"

  async function loadAll() {
    const [v, a, log] = await Promise.all([
      adminListVolunteers(),
      adminGetAnalytics(),
      adminGetAttendanceLog(),
    ]);
    setVolunteers(v);
    setAnalytics(a);
    setAttendanceLog(log);
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-green-700">Ethiopia Reads — Admin</h1>
        <div className="flex gap-2">
          <button
            onClick={adminExportCsv}
            className="text-sm bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Export CSV
          </button>
          <button
            onClick={() => {
              adminLogout();
              window.location.reload();
            }}
            className="text-sm bg-white border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-red-600"
          >
            Log out
          </button>
        </div>
      </div>

      <AnalyticsBar analytics={analytics} />

      <div className="grid md:grid-cols-3 gap-5">
        <div className="space-y-5 md:col-span-1">
          <QrDownloadCard />
          <RegisterForm onCreated={loadAll} />
        </div>

        <div className="md:col-span-2 space-y-3">
          <div className="flex gap-2">
            {["volunteers", "log"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tab === t ? "bg-green-600 text-white" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {t === "volunteers" ? "Volunteers" : "Attendance Log"}
              </button>
            ))}
          </div>

          {tab === "volunteers" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-left">
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Team</th>
                    <th className="px-4 py-2">Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((v) => (
                    <tr key={v.volunteer_id} className="border-t border-gray-100">
                      <td className="px-4 py-2 font-mono">{v.volunteer_id}</td>
                      <td className="px-4 py-2">{v.full_name}</td>
                      <td className="px-4 py-2">{v.team}</td>
                      <td className="px-4 py-2">
                        {v.is_eligible_for_certificate ? (
                          <span className="text-green-600">✓ Eligible</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {volunteers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                        No volunteers registered yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === "log" && <AttendanceLogTable log={attendanceLog} />}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());

  if (!loggedIn) return <LoginForm onSuccess={() => setLoggedIn(true)} />;
  return <Dashboard />;
}
