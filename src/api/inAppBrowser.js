// Detects when the page is running inside an in-app WebView (Telegram,
// Facebook, Instagram, Messenger, TikTok, Line, etc.) instead of a real
// browser (Safari/Chrome). These WebViews often block or silently fail
// navigator.geolocation, which breaks Check-in/Check-out with no visible
// permission prompt to the user.
export function detectInAppBrowser() {
  const ua = navigator.userAgent || navigator.vendor || window.opera || "";

  const patterns = [
    { name: "Telegram", regex: /Telegram/i },
    { name: "Facebook", regex: /FBAN|FBAV|FB_IAB|FBIOS/i },
    { name: "Instagram", regex: /Instagram/i },
    { name: "Messenger", regex: /Messenger/i },
    { name: "TikTok", regex: /TikTok|musical_ly|BytedanceWebview/i },
    { name: "Line", regex: /Line\//i },
    { name: "WeChat", regex: /MicroMessenger/i },
    { name: "Snapchat", regex: /Snapchat/i },
    { name: "Twitter/X", regex: /Twitter/i },
  ];

  for (const { name, regex } of patterns) {
    if (regex.test(ua)) {
      return { isInApp: true, appName: name };
    }
  }
  return { isInApp: false, appName: null };
}

export function isAndroid() {
  const ua = navigator.userAgent || "";
  return /android/i.test(ua);
}

export function isIOS() {
  const ua = navigator.userAgent || "";
  return /iphone|ipad|ipod/i.test(ua);
}