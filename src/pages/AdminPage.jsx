import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import BrandMark from "../components/BrandMark";
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

// Backend timestamps (check_in_time / check_out_time) are always generated
// with datetime.utcnow() and serialized WITHOUT a timezone suffix
// (e.g. "2026-07-18T04:28:51.123456"). When a string like that is handed to
// `new Date(...)`, JavaScript assumes it's already in the browser's LOCAL
// timezone (per the ECMAScript spec) - so no conversion happens and the raw
// UTC numbers get displayed as if they were local time. Since Ethiopia is
// UTC+3, this made every check-in/check-out show ~3 hours earlier than the
// real local time.
//
// Fix: explicitly mark the string as UTC (append "Z") before parsing, so the
// browser correctly converts it to the viewer's local timezone.
function formatLocalTime(isoString) {
  if (!isoString) return "—";
  const utcString = isoString.endsWith("Z") ? isoString : `${isoString}Z`;
  const d = new Date(utcString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString();
}

function formatLocalDate(isoString) {
  if (!isoString) return "—";
  const utcString = isoString.endsWith("Z") ? isoString : `${isoString}Z`;
  const d = new Date(utcString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

const inputClass =
  "w-full rounded-lg border border-sand px-3.5 py-2.5 text-sm text-ink placeholder:text-slate/60 focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest transition";

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
    } catch (err) {
      setError(err?.response?.data?.detail || "የተጠቃሚ ስም ወይም የይለፍ ቃል ትክክል አይደለም። እንደገና ሞክር።");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper bg-dot-grid">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-sm space-y-5 border border-sand"
      >
        <div className="flex flex-col items-center text-center">
          <BrandMark size={44} className="mb-3" />
          <h1 className="font-display font-semibold text-xl text-ink">Admin login</h1>
          <p className="text-slate text-xs mt-1">Ethiopia Reads attendance</p>
        </div>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputClass}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {error && <p className="text-sm text-brick">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-forest hover:bg-forest-dark active:scale-[0.98] text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
        >
          {loading ? "…" : "Log in"}
        </button>
      </form>
    </div>
  );
}

function QrDownloadCard() {
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    QRCode.toDataURL(VOLUNTEER_PAGE_URL, {
      width: 400,
      margin: 2,
      color: { dark: "#20261F", light: "#FFFFFF" },
    }).then(setQrDataUrl);
  }, []);

  function download() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "ethiopia-reads-attendance-qr.png";
    link.click();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sand p-5 text-center space-y-3">
      <h2 className="font-semibold text-ink text-sm">Wall QR code</h2>
      {qrDataUrl ? (
        <img src={qrDataUrl} alt="Volunteer check-in QR code" className="w-48 h-48 mx-auto rounded-lg border border-sand" />
      ) : (
        <div className="w-48 h-48 mx-auto flex items-center justify-center text-slate text-sm">Loading…</div>
      )}
      <p className="text-xs text-slate break-all">{VOLUNTEER_PAGE_URL}</p>
      <button
        onClick={download}
        className="w-full bg-forest hover:bg-forest-dark active:scale-[0.98] text-white font-semibold py-2 rounded-lg transition"
      >
        Download QR code
      </button>
      <p className="text-xs text-slate">አትመው ግድግዳ ላይ ለጥፍ — volunteers ይህን scan ያደርጋሉ።</p>
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
        message:
          err?.response?.data?.detail || "ቮለንቲየር መመዝገብ አልተቻለም። ስሙ በትክክል መግባቱን አረጋግጥና እንደገና ሞክር።",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-sand p-5 space-y-3">
      <h2 className="font-semibold text-ink text-sm">Register new volunteer</h2>
      <input
        required
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className={inputClass}
      />
      <input
        placeholder="Phone number (optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className={inputClass}
      />
      <input
        placeholder="Team (e.g. Reading and Literacy)"
        value={team}
        onChange={(e) => setTeam(e.target.value)}
        className={inputClass}
      />
      {feedback && (
        <p className={`text-sm ${feedback.status === "success" ? "text-forest-dark" : "text-brick"}`}>
          {feedback.message}
        </p>
      )}
      <button
        disabled={submitting}
        className="w-full bg-forest hover:bg-forest-dark active:scale-[0.98] text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
      >
        {submitting ? "Adding…" : "Add volunteer"}
      </button>
    </form>
  );
}

function AnalyticsBar({ analytics }) {
  if (!analytics) return null;
  const cards = [
    { label: "Total volunteers", value: analytics.total_volunteers },
    { label: "Checked in today", value: analytics.today_checkins },
    { label: "Checked out today", value: analytics.today_checkouts },
    { label: "Certificate eligible", value: analytics.certified_volunteers_count },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl border border-sand shadow-sm p-4 text-center">
          <p className="text-2xl font-display font-semibold text-forest">{c.value}</p>
          <p className="text-xs text-slate mt-1">{c.label}</p>
        </div>
      ))}
      <div
        className={`rounded-xl border shadow-sm p-4 text-center ${
          analytics.suspicious_checkins_today > 0
            ? "bg-gold-light border-gold/40"
            : "bg-white border-sand"
        }`}
        title="Same phone used to check in more than one volunteer ID within a short time window - review only, nothing is blocked"
      >
        <p className={`text-2xl font-display font-semibold ${analytics.suspicious_checkins_today > 0 ? "text-gold" : "text-ink"}`}>
          {analytics.suspicious_checkins_today}
        </p>
        <p className="text-xs text-slate mt-1">Flagged for review</p>
      </div>
    </div>
  );
}

// Same phone used to check in more than one volunteer within a short time
// window (see SHARED_DEVICE_WINDOW_MINUTES in the backend .env).
// This never blocks anything - siblings legitimately sharing one phone would
// otherwise look identical to "used a friend's ID" - the admin decides.
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
    <div className="bg-white rounded-2xl shadow-sm border border-sand overflow-hidden h-fit">
      <table className="w-full text-sm">
        <thead className="bg-forest-light text-slate text-left">
          <tr>
            <th className="px-4 py-2.5 font-medium">Volunteer</th>
            <th className="px-4 py-2.5 font-medium">Date</th>
            <th className="px-4 py-2.5 font-medium">Check-in (IP / device)</th>
            <th className="px-4 py-2.5 font-medium">Check-out (IP / device)</th>
          </tr>
        </thead>
        <tbody>
          {log.map((r) => (
            <tr key={r.id} className="border-t border-sand align-top">
              <td className="px-4 py-2.5">
                {r.full_name} <span className="text-slate font-mono text-xs">({r.volunteer_id})</span>
                {r.shared_device_flag && (
                  <div className="text-xs text-gold font-medium mt-1">◆ Shared device (same time)</div>
                )}
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap">{formatLocalDate(r.check_in_time) || r.date}</td>
              <td className="px-4 py-2.5">
                {formatLocalTime(r.check_in_time)}
                <br />
                <span className="text-xs text-slate">
                  {r.check_in_ip || "—"} · {shortenDevice(r.check_in_device)}
                </span>
              </td>
              <td className="px-4 py-2.5">
                {formatLocalTime(r.check_out_time)}
                <br />
                <span className="text-xs text-slate">
                  {r.check_out_ip || "—"} · {shortenDevice(r.check_out_device)}
                </span>
                {r.ip_mismatch && (
                  <div className="text-xs text-gold mt-1">⚠ IP changed since check-in</div>
                )}
              </td>
            </tr>
          ))}
          {log.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate">
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
  const [exportError, setExportError] = useState("");
  const [exporting, setExporting] = useState(false);

  async function handleExportCsv() {
    setExportError("");
    setExporting(true);
    try {
      await adminExportCsv();
    } catch (err) {
      setExportError(err?.message || "CSV ማውጣት አልተሳካም። ደግመህ ሞክር።");
    } finally {
      setExporting(false);
    }
  }

  async function loadAll() {
    // Promise.allSettled ን እንጠቀማለን (Promise.all ሳይሆን) - ስለዚህ ከ3ቱ
    // 1ኛው ቢወድቅ (ለምሳሌ attendance-log ገና migration ካልተደረገ) ሌሎቹ
    // (volunteers, analytics) አሁንም ይታደሳሉ።
    const [vResult, aResult, logResult] = await Promise.allSettled([
      adminListVolunteers(),
      adminGetAnalytics(),
      adminGetAttendanceLog(),
    ]);

    if (vResult.status === "fulfilled") {
      setVolunteers(vResult.value);
    } else {
      console.error("Failed to load volunteers:", vResult.reason);
    }

    if (aResult.status === "fulfilled") {
      setAnalytics(aResult.value);
    } else {
      console.error("Failed to load analytics:", aResult.reason);
    }

    if (logResult.status === "fulfilled") {
      setAttendanceLog(logResult.value);
    } else {
      console.error("Failed to load attendance log:", logResult.reason);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="min-h-screen px-4 py-8 max-w-5xl mx-auto bg-paper">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BrandMark size={38} />
          <div>
            <h1 className="font-display font-semibold text-xl text-ink leading-tight">Ethiopia Reads</h1>
            <p className="text-xs text-slate">Admin dashboard</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="text-sm bg-white border border-sand px-3.5 py-2 rounded-lg hover:bg-forest-light transition text-ink font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? "በማውጣት ላይ…" : "Export CSV"}
          </button>
          <button
            onClick={() => {
              adminLogout();
              window.location.reload();
            }}
            className="text-sm bg-white border border-sand px-3.5 py-2 rounded-lg hover:bg-brick-light transition text-brick font-medium"
          >
            Log out
          </button>
        </div>
      </div>

      {exportError && (
        <div className="mb-6 -mt-3 text-sm text-brick bg-brick-light border border-brick/30 rounded-lg px-3.5 py-2">
          {exportError}
        </div>
      )}

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
                  tab === t ? "bg-forest text-white" : "bg-white text-ink border border-sand hover:bg-forest-light"
                }`}
              >
                {t === "volunteers" ? "Volunteers" : "Attendance log"}
              </button>
            ))}
          </div>

          {tab === "volunteers" && (
            <div className="bg-white rounded-2xl shadow-sm border border-sand overflow-hidden h-fit">
              <table className="w-full text-sm">
                <thead className="bg-forest-light text-slate text-left">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">ID</th>
                    <th className="px-4 py-2.5 font-medium">Name</th>
                    <th className="px-4 py-2.5 font-medium">Team</th>
                    <th className="px-4 py-2.5 font-medium">Certificate</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((v) => (
                    <tr key={v.volunteer_id} className="border-t border-sand">
                      <td className="px-4 py-2.5 font-mono text-ink">{v.volunteer_id}</td>
                      <td className="px-4 py-2.5 text-ink">{v.full_name}</td>
                      <td className="px-4 py-2.5 text-slate">{v.team}</td>
                      <td className="px-4 py-2.5">
                        {v.is_eligible_for_certificate ? (
                          <span className="text-forest-dark font-medium">✓ Eligible</span>
                        ) : (
                          <span className="text-slate">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {volunteers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate">
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