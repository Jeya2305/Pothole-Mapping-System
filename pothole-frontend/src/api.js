
import { io } from "socket.io-client";

// ✅ Dynamically determine API URL
const API_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === "localhost"
    ? "https://localhost:443"
    : `https://${window.location.hostname}:443`);

console.log(`🚀 Connecting to API at: ${API_URL}`);

// ✅ WebSocket Configuration
const socket = io(API_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 3000,
  secure: true,
  rejectUnauthorized: false, // Allow self-signed SSL (Local Testing)
  autoConnect: false, // Start only when needed
});

// ✅ Connect WebSocket
export function connectSocket() {
  if (!socket.connected) {
    socket.connect();
    console.log("🔄 Attempting WebSocket connection...");
  }
}

// ✅ Disconnect WebSocket
export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
    console.log("🔌 WebSocket disconnected.");
  }
}

// ✅ Fetch pothole data from API
export async function fetchPotholes() {
  try {
    const response = await fetch(`${API_URL}/potholes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    return Array.isArray(data) ? data : data.potholes || [];
  } catch (error) {
    console.error("❌ Error fetching potholes:", error);
    return [];
  }
}

// ✅ Subscribe to pothole updates (WebSockets)
export function subscribeToPotholes(updateCallback) {
  socket.removeAllListeners("all_potholes");

  socket.on("all_potholes", (potholes) => {
    console.log("📡 Received pothole updates:", potholes);

    if (Array.isArray(potholes)) {
      updateCallback((prev) => {
        const newPotholes = potholes.filter((p) => !prev.some((x) => x.id === p.id));
        return [...prev, ...newPotholes];
      });
    } else {
      console.warn("⚠ Unexpected pothole format:", potholes);
    }
  });

  // ✅ Handle WebSocket events
  socket.on("connect", () => console.log("✅ Connected to WebSocket"));
  socket.on("disconnect", (reason) => {
    console.warn("⚠ WebSocket disconnected:", reason);
    setTimeout(connectSocket, 3000); // Retry connection
  });
  socket.on("connect_error", (err) => {
    console.error("❌ WebSocket error:", err);
    setTimeout(connectSocket, 3000);
  });

  connectSocket(); // Start WebSocket connection
}

// ✅ Export API_URL so it can be used in SensorData.js
export { API_URL };
