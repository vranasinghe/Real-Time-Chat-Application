const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-jwt-key";

// Helper to generate UUID-like strings
function generateId() {
  return "usr_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token is missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid or expired" });
    }
    req.user = user;
    next();
  });
};

// Route: User registration
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required" });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // Check if email already exists
    const existing = await db.query("SELECT id FROM profiles WHERE email = $1", [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateId();

    const result = await db.query(
      `INSERT INTO profiles (id, email, password, name, is_online)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, email, name, is_online, created_at`,
      [userId, cleanEmail, hashedPassword, name.trim()]
    );

    const profile = result.rows[0];
    const token = jwt.sign({ id: profile.id, email: profile.email }, JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({ token, user: profile });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error during registration" });
  }
});

// Route: User login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const result = await db.query("SELECT * FROM profiles WHERE email = $1", [cleanEmail]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Set online status
    await db.query("UPDATE profiles SET is_online = true WHERE id = $1", [user.id]);
    user.is_online = true;

    // Delete password from user object
    delete user.password;

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

    res.status(200).json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// Route: Complete profile setup
router.post("/complete-setup", authenticateToken, async (req, res) => {
  const { birthdate, gender, looking_for, bio, height_cm, interests, photos, lat, lng } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `UPDATE profiles
       SET birthdate = $1, gender = $2, looking_for = $3, bio = $4, height_cm = $5,
           interests = $6, photos = $7, lat = $8, lng = $9
       WHERE id = $10
       RETURNING *`,
      [birthdate, gender, looking_for, bio, height_cm, interests, photos, lat, lng, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const profile = result.rows[0];
    delete profile.password;

    res.status(200).json({ user: profile });
  } catch (err) {
    console.error("Complete setup error:", err);
    res.status(500).json({ error: "Internal server error during profile setup" });
  }
});

// Route: Get current user profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM profiles WHERE id = $1", [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const profile = result.rows[0];
    delete profile.password;

    res.status(200).json(profile);
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ error: "Internal server error fetching profile" });
  }
});

module.exports = {
  router,
  authenticateToken
};
