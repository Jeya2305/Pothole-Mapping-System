import { useEffect } from "react";
import { API_URL } from "./api.js"; // ✅ Dynamic API URL

// ✅ Send pothole data to the backend
const sendPotholeData = (lat, lng, accelerationZ) => {
  fetch(`${API_URL}/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lat: lat,
      lng: lng,
      acceleration: accelerationZ,
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log("✅ Pothole data sent successfully:", data))
    .catch((error) => console.error("❌ Error sending pothole data:", error));
};

function SensorData({ setAccelerationZ, onPotholeDetected }) {
  useEffect(() => {
    const handleMotion = (event) => {
      if (event.accelerationIncludingGravity) {
        const zValue = event.accelerationIncludingGravity.z || 0;
        const formattedZ = parseFloat(zValue.toFixed(2));

        if (formattedZ === null || isNaN(formattedZ)) {
          console.warn("❌ Invalid accelerometer data received");
          return;
        }

        // ✅ Update Z-axis state if changed
        setAccelerationZ((prev) => (prev !== formattedZ ? formattedZ : prev));

        console.log("📡 Z-Axis Acceleration:", formattedZ);

        // 🚧 Detect pothole if Z > 10 m/s²
        if (formattedZ > 10) {
          console.warn("⚠️ Pothole detected! High Z-Axis acceleration:", formattedZ);
          // ✅ Get GPS location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`📍 Location: ${latitude}, ${longitude}`);

                // ✅ Send data to backend
                sendPotholeData(latitude, longitude, formattedZ);

                // ✅ Notify parent component if needed
                if (onPotholeDetected) {
                  onPotholeDetected({
                    accelerationZ: formattedZ,
                    lat: latitude,
                    lng: longitude,
                  });
                }
              },
              (error) => {
                console.error("❌ Error getting location:", error);
              }
            );
          } else {
            console.warn("❌ Geolocation is NOT supported!");
          }
        }
      }
    };
    // ✅ Attach motion listener
    if ("DeviceMotionEvent" in window) {
      window.addEventListener("devicemotion", handleMotion);
      console.log("✅ DeviceMotionEvent listener added.");
    } else {
      console.warn("❌ DeviceMotionEvent is NOT supported in this browser.");
    }
    // ✅ Cleanup on unmount
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      console.log("🔴 DeviceMotionEvent listener removed.");
    };
  }, [setAccelerationZ, onPotholeDetected]);

  return null; // ✅ No visual UI
}
export default SensorData;
 
