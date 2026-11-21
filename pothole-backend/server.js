require("dotenv").config({ path: "./.env" });

const fs = require("fs");
const https = require("https");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const KalmanFilter = require("kalmanjs");
const { Server } = require("socket.io");
const mysql = require("mysql2/promise");
const asyncHandler = require("express-async-handler");

const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 443;

// ✅ SSL
let options;
try {
    options = {
        key: fs.readFileSync("key.pem"),
        cert: fs.readFileSync("cert.crt"),
    };
} catch (error) {
    console.error("❌ SSL Certificates Missing!");
    process.exit(1);
}

// ✅ CORS
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : ["https://localhost:3000"];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn("❌ CORS Not Allowed:", origin);
            callback(new Error("CORS Not Allowed"));
        }
    },
    credentials: true,
}));

// ✅ Middleware
app.use(express.json());
app.use(bodyParser.json());

// ✅ MySQL Pool
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

let pool;
let io;

// ✅ Kalman Filter
const applyKalmanFilter = (value) => {
    const kf = new KalmanFilter();
    return kf.filter(value);
};

// ✅ DB Connection
const createDBConnection = async () => {
    try {
        pool = mysql.createPool(dbConfig);
        const conn = await pool.getConnection();
        console.log("✅ MySQL connected!");
        conn.release();

        pool.on("error", async (err) => {
            console.error("❌ DB connection lost:", err.message);
            setTimeout(createDBConnection, 5000);
        });
    } catch (err) {
        console.error("❌ DB connection failed:", err.message);
        setTimeout(createDBConnection, 5000);
    }
};

// ✅ Auth Routes
app.use("/auth", (req, res, next) => {
    req.db = pool; // Make db pool accessible to auth.js
    next();
}, authRoutes);

// ✅ Home
app.get("/", (req, res) => {
    res.send("<h1>🚀 Pothole Mapping Backend Running!</h1>");
});

// ✅ Get All Potholes
app.get("/potholes", asyncHandler(async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM potholes ORDER BY detected_at DESC");
    res.json(rows);
}));

// ✅ Report Pothole
app.post("/report", asyncHandler(async (req, res) => {
    let { lat, lng, acceleration } = req.body;
    lat = parseFloat(lat);
    lng = parseFloat(lng);
    acceleration = parseFloat(acceleration);

    if (isNaN(lat) || isNaN(lng) || isNaN(acceleration)) {
        return res.status(400).json({ message: "❌ Invalid input" });
    }

    const filtered = applyKalmanFilter(acceleration);
    const severity = filtered > 15 ? "red" : filtered > 10 ? "yellow" : "green";

    const [result] = await pool.query(
        "INSERT INTO potholes (lat, lng, acceleration, severity) VALUES (?, ?, ?, ?)",
        [lat, lng, filtered, severity]
    );

    const [potholes] = await pool.query("SELECT * FROM potholes ORDER BY detected_at DESC");
    io.emit("all_potholes", potholes);

    res.status(201).json({ message: "✅ Pothole reported", id: result.insertId });
}));

// ✅ Delete Pothole
app.delete("/potholes/:id", asyncHandler(async (req, res) => {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM potholes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
        return res.status(404).json({ message: "❌ Pothole not found" });
    }

    const [potholes] = await pool.query("SELECT * FROM potholes ORDER BY detected_at DESC");
    io.emit("all_potholes", potholes);

    res.json({ message: "✅ Deleted successfully" });
}));

// ✅ Start Secure Server
createDBConnection().then(() => {
    const server = https.createServer(options, app);

    io = new Server(server, {
        cors: { origin: allowedOrigins, methods: ["GET", "POST", "DELETE"], credentials: true },
    });

    io.on("connection", async (socket) => {
        console.log("🔗 WebSocket connected:", socket.id);
        const [potholes] = await pool.query("SELECT * FROM potholes ORDER BY detected_at DESC");
        socket.emit("all_potholes", potholes);

        socket.on("disconnect", () => console.log("❌ WebSocket disconnected:", socket.id));
    });

    server.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Secure server running on https://0.0.0.0:${PORT}`);
    });
});

// ✅ Shutdown
process.on("SIGINT", () => {
    console.log("🔴 Server shutting down...");
    process.exit();
});
app.post('/api/login', (req, res) => {
    const { email, password, role } = req.body;
  
    // Example mock logic (replace with DB logic)
    if (email === 'admin@pothole.com' && password === 'admin123' && role === 'authority') {
      res.json({ token: 'authority-token', user: { email, role } });
    } else if (email === 'user@pothole.com' && password === 'user123' && role === 'user') {
      res.json({ token: 'user-token', user: { email, role } });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
  