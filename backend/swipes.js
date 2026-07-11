const express = require("express");
const crypto = require("crypto");
const db = require("./db");
const { authenticateToken } = require("./auth");

const router = express.Router();

function generateMatchId() {
  return "match_" + crypto.randomUUID();
}

// Route: Record a swipe (like/pass/super)
router.post("/", authenticateToken, async (req, res) => {
  const { swipee_id, direction, message } = req.body;
  const swiper_id = req.user.id;

  if (!swipee_id || !direction) {
    return res.status(400).json({ error: "Swipee ID and direction are required" });
  }

  try {
    // 1. Record the swipe in database
    await db.query(
      `INSERT INTO swipes (swiper_id, swipee_id, direction, message)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (swiper_id, swipee_id) 
       DO UPDATE SET direction = EXCLUDED.direction, message = EXCLUDED.message`,
      [swiper_id, swipee_id, direction, message || null]
    );

    // 2. Check for mutual like (match checking)
    let activeMatch = null;

    if (direction === "like" || direction === "super") {
      const mutualSwipeResult = await db.query(
        `SELECT direction, message FROM swipes 
         WHERE swiper_id = $1 AND swipee_id = $2 AND (direction = 'like' OR direction = 'super')`,
        [swipee_id, swiper_id]
      );

      if (mutualSwipeResult.rows.length > 0) {
        // Mutual like found! Create match
        const matchId = generateMatchId();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

        // Sort user_a and user_b to ensure clean keys
        const user_a = swiper_id < swipee_id ? swiper_id : swipee_id;
        const user_b = swiper_id < swipee_id ? swipee_id : swiper_id;

        // Check if match already exists
        const existingMatch = await db.query(
          "SELECT * FROM matches WHERE user_a = $1 AND user_b = $2",
          [user_a, user_b]
        );

        if (existingMatch.rows.length === 0) {
          let matchInsert = await db.query(
            `INSERT INTO matches (id, user_a, user_b, expires_at)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_a, user_b) DO NOTHING
             RETURNING *`,
            [matchId, user_a, user_b, expiresAt]
          );
          if (matchInsert.rows.length === 0) {
            // Lost the race to a concurrent request — use the row it created
            matchInsert = await db.query("SELECT * FROM matches WHERE user_a = $1 AND user_b = $2", [user_a, user_b]);
          }
          const finalMatchId = matchInsert.rows[0].id;

          // Get other user's details for celebration dialog
          const otherUserResult = await db.query(
            "SELECT id, name, photos, birthdate, bio, is_online FROM profiles WHERE id = $1",
            [swipee_id]
          );

          // Insert the mutual user's swipe message if it exists
          const mutualSwipe = mutualSwipeResult.rows[0];
          if (mutualSwipe.message) {
            await db.query(
              `INSERT INTO messages (match_id, sender_id, body)
               VALUES ($1, $2, $3)`,
              [finalMatchId, swipee_id, mutualSwipe.message]
            );
          }

          // Insert the current user's swipe message if it exists
          if (message) {
            await db.query(
              `INSERT INTO messages (match_id, sender_id, body)
               VALUES ($1, $2, $3)`,
              [finalMatchId, swiper_id, message]
            );
          }

          if (otherUserResult.rows.length > 0) {
            activeMatch = {
              match: matchInsert.rows[0],
              profile: otherUserResult.rows[0]
            };
          }
        }
      }
    }

    res.status(200).json({ success: true, activeMatch });
  } catch (err) {
    console.error("Record swipe error:", err);
    res.status(500).json({ error: "Internal server error recording swipe" });
  }
});

// Route: Reset swipes (equivalent to start over)
router.post("/reset", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    await db.query("DELETE FROM swipes WHERE swiper_id = $1", [userId]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Reset swipes error:", err);
    res.status(500).json({ error: "Internal server error resetting swipes" });
  }
});

module.exports = router;
