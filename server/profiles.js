const express = require("express");
const db = require("./db");
const { authenticateToken } = require("./auth");

const router = express.Router();

// Fetch discovery profiles for swipe feed
router.get("/discovery", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 20;

  try {
    // 1. Fetch user's preferences
    const userResult = await db.query(
      "SELECT gender, looking_for FROM profiles WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User preferences not found" });
    }

    const { looking_for } = userResult.rows[0];
    const targetGender = looking_for === "everyone" ? null : looking_for;

    // 2. Query matching discovery profiles
    const discoveryQuery = `
      SELECT 
        p.id, p.name, p.birthdate, p.gender, p.looking_for, p.bio, p.height_cm, p.interests, p.photos, p.lat, p.lng, p.is_online,
        (SELECT message FROM swipes WHERE swiper_id = p.id AND swipee_id = $1) as swipe_message,
        COALESCE(
          (
            SELECT count(*)::integer * 20
            FROM unnest(p.interests) interest
            WHERE interest = ANY(
              SELECT unnest(interests) FROM profiles WHERE id = $1
            )
          ), 
          50
        ) as match_percent
      FROM profiles p
      WHERE p.id != $1
        AND ($2::text IS NULL OR p.gender = $2)
        AND p.id NOT IN (
          SELECT swipee_id FROM swipes WHERE swiper_id = $1
        )
      LIMIT $3;
    `;

    const result = await db.query(discoveryQuery, [userId, targetGender, limit]);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Fetch discovery error:", err);
    res.status(500).json({ error: "Internal server error fetching discovery profiles" });
  }
});

// Route: Get profiles who liked the current user
router.get("/likes-you", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT 
        p.id, p.name, p.birthdate, p.gender, p.looking_for, p.bio, p.height_cm, p.interests, p.photos, p.lat, p.lng, p.is_online,
        COALESCE(
          (
            SELECT count(*)::integer * 20
            FROM unnest(p.interests) interest
            WHERE interest = ANY(
              SELECT unnest(interests) FROM profiles WHERE id = $1
            )
          ), 
          50
        ) as match_percent
      FROM profiles p
      INNER JOIN swipes s ON s.swiper_id = p.id
      WHERE s.swipee_id = $1
        AND (s.direction = 'like' OR s.direction = 'super')
        AND p.id NOT IN (
          SELECT swipee_id FROM swipes WHERE swiper_id = $1
        )`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Get likes-you error:", err);
    res.status(500).json({ error: "Internal server error fetching likes-you profiles" });
  }
});

module.exports = router;
