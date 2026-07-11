-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(255) PRIMARY KEY, -- Firebase UID or generated string
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  birthdate DATE,
  gender VARCHAR(50),
  looking_for VARCHAR(50),
  bio TEXT,
  height_cm INTEGER,
  interests TEXT[],
  photos TEXT[],
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Swipes table
CREATE TABLE IF NOT EXISTS swipes (
  id SERIAL PRIMARY KEY,
  swiper_id VARCHAR(255) REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  swipee_id VARCHAR(255) REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  direction VARCHAR(50) CHECK (direction IN ('like', 'pass', 'super')) NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE (swiper_id, swipee_id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id VARCHAR(255) PRIMARY KEY, -- Custom UUID or string
  user_a VARCHAR(255) REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  user_b VARCHAR(255) REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- One-time cleanup: merge any duplicate match rows for the same user pair (created by a
-- race condition before the unique constraint below existed) into the earliest one,
-- reassigning their messages rather than discarding them. Safe to run on every boot.
DO $$
DECLARE
  dup RECORD;
  keep_id VARCHAR(255);
BEGIN
  FOR dup IN
    SELECT user_a, user_b FROM matches GROUP BY user_a, user_b HAVING COUNT(*) > 1
  LOOP
    SELECT id INTO keep_id FROM matches
      WHERE user_a = dup.user_a AND user_b = dup.user_b
      ORDER BY created_at ASC, id ASC LIMIT 1;

    UPDATE messages SET match_id = keep_id
      WHERE match_id IN (
        SELECT id FROM matches
        WHERE user_a = dup.user_a AND user_b = dup.user_b AND id <> keep_id
      );

    DELETE FROM matches
      WHERE user_a = dup.user_a AND user_b = dup.user_b AND id <> keep_id;
  END LOOP;
END $$;

-- Prevent duplicate match rows for the same pair of users (user_a/user_b are always sorted by the app)
DO $$
BEGIN
  ALTER TABLE matches ADD CONSTRAINT matches_user_pair_unique UNIQUE (user_a, user_b);
EXCEPTION
  WHEN duplicate_object OR duplicate_table THEN NULL;
END $$;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  match_id VARCHAR(255) REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  sender_id VARCHAR(255) REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  kind VARCHAR(50) DEFAULT 'text' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user_a, user_b);
CREATE INDEX IF NOT EXISTS idx_messages_match ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for ON profiles(looking_for);
