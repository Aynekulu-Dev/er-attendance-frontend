import React, { useState } from "react";
import { recordAttendance } from "../api/client";
import { getCurrentPosition } from "../api/useGeolocation";
import BrandMark from "../components/BrandMark";
import { detectInAppBrowser, isAndroid, isIOS } from "../api/inAppBrowser";

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#EAF1EB" />
      <path d="M6 10.5l2.5 2.5 5.5-6" stroke="#163F2A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#F8EBE7" />
      <path d="M10 6v5" stroke="#A8402F" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="13.5" r="1" fill="#A8402F" />
    </svg>
  );
}

// Telegram/Facebook/Instagram/Messenger ወዘተ in-app browser ውስጥ ሆነህ ስትከፍት፣
// navigator.geolocation ብዙ ጊዜ silently ይወድቃል (system permission popup ራሱ
// አይመጣም)። ስለዚህ Check-in ከመሞከሩ በፊት ግልፅ ማሳሰቢያ እናሳያለን፣ "Open in Browser"
// button ጭምር።
function OpenInBrowserBanner({ appName }) {
  const androidIntentUrl = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.android.chrome;end`;

  function handleOpenInBrowser() {
    if (isAndroid()) {
      // Chrome ን በቀጥታ በ intent:// ስንከፍት አብዛኛዎቹ Android in-app browsers ይህን ይደግፋሉ
      window.location.href = androidIntentUrl;
    }
    // iOS ላይ automatic redirect የለም - WebView ራሱ አይፈቅድም። ከታች ያለውን መመሪያ ይከተል።
  }

  return (
    <div className="bg-sand/30 border border-sand rounded-xl p-3.5 mb-5 text-sm text-ink space-y-2">
      <p className="font-semibold text-brick">
        {appName ? `${appName} ውስጥ ከፍተኸዋል` : "In-app browser ውስጥ ከፍተኸዋል"} - Location ላይሰራ ይችላል
      </p>
      <p className="text-slate">
        Check-in/Check-out ለመስራት Location ፍቃድ ያስፈልጋል፣ ግን ይህ አይነት browser ብዙ ጊዜ
        አይፈቅድም። እባክህ፦
      </p>
      <ul className="list-disc list-inside text-slate space-y-0.5">
        {isIOS() ? (
          <li>
            ከላይ ቀኝ ጥግ ላይ ያለውን <span className="font-medium text-ink">⋯ (ሶስት ነጥብ)</span> ወይም{" "}
            <span className="font-medium text-ink">↗ (share)</span> ምልክት ተጫንና{" "}
            <span className="font-medium text-ink">"Open in Safari"</span> ምረጥ
          </li>
        ) : (
          <li>
            ከላይ ቀኝ ጥግ ላይ ያለውን <span className="font-medium text-ink">⋯ (ሶስት ነጥብ)</span> ምልክት ተጫንና{" "}
            <span className="font-medium text-ink">"Open in Chrome"</span> ወይም{" "}
            <span className="font-medium text-ink">"Open in browser"</span> ምረጥ
          </li>
        )}
        <li>ወይም ገፁን link ኮፒ አድርገህ Chrome/Safari ራሱ ውስጥ ከፍተው</li>
      </ul>
      {isAndroid() && (
        <button
          onClick={handleOpenInBrowser}
          className="w-full mt-1 bg-white border border-sand text-ink font-medium text-sm py-2 rounded-lg hover:bg-forest-light transition"
        >
          Chrome ላይ ክፈት
        </button>
      )}
    </div>
  );
}

export default function VolunteerPage() {
  const [volunteerId, setVolunteerId] = useState("");
  const [loadingAction, setLoadingAction] = useState(null); // "in" | "out" | null
  const [result, setResult] = useState(null); // { status: "success"|"error", message }
  const [{ isInApp, appName }] = useState(() => detectInAppBrowser());

  async function handleAction(action) {
    if (!volunteerId.trim()) {
      setResult({ status: "error", message: "የቮለንቲየር መታወቂያህን (ID) አስገባ፣ ለምሳሌ ER-001።" });
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
      let message =
        err?.response?.data?.detail ||
        err?.message ||
        "ግንኙነት ላይ ችግር ተፈጥሯል። ኢንተርኔትህን አረጋግጥና እንደገና ሞክር።";

      // Location permission ላይ ካልተፈቀደ እና in-app browser ውስጥ ከሆነ፣ ምክንያቱን
      // የበለጠ ግልፅ እናድርገው - user popup ሳያይ ተከልክሎ ስለሚሆን ግራ ይጋባል።
      const isPermissionError = /Location ፍቃድ ያስፈልጋል|PERMISSION_DENIED/i.test(message);
      if (isPermissionError && isInApp) {
        message = `${message} (${appName || "ይህ"} ውስጥ browser ስለሆንክ ሊሆን ይችላል - ከላይ ያለውን መመሪያ ተከተል።)`;
      }

      setResult({ status: "error", message });
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-paper bg-dot-grid">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-7">
          <BrandMark size={52} className="mb-3" />
          <h1 className="font-display font-semibold text-[26px] text-ink leading-tight">
            Ethiopia Reads
          </h1>
          <p className="text-slate text-xs font-medium tracking-[0.14em] uppercase mt-1">
            Volunteer attendance
          </p>
        </div>

        {isInApp && <OpenInBrowserBanner appName={appName} />}

        <div className="bg-white rounded-2xl shadow-sm border border-sand p-7 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Volunteer ID
            </label>
            <input
              autoFocus
              value={volunteerId}
              onChange={(e) => setVolunteerId(e.target.value)}
              placeholder="ER-001"
              className="w-full rounded-lg border border-sand px-4 py-3 text-lg tracking-wide text-center font-medium text-ink placeholder:text-slate/50 focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleAction("in")}
              disabled={loadingAction !== null}
              className="bg-forest hover:bg-forest-dark active:scale-[0.98] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:active:scale-100"
            >
              {loadingAction === "in" ? "…" : "Check in"}
            </button>
            <button
              onClick={() => handleAction("out")}
              disabled={loadingAction !== null}
              className="bg-white hover:bg-forest-light active:scale-[0.98] text-ink font-semibold py-3 rounded-lg border border-sand transition disabled:opacity-50 disabled:active:scale-100"
            >
              {loadingAction === "out" ? "…" : "Check out"}
            </button>
          </div>

          {result && (
            <div
              className={`flex items-start gap-2 text-sm font-medium rounded-lg py-2.5 px-3 ${
                result.status === "success"
                  ? "bg-forest-light text-forest-dark"
                  : "bg-brick-light text-brick"
              }`}
            >
              {result.status === "success" ? <CheckIcon /> : <AlertIcon />}
              <span className="pt-0.5">{result.message}</span>
            </div>
          )}
        </div>

        <p className="text-center text-slate text-xs mt-6">
          መሳሪያህ ላይ Location ፍቃድ (permission) ያስፈልጋል።
        </p>
      </div>
    </div>
  );
}