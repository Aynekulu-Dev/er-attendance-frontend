import React, { useState } from "react";
import { recordAttendance } from "../api/client";
import { getCurrentPosition } from "../api/useGeolocation";

export default function VolunteerPage() {
  const [volunteerId, setVolunteerId] = useState("");
  const [loadingAction, setLoadingAction] = useState(null); // "in" | "out" | null
  const [result, setResult] = useState(null); // { status: "success"|"error", message }

  async function handleAction(action) {
    if (!volunteerId.trim()) {
      setResult({ status: "error", message: "እባክህ የቮለንቲየር መታወቂያ (ID) አስገባ።" });
      return;
    }

    setLoadingAction(action);
    setResult(null);
    try {
      const position = await getCurrentPosition();
      const data = await recordAttendance({
        volunteer_id: volunteerId.trim().toUpperCase(),
        user_lat: position.latitude,
        user_lon: position.longitude,
        action: action === "in" ? "check-in" : "check-out",
      });
      setResult({ status: data.status, message: data.message });
    } catch (err) {
      const message =
        err?.response?.data?.detail || err?.message || "ችግር ተፈጥሯል፣ እንደገና ሞክር።";
      setResult({ status: "error", message });
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-green-700">Ethiopia Reads</h1>
          <p className="text-gray-500 mt-1">Volunteer Attendance</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Volunteer ID
            </label>
            <input
              autoFocus
              value={volunteerId}
              onChange={(e) => setVolunteerId(e.target.value)}
              placeholder="e.g. ER-001"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg tracking-wide text-center focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction("in")}
              disabled={loadingAction !== null}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
            >
              {loadingAction === "in" ? "..." : "Check In"}
            </button>
            <button
              onClick={() => handleAction("out")}
              disabled={loadingAction !== null}
              className="bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
            >
              {loadingAction === "out" ? "..." : "Check Out"}
            </button>
          </div>

          {result && (
            <p
              className={`text-center text-sm font-medium rounded-lg py-2 px-3 ${
                result.status === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {result.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
