export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("የዚህ መሳሪያ browser የ Location አገልግሎት አይደግፍም።"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => {
        let message = "አካባቢህን ማግኘት አልተቻለም።";
        if (error.code === error.PERMISSION_DENIED) {
          message = "እባክህ የLocation ፍቃድ (permission) ስጥ፣ Check-in/Check-out ለማድረግ ያስፈልጋል።";
        } else if (error.code === error.TIMEOUT) {
          message = "የLocation ጥያቄው ጊዜው አልፏል፣ እንደገና ሞክር።";
        }
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}
