const express = require("express");
const db = require("./db");
const { authenticateToken } = require("./auth");

const router = express.Router();

// Route: Get all matches with other user's profile details populated
router.get("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT m.*, 
              json_build_object(
                'id', p.id,
                'name', p.name,
                'photos', p.photos,
                'birthdate', p.birthdate,
                'bio', p.bio,
                'gender', p.gender,
                'looking_for', p.looking_for,
                'interests', p.interests,
                'is_online', p.is_online
              ) as other_user
       FROM matches m
       INNER JOIN profiles p ON (p.id = CASE WHEN m.user_a = $1 THEN m.user_b ELSE m.user_a END)
       WHERE m.user_a = $1 OR m.user_b = $1
       ORDER BY m.created_at DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Get matches error:", err);
    res.status(500).json({ error: "Internal server error fetching matches" });
  }
});

// Route: Create a quick match (for direct messaging from explore/likes tabs)
router.post("/", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { targetUserId } = req.body;

  if (!targetUserId) {
    return res.status(400).json({ error: "targetUserId is required" });
  }

  try {
    // Sort user_a and user_b
    const user_a = userId < targetUserId ? userId : targetUserId;
    const user_b = userId < targetUserId ? targetUserId : userId;

    // Check if match already exists
    const existing = await db.query(
      "SELECT * FROM matches WHERE user_a = $1 AND user_b = $2",
      [user_a, user_b]
    );

    let matchRecord;
    if (existing.rows.length > 0) {
      matchRecord = existing.rows[0];
    } else {
      const matchId = "match_quick_" + Math.random().toString(36).substring(2, 12);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      const insert = await db.query(
        `INSERT INTO matches (id, user_a, user_b, expires_at)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [matchId, user_a, user_b, expiresAt]
      );
      matchRecord = insert.rows[0];
    }

    // Populate other user details
    const otherUserResult = await db.query(
      "SELECT id, name, photos, birthdate, bio, gender, looking_for, interests, is_online FROM profiles WHERE id = $1",
      [targetUserId]
    );

    const matchResponse = {
      ...matchRecord,
      other_user: otherUserResult.rows[0]
    };

    res.status(200).json(matchResponse);
  } catch (err) {
    console.error("Create quick match error:", err);
    res.status(500).json({ error: "Internal server error creating match" });
  }
});

// Route: Get all messages for a specific match
router.get("/:matchId/messages", authenticateToken, async (req, res) => {
  const { matchId } = req.params;
  const userId = req.user.id;

  try {
    // 1. Verify user is part of this match first
    const matchCheck = await db.query(
      "SELECT user_a, user_b FROM matches WHERE id = $1 AND (user_a = $2 OR user_b = $3)",
      [matchId, userId, userId]
    );

    if (matchCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied to this match thread" });
    }

    // 2. Fetch messages log
    const result = await db.query(
      "SELECT * FROM messages WHERE match_id = $1 ORDER BY created_at ASC",
      [matchId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "Internal server error fetching messages" });
  }
});

// Route: Post a new message
router.post("/:matchId/messages", authenticateToken, async (req, res) => {
  const { matchId } = req.params;
  const { body, kind } = req.body;
  const userId = req.user.id;

  if (!body) {
    return res.status(400).json({ error: "Message body is required" });
  }

  try {
    // 1. Verify membership
    const matchCheck = await db.query(
      "SELECT user_a, user_b FROM matches WHERE id = $1 AND (user_a = $2 OR user_b = $3)",
      [matchId, userId, userId]
    );

    if (matchCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied to this match thread" });
    }

    const match = matchCheck.rows[0];

    // 2. Insert message
    const result = await db.query(
      `INSERT INTO messages (match_id, sender_id, body, kind)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [matchId, userId, body, kind || "text"]
    );

    const newMessage = result.rows[0];

    // Get reference to the Socket.io instance from Express app
    const io = req.app.get("socketio");
    if (io) {
      // Emit to the match room
      io.to(matchId).emit("new_message", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Post message error:", err);
    res.status(500).json({ error: "Internal server error posting message" });
  }
});

// Route: Create a quick match (message shortcut)
router.post("/quick", authenticateToken, async (req, res) => {
  const { profile_id } = req.body;
  const userId = req.user.id;

  if (!profile_id) {
    return res.status(400).json({ error: "Profile ID is required" });
  }

  try {
    const matchId = "match_quick_" + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user_a = userId < profile_id ? userId : profile_id;
    const user_b = userId < profile_id ? profile_id : userId;

    // Check if match already exists
    const existing = await db.query(
      "SELECT * FROM matches WHERE user_a = $1 AND user_b = $2",
      [user_a, user_b]
    );

    let matchRecord;
    if (existing.rows.length > 0) {
      matchRecord = existing.rows[0];
    } else {
      const insertResult = await db.query(
        `INSERT INTO matches (id, user_a, user_b, expires_at)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [matchId, user_a, user_b, expiresAt]
      );
      matchRecord = insertResult.rows[0];
    }

    // Get profile details
    const profileRes = await db.query(
      "SELECT id, name, photos, birthdate, bio, is_online FROM profiles WHERE id = $1",
      [profile_id]
    );

    const otherUser = profileRes.rows[0];
    const matchObj = {
      ...matchRecord,
      other_user: otherUser
    };

    res.status(200).json(matchObj);
  } catch (err) {
    console.error("Create quick match error:", err);
    res.status(500).json({ error: "Internal server error creating match" });
  }
});

module.exports = router;
