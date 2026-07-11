const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const db = require("./db");

const auth = require("./auth");
const profiles = require("./profiles");
const swipes = require("./swipes");
const matches = require("./matches");

require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Comma-separated list of allowed origins, e.g. "https://dateza.app,https://www.dateza.app"
// Falls back to "*" only when unset, which should never happen in production.
const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : "*";

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"]
  }
});

// Configure CORS, security headers, and JSON parsing
app.use(helmet());
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Rate limit auth endpoints to slow down credential stuffing / brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// Set socketio reference on app
app.set("socketio", io);

// Mount API endpoints
app.use("/api/auth", auth.router);
app.use("/api/profiles", profiles);
app.use("/api/swipes", swipes);
app.use("/api/matches", matches);

// Root test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Dateza Node.js Express Backend is running." });
});


// Authenticate every socket connection with the same JWT used for REST calls
io.use((socket, next) => {
  const headerToken = socket.handshake.headers.authorization?.split(" ")[1];
  const token = socket.handshake.auth?.token || headerToken;

  if (!token) {
    return next(new Error("Authentication token is missing"));
  }

  jwt.verify(token, auth.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("Authentication token is invalid or expired"));
    }
    socket.data.userId = decoded.id;
    next();
  });
});

// WebSocket Server Events
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id, "user:", socket.data.userId);

  // Join a match chat room — only if the authenticated user is a participant
  socket.on("join_room", async (matchId) => {
    if (!matchId) return;
    try {
      const result = await db.query(
        "SELECT 1 FROM matches WHERE id = $1 AND (user_a = $2 OR user_b = $2)",
        [matchId, socket.data.userId]
      );
      if (result.rows.length === 0) {
        return;
      }
      socket.join(matchId);
      console.log(`Socket ${socket.id} joined room: ${matchId}`);
    } catch (err) {
      console.error("join_room authorization check failed:", err);
    }
  });

  // Leave a match chat room
  socket.on("leave_room", (matchId) => {
    if (matchId) {
      socket.leave(matchId);
      console.log(`Socket ${socket.id} left room: ${matchId}`);
    }
  });

  // Heartbeat/Online status synchronization — always the authenticated user, never client-supplied
  socket.on("user_online", async () => {
    const userId = socket.data.userId;
    await db.query("UPDATE profiles SET is_online = true WHERE id = $1", [userId]);
    io.emit("status_change", { userId, is_online: true });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

// Initialize Database and launch server
const startServer = async () => {
  await db.initDb();
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
