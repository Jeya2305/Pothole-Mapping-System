import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { fetchPotholes, subscribeToPotholes } from "./api.js";
import L from "leaflet";
import { getDistance } from "geolib";

// Marker icons based on severity
const icons = {
  green: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  yellow: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  red: new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
};

// Invisible marker icon
const invisibleIcon = new L.DivIcon({
  className: "",
  html: "",
  iconSize: [0, 0],
});

function RecenterMap({ location }) {
  const map = useMap();
  const lastLocation = useRef(null);

  useEffect(() => {
    if (
      location &&
      (!lastLocation.current ||
        location.lat !== lastLocation.current.lat ||
        location.lng !== lastLocation.current.lng)
    ) {
      map.setView([location.lat, location.lng], 15, { animate: true });
      lastLocation.current = location;
    }
  }, [location, map]);

  return null;
}

function LocationClickMarker({ onClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onClick({ lat, lng });
    },
  });
  return null;
}

function MapComponent() {
  const [potholes, setPotholes] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const userMarkerRef = useRef();
  const coimbatoreCoords = { lat: 11.0168, lng: 76.9558 };
  const shownAlertsRef = useRef(new Set());

  const updateLocation = useCallback((position) => {
    const { latitude, longitude } = position.coords;
    setLocation({ lat: latitude, lng: longitude });
    setLocationDenied(false);
    console.log("📍 Updated location:", latitude, longitude);
  }, []);

  const requestLocationAccess = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        updateLocation,
        (error) => {
          console.error("⚠ Location error:", error);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationDenied(true);
            alert("⚠ Location access denied. Please enable GPS and allow browser access.");
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("❌ Geolocation not supported by this browser.");
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        updateLocation,
        (error) => {
          console.error("⚠ Watch error:", error);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationDenied(true);
          }
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [updateLocation]);

  const loadPotholes = async () => {
    try {
      const data = await fetchPotholes();
      setPotholes(data.filter((p) => p.lat && p.lng));
    } catch (error) {
      console.error("❌ Failed to fetch potholes:", error);
      setPotholes([]);
    }
  };

  useEffect(() => {
    loadPotholes();
    const unsubscribe = subscribeToPotholes((newList) => {
      if (Array.isArray(newList)) {
        setPotholes(newList.filter((p) => p.lat && p.lng));
      }
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // 🚨 Real-time proximity alert logic
  useEffect(() => {
    const interval = setInterval(() => {
      if (!location || !potholes.length) return;

      potholes.forEach((p) => {
        const potholeId = p.id;
        const distance = getDistance(
          { latitude: location.lat, longitude: location.lng },
          { latitude: p.lat, longitude: p.lng }
        );

        if (distance <= 30 && !shownAlertsRef.current.has(potholeId)) {
          alert(`⚠️ Caution! Pothole ahead within ${distance} meters.`);
          shownAlertsRef.current.add(potholeId);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [location, potholes]);

  return (
    <div style={{ textAlign: "center" }}>
      <button onClick={loadPotholes} style={{ marginBottom: "10px" }}>
        🔄 Refresh Potholes
      </button>

      {!location && !locationDenied && (
        <button
          onClick={requestLocationAccess}
          style={{
            marginBottom: "10px",
            backgroundColor: "red",
            color: "white",
            padding: "10px",
            border: "none",
            cursor: "pointer",
          }}
        >
          📍 Request Location Access
        </button>
      )}

      <MapContainer
        center={coimbatoreCoords}
        zoom={13}
        style={{ height: "80vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <LocationClickMarker
          onClick={(pos) => {
            if (
              !location ||
              pos.lat.toFixed(5) !== location.lat.toFixed(5) ||
              pos.lng.toFixed(5) !== location.lng.toFixed(5)
            ) {
              setClickedLocation(pos);
            } else {
              if (userMarkerRef.current) {
                userMarkerRef.current.openPopup();
              }
            }
          }}
        />

        {clickedLocation && (
          <Marker
            position={[clickedLocation.lat, clickedLocation.lng]}
            icon={invisibleIcon}
          >
            <Popup>
              📌 <strong>Clicked Location</strong> <br />
              Lat: {clickedLocation.lat.toFixed(6)} <br />
              Lng: {clickedLocation.lng.toFixed(6)}
            </Popup>
          </Marker>
        )}

        {location && (
          <>
            <Circle
              center={[location.lat, location.lng]}
              pathOptions={{
                color: "blue",
                fillColor: "blue",
                fillOpacity: 0.3,
              }}
              radius={50}
              eventHandlers={{
                click: () => {
                  if (userMarkerRef.current) {
                    userMarkerRef.current.openPopup();
                  }
                },
              }}
            />
            <Marker
              position={[location.lat, location.lng]}
              icon={invisibleIcon}
              ref={userMarkerRef}
            >
              <Popup>
                📍 <strong>Your Location</strong> <br />
                Lat: {location.lat.toFixed(6)} <br />
                Lng: {location.lng.toFixed(6)}
              </Popup>
            </Marker>
          </>
        )}

        {potholes.map((p) => {
          const severity = p.severity?.toLowerCase() || "green";
          return (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={icons[severity] || icons.green}
            >
              <Popup>
                <strong>Pothole</strong> <br />
                Severity: {severity.toUpperCase()} <br />
                Acceleration: {p.acceleration?.toFixed(2)} m/s²
              </Popup>
            </Marker>
          );
        })}

        {location && <RecenterMap location={location} />}
      </MapContainer>

      {locationDenied && (
        <p style={{ color: "red" }}>
          ⚠ Location access denied. Please enable location permissions.
        </p>
      )}
    </div>
  );
}

export default MapComponent;
