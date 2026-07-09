const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const db = require("./db");

const auth = require("./auth");
const profiles = require("./profiles");
const swipes = require("./swipes");
const matches = require("./matches");

require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configure CORS and JSON parsing
app.use(cors());
app.use(express.json());

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


// WebSocket Server Events
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join a match chat room
  socket.on("join_room", (matchId) => {
    if (matchId) {
      socket.join(matchId);
      console.log(`Socket ${socket.id} joined room: ${matchId}`);
    }
  });

  // Leave a match chat room
  socket.on("leave_room", (matchId) => {
    if (matchId) {
      socket.leave(matchId);
      console.log(`Socket ${socket.id} left room: ${matchId}`);
    }
  });

  // Heartbeat/Online status synchronization (optional extension)
  socket.on("user_online", async (userId) => {
    if (userId) {
      await db.query("UPDATE profiles SET is_online = true WHERE id = $1", [userId]);
      io.emit("status_change", { userId, is_online: true });
    }
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
