const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const secretKey = process.env.JWT_SECRET || "default_secret";

// CORS for frontend
router.use(cors({
  origin: "https://localhost:3000",
  methods: "GET,POST",
  credentials: true,
}));

// ✅ Register
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  const db = req.db;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length > 0) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
      username,
      hashedPassword,
      role,
    ]);

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const db = req.db;

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) return res.status(401).json({ message: "User not found." });

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) return res.status(401).json({ message: "Incorrect password." });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secretKey, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token, role: user.role });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ✅ Get Current Authenticated User
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization header:", authHeader);

  const token = authHeader?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token missing." });

  try {
    const decoded = jwt.verify(token, secretKey);
    res.json(decoded);
  } catch (err) {
    console.error("❌ Invalid token:", err.message);
    res.status(403).json({ message: "Invalid token." });
  }
});

module.exports = router;
