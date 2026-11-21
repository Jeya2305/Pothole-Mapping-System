import React, { useState } from "react";
import SensorData from "./SensorData.js";
import MapComponent from "./MapComponent.js";

function UserDashboard() {
  const [accelerationZ, setAccelerationZ] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestSensorPermission = async () => {
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEvent.requestPermission === "function"
    ) {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission === "granted") {
          setPermissionGranted(true);
          console.log("✅ Motion sensor permission granted");
        } else {
          alert("❌ Motion sensor permission denied");
        }
      } catch (error) {
        console.error("Error requesting permission:", error);
      }
    } else {
      console.log("✅ Motion sensor permission not required");
      setPermissionGranted(true);
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar p-4 bg-gray-100 shadow-md">
        <h2 className="text-xl font-bold mb-4">Pothole Mapping</h2>
        {!permissionGranted ? (
          <button onClick={requestSensorPermission} className="btn bg-blue-500 text-white px-4 py-2 rounded">
            Enable Motion Sensor
          </button>
        ) : (
          <p className="text-green-600">✅ Motion sensor enabled</p>
        )}
      </div>

      <div className="main-content p-4">
        <h2 className="text-xl font-semibold mb-4">Live Sensor Data</h2>
        {permissionGranted && (
          <>
            <SensorData setAccelerationZ={setAccelerationZ} />
            <p className="mb-4">
              <b>Z-Axis Acceleration:</b>{" "}
              {typeof accelerationZ === "number" && !isNaN(accelerationZ)
                ? accelerationZ.toFixed(2)
                : "Waiting for data..."}{" "}
              m/s²
            </p>
            <MapComponent />
          </>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
