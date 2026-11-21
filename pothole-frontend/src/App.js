import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import MapComponent from "./MapComponent.js";
import SensorData from "./SensorData.js";
import AdminLogin from "./AdminLogin.js";
import AdminDashboardPage from "./AdminDashboardPage.js";
import { subscribeToPotholes, disconnectSocket } from "./api.js";
import { Button } from "@mui/material";
import "./index.css";

function HomePage({ permissionGranted, requestSensorPermission, accelerationZ, setAccelerationZ, potholes }) {
  const navigate = useNavigate();

  return (
    <div className="app-container" style={{ display: "flex" }}>
      {/* Sidebar with sensor enable button */}
      <div
        className="sidebar"
        style={{
          width: "250px",
          padding: "1rem",
          backgroundColor: "#000",
          color: "white",
          height: "100vh"
        }}
      >
        <h2>Pothole Mapping</h2>
        {!permissionGranted ? (
          <button
            onClick={requestSensorPermission}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#1e88e5",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginBottom: "1rem"
            }}
          >
            Enable Motion Sensor
          </button>
        ) : (
          <p>✅ Motion sensor enabled</p>
        )}

        <Button
          variant="contained"
          onClick={() => navigate("/admin-login")}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": { backgroundColor: "#1565c0" },
            color: "white",
          }}
        >
          Admin Dashboard
        </Button>
      </div>

      {/* Main content area */}
      <div className="main-content" style={{ flex: 1, padding: "1rem" }}>
        <h2>Live Sensor Data</h2>

        {permissionGranted && (
          <>
            <SensorData setAccelerationZ={setAccelerationZ} />
            <p>
              <b>Z-Axis Acceleration:</b>{" "}
              {typeof accelerationZ === "number" && !isNaN(accelerationZ)
                ? accelerationZ.toFixed(2)
                : "Waiting for data..."}{" "}
              m/s²
            </p>
            <MapComponent potholes={potholes} />
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const [accelerationZ, setAccelerationZ] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [potholes, setPotholes] = useState([]);

  const requestSensorPermission = async () => {
    if (permissionGranted) return;
    if (typeof DeviceMotionEvent !== "undefined" && DeviceMotionEvent.requestPermission) {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission === "granted") {
          console.log("✅ Motion sensor enabled in Chrome.");
          setPermissionGranted(true);
        } else {
          alert("Permission denied for motion sensors.");
        }
      } catch (error) {
        console.error("Error requesting permission:", error);
      }
    } else {
      console.log("✅ Motion sensor enabled (no explicit permission needed).");
      setPermissionGranted(true);
    }
  };

  const handleNewPothole = (newPotholes) => {
    console.log("📡 Received pothole data from WebSocket:", newPotholes);
    const potholeList = Array.isArray(newPotholes) ? newPotholes : [];
    setPotholes((prev = []) => {
      if (!Array.isArray(prev)) {
        console.warn("⚠ Previous pothole state invalid, resetting.");
        return potholeList;
      }
      const newEntries = potholeList.filter((p) => !prev.some((x) => x.id === p.id));
      return [...prev, ...newEntries];
    });
  };

  useEffect(() => {
    console.log("✅ Connecting to WebSocket...");
    subscribeToPotholes(handleNewPothole);

    return () => {
      console.log("● Disconnecting WebSocket...");
      disconnectSocket();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              permissionGranted={permissionGranted}
              requestSensorPermission={requestSensorPermission}
              accelerationZ={accelerationZ}
              setAccelerationZ={setAccelerationZ}
              potholes={potholes}
            />
          }
        />
        <Route path="/sensor" element={<SensorData setAccelerationZ={setAccelerationZ} />} />
        <Route path="/map" element={<MapComponent potholes={potholes} />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
