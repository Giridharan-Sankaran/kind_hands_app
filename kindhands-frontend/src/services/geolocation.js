// src/services/geolocation.js
// Thin promise wrapper around the browser's native Geolocation API. Uses
// on-device GPS/Wi-Fi positioning, which needs the user's permission but
// no server-side maps API key.
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location isn't available in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (err) => reject(new Error(err.message || "We couldn't get your location. Please check your browser permissions.")),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
