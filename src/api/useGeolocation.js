export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("ይህ browser Location አገልግሎት አይደግፍም። እባክህ Chrome ወይም Safari ተጠቀም።"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => {
        let message = "አካባቢህን ማግኘት አልተቻለም። Location መብራቱን አረጋግጥና እንደገና ሞክር።";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Check-in ለማድረግ Location ፍቃድ ያስፈልጋል። የስልክህን Settings ውስጥ ለዚህ ገጽ ፍቃድ ስጠውና እንደገና ሞክር።";
        } else if (error.code === error.TIMEOUT) {
          message = "አካባቢህን ማግኘት ጊዜ ወስዷል። GPS/Location መብራቱን አረጋግጥና እንደገና ሞክር።";
        }
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}