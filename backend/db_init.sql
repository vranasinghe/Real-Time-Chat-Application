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
