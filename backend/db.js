const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn("WARNING: DATABASE_URL environment variable is not defined. Please configure it in your deployment dashboard (Railway, Render, etc.).");
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString && (connectionString.includes("supabase.co") || connectionString.includes("supabase.com"))
    ? { rejectUnauthorized: false }
    : false
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client:", err);
});

const bcrypt = require("bcryptjs");

const initDb = async () => {
  try {
    const sqlPath = path.join(__dirname, "db_init.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");
    await pool.query(sql);
    console.log("Database tables verified/created successfully.");
    if (process.env.NODE_ENV === "production") {
      console.log("Production environment detected — skipping mock profile seeding.");
    } else {
      await seedMockProfiles();
    }
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
};

const seedMockProfiles = async () => {
  try {
    const check = await pool.query("SELECT COUNT(*) FROM profiles WHERE id LIKE 'seed-%'");
    const count = parseInt(check.rows[0].count);
    if (count > 0) {
      return;
    }

    console.log("Seeding initial mock profiles into database...");
    const mockProfiles = [
      {
        id: "seed-liana",
        email: "liana@example.com",
        name: "Liana Ray",
        birthdate: "2001-03-14",
        gender: "female",
        looking_for: "male",
        bio: "Looking for someone to join me on a sunrise hike or a late-night diner run. I make a mean sourdough.",
        height_cm: 167,
        interests: ["Hiking", "Baking", "Sunrises", "Road Trips"],
        photos: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"],
        is_online: true,
      },
      {
        id: "seed-elena",
        email: "elena@example.com",
        name: "Elena",
        birthdate: "2001-08-15",
        gender: "female",
        looking_for: "male",
        bio: "Art director & coffee enthusiast. Let's explore local galleries and talk about modern architecture over pour-overs.",
        height_cm: 168,
        interests: ["Art", "Coffee", "Design", "Museums"],
        photos: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80"],
        is_online: true,
      },
      {
        id: "seed-aria",
        email: "aria@example.com",
        name: "Aria",
        birthdate: "1999-11-20",
        gender: "female",
        looking_for: "everyone",
        bio: "Avid reader, sci-fi fan, and yoga lover. Looking for genuine conversations that last way past midnight.",
        height_cm: 165,
        interests: ["Reading", "Yoga", "Cinema", "Sci-Fi", "Music"],
        photos: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&auto=format&fit=crop&q=80"],
        is_online: true,
      },
      {
        id: "seed-chloe",
        email: "chloe@example.com",
        name: "Chloe",
        birthdate: "2000-06-25",
        gender: "female",
        looking_for: "male",
        bio: "Fashion blogger & photography student. Capture life in frames. Tell me your favorite film stock.",
        height_cm: 170,
        interests: ["Fashion", "Photography", "Cinema", "Writing"],
        photos: ["https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80"],
        is_online: false,
      },
      {
        id: "seed-sophia",
        email: "sophia@example.com",
        name: "Sophia",
        birthdate: "1998-01-08",
        gender: "female",
        looking_for: "male",
        bio: "Marine biologist & amateur surfer. The ocean is my second home — let's find our favourite shoreline together.",
        height_cm: 163,
        interests: ["Ocean", "Surfing", "Science", "Travel", "Documentaries"],
        photos: ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80"],
        is_online: true,
      },
      {
        id: "seed-isabelle",
        email: "isabelle@example.com",
        name: "Isabelle",
        birthdate: "2002-09-03",
        gender: "female",
        looking_for: "male",
        bio: "Dancer, foodie, and lover of rainy days. Probably thinking about brunch right now.",
        height_cm: 169,
        interests: ["Dance", "Food", "Rain", "Brunch", "Music"],
        photos: ["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&auto=format&fit=crop&q=80"],
        is_online: false,
      },
      {
        id: "seed-marcus",
        email: "marcus@example.com",
        name: "Marcus",
        birthdate: "1998-04-12",
        gender: "male",
        looking_for: "female",
        bio: "Weekend hiker and amateur chef. Seeking someone to share new recipes with, or escape to the mountains on Friday nights.",
        height_cm: 182,
        interests: ["Cooking", "Hiking", "Travel", "Nature", "Fitness"],
        photos: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80"],
        is_online: false,
      },
      {
        id: "seed-dev",
        email: "dev@example.com",
        name: "Dev",
        birthdate: "1996-02-05",
        gender: "male",
        looking_for: "female",
        bio: "Software engineer by day, live music seeker by night. Always down for street tacos and experimental electronic sets.",
        height_cm: 175,
        interests: ["Music", "Tech", "Tacos", "Festivals", "Running"],
        photos: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80"],
        is_online: true,
      },
      {
        id: "seed-liam",
        email: "liam@example.com",
        name: "Liam",
        birthdate: "1997-09-30",
        gender: "male",
        looking_for: "everyone",
        bio: "Surfer, dog dad, and part-time DJ. Keeping things simple, positive, and active. Let's hit the beach.",
        height_cm: 180,
        interests: ["Surfing", "Dogs", "Music", "Beach"],
        photos: ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80"],
        is_online: true,
      },
      {
        id: "seed-nina",
        email: "nina@example.com",
        name: "Nina",
        birthdate: "2000-12-17",
        gender: "female",
        looking_for: "everyone",
        bio: "Musician and street artist. I paint walls, play bass, and drink way too much iced coffee. Come find me.",
        height_cm: 162,
        interests: ["Music", "Art", "Bass Guitar", "Coffee", "Street Art"],
        photos: ["https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80"],
        is_online: true,
      },
      {
        id: "seed-zoe",
        email: "zoe@example.com",
        name: "Zoe",
        birthdate: "1999-05-21",
        gender: "female",
        looking_for: "male",
        bio: "Plant mum, wellness coach, and sunrise runner. Healthy lifestyle, big laughs, and deeper conversations.",
        height_cm: 166,
        interests: ["Wellness", "Running", "Plants", "Nutrition", "Yoga"],
        photos: ["https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&auto=format&fit=crop&q=80"],
        is_online: false,
      },
      {
        id: "seed-james",
        email: "james@example.com",
        name: "James",
        birthdate: "1995-07-11",
        gender: "male",
        looking_for: "female",
        bio: "Architect with a weakness for jazz bars and bookstores. Probably sketching something. Let's design something together.",
        height_cm: 185,
        interests: ["Architecture", "Jazz", "Books", "Design", "Coffee"],
        photos: ["https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&auto=format&fit=crop&q=80"],
        is_online: true,
      },
    ];

    const passwordHash = await bcrypt.hash("password123", 10);

    for (const p of mockProfiles) {
      await pool.query(
        `INSERT INTO profiles (id, email, password, name, birthdate, gender, looking_for, bio, height_cm, interests, photos, is_online)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.email, passwordHash, p.name, p.birthdate, p.gender, p.looking_for, p.bio, p.height_cm, p.interests, p.photos, p.is_online]
      );
    }
    console.log("Mock profiles seeded successfully.");
  } catch (err) {
    console.error("Seeding profiles failed:", err);
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  initDb
};
