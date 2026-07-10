require("dotenv").config();
const db = require("./db");
const pool = db.pool;
(async () => {
  const p = await pool.query("SELECT id, email, name, gender, looking_for, birthdate IS NOT NULL as has_bday, array_length(interests,1) as n_int FROM profiles ORDER BY created_at");
  console.log("=== PROFILES (" + p.rows.length + ") ===");
  console.table(p.rows);
  const s = await pool.query("SELECT swiper_id, swipee_id, direction FROM swipes ORDER BY created_at");
  console.log("=== SWIPES (" + s.rows.length + ") ===");
  console.table(s.rows);
  const m = await pool.query("SELECT id, user_a, user_b FROM matches");
  console.log("=== MATCHES (" + m.rows.length + ") ===");
  console.table(m.rows);
  await pool.end();
})().catch(e => { console.error(e); process.exit(1); });
