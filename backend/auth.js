const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required but was not set");
}

// Helper to generate UUID-like strings
function generateId() {
  return "usr_" + crypto.randomUUID();
}

const MIN_AGE_YEARS = 18;

function isAtLeastMinAge(birthdate) {
  const dob = new Date(birthdate);
  if (isNaN(dob.getTime())) return false;

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE_YEARS);
  return dob <= cutoff;
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

const handleRegister = async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long" });
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
};

router.post("/register", handleRegister);
router.post("/signup", handleRegister);

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

  if (birthdate && !isAtLeastMinAge(birthdate)) {
    return res.status(400).json({ error: `You must be at least ${MIN_AGE_YEARS} years old to use Dateza` });
  }

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

// Google Authentication Route: Get Redirect URL
router.get("/google/url", (req, res) => {
  const { redirect_uri } = req.query;
  if (!redirect_uri) {
    return res.status(400).json({ error: "redirect_uri query parameter is required" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  // If no Google client ID is configured, redirect to the local mock account chooser
  if (!clientId) {
    const mockUrl = `${req.protocol}://${req.get("host")}/api/auth/google/mock-login?state=${encodeURIComponent(redirect_uri)}`;
    return res.json({ url: mockUrl });
  }

  // Real Google OAuth redirect URL construction
  const callbackUrl = `${req.protocol}://${req.get("host")}/api/auth/google/callback`;
  const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=email%20profile&state=${encodeURIComponent(redirect_uri)}`;
  return res.json({ url: googleOAuthUrl });
});

// Google Authentication Route: Mock Chooser Page
router.get("/google/mock-login", (req, res) => {
  const { state } = req.query;
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Sign in with Google - Choose an account</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
            background-color: #0E0720;
            color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 16px;
            box-sizing: border-box;
          }
          .card {
            background-color: #150E28;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 32px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
            text-align: center;
          }
          h2 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            background: linear-gradient(90deg, #FF3B70, #C535FF);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .subtitle {
            color: #a0aec0;
            font-size: 14px;
            margin-bottom: 28px;
          }
          .google-logo {
            display: inline-block;
            margin-bottom: 16px;
            background: #ffffff;
            border-radius: 50%;
            padding: 10px;
            width: 32px;
            height: 32px;
          }
          .account-btn {
            display: flex;
            align-items: center;
            background-color: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            color: #ffffff;
            padding: 14px 16px;
            border-radius: 16px;
            width: 100%;
            text-align: left;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            box-sizing: border-box;
          }
          .account-btn:hover {
            background-color: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.15);
          }
          .avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: #6C5DD3;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: bold;
            margin-right: 12px;
            color: white;
          }
          .details {
            flex-grow: 1;
          }
          .name {
            font-size: 14px;
            font-weight: 600;
            margin: 0;
          }
          .email {
            font-size: 12px;
            color: #a0aec0;
            margin: 0;
          }
          .form-group {
            margin-top: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            padding-top: 20px;
            text-align: left;
          }
          label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: #a0aec0;
            margin-bottom: 6px;
          }
          input {
            width: 100%;
            background-color: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.08);
            color: white;
            padding: 12px;
            border-radius: 12px;
            box-sizing: border-box;
            margin-bottom: 12px;
            font-size: 14px;
          }
          input:focus {
            outline: none;
            border-color: #C535FF;
          }
          .submit-btn {
            background: linear-gradient(90deg, #FF3B70, #C535FF);
            color: white;
            border: none;
            padding: 12px;
            width: 100%;
            border-radius: 12px;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <svg class="google-logo" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <h2>Choose an account</h2>
          <div class="subtitle">to continue to Dateza (Mock Developer Mode)</div>
          
          <button class="account-btn" onclick="selectMock('Jane Doe', 'jane@example.com')">
            <div class="avatar" style="background-color: #FF3B70">J</div>
            <div class="details">
              <p class="name">Jane Doe</p>
              <p class="email">jane@example.com</p>
            </div>
          </button>

          <button class="account-btn" onclick="selectMock('Alex Mercer', 'alex@gmail.com')">
            <div class="avatar" style="background-color: #6C5DD3">A</div>
            <div class="details">
              <p class="name">Alex Mercer</p>
              <p class="email">alex@gmail.com</p>
            </div>
          </button>
          
          <div class="form-group">
            <form action="/api/auth/google/callback" method="GET">
              <input type="hidden" name="state" value="${state || ""}">
              <input type="hidden" name="mock" value="true">
              <label for="name">Or sign in with a new account</label>
              <input type="text" id="name" name="name" placeholder="Full Name" required>
              <input type="email" name="email" placeholder="Email Address" required>
              <button type="submit" class="submit-btn">Continue</button>
            </form>
          </div>
        </div>

        <script>
          function selectMock(name, email) {
            const state = "${state || ""}";
            window.location.href = "/api/auth/google/callback?mock=true&name=" + encodeURIComponent(name) + "&email=" + encodeURIComponent(email) + "&state=" + encodeURIComponent(state);
          }
        </script>
      </body>
    </html>
  `;
  res.send(html);
});

// Google Authentication Route: OAuth / Mock Callback Handling
router.get("/google/callback", async (req, res) => {
  const { code, state, mock, email, name } = req.query;
  const clientRedirectUri = state || "dateza://auth-callback";

  let userEmail = "";
  let userName = "";

  try {
    if (mock === "true" || !process.env.GOOGLE_CLIENT_ID) {
      // Mock developer flow
      userEmail = email || "developer@example.com";
      userName = name || "Developer Account";
    } else {
      // Real Google OAuth code exchange
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const callbackUrl = `${req.protocol}://${req.get("host")}/api/auth/google/callback`;

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        throw new Error(tokenData.error_description || "Failed to exchange Google OAuth code");
      }

      const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const infoData = await infoRes.json();
      if (!infoRes.ok) {
        throw new Error("Failed to retrieve Google userinfo");
      }

      userEmail = infoData.email;
      userName = infoData.name || infoData.given_name || "Google User";
    }

    const cleanEmail = userEmail.trim().toLowerCase();
    
    // Find or create the user profile
    let userId;
    let userRecord;
    
    const existing = await db.query("SELECT * FROM profiles WHERE email = $1", [cleanEmail]);
    if (existing.rows.length > 0) {
      userRecord = existing.rows[0];
      userId = userRecord.id;
      // Mark as online
      await db.query("UPDATE profiles SET is_online = true WHERE id = $1", [userId]);
      userRecord.is_online = true;
    } else {
      // Create new user profile with a generated password hash (to satisfy NOT NULL constraint)
      userId = generateId();
      const mockPasswordRaw = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(mockPasswordRaw, 10);
      
      const insertResult = await db.query(
        `INSERT INTO profiles (id, email, password, name, is_online)
         VALUES ($1, $2, $3, $4, true)
         RETURNING *`,
        [userId, cleanEmail, hashedPassword, userName.trim()]
      );
      userRecord = insertResult.rows[0];
    }
    
    delete userRecord.password;
    
    // Generate JWT token
    const appToken = jwt.sign({ id: userRecord.id, email: userRecord.email }, JWT_SECRET, { expiresIn: "30d" });
    
    // Redirect back to app with token and user details
    const redirectUrl = new URL(clientRedirectUri);
    redirectUrl.searchParams.set("token", appToken);
    redirectUrl.searchParams.set("user", JSON.stringify(userRecord));
    
    res.redirect(redirectUrl.toString());
  } catch (err) {
    console.error("Google Auth callback error:", err);
    res.status(500).send(`Authentication Failed: ${err.message}`);
  }
});

module.exports = {
  router,
  authenticateToken,
  JWT_SECRET
};
