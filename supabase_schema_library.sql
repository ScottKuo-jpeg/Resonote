-- Supabase Database Schema Extensions for Library & Smart Notes Features
-- Run this after the main schema (supabase_schema.sql)

-- Podcasts Table
-- Store podcast metadata for library features
CREATE TABLE IF NOT EXISTS podcasts (
  id TEXT PRIMARY KEY,
  collection_id BIGINT,
  collection_name TEXT NOT NULL,
  artist_name TEXT,
  artwork_url TEXT,
  feed_url TEXT,
  primary_genre TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_podcasts_collection_id ON podcasts(collection_id);

-- User Follows Table
-- Track followed podcasts
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  podcast_id TEXT REFERENCES podcasts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, podcast_id)
);

CREATE INDEX idx_user_follows_user_id ON user_follows(user_id);
CREATE INDEX idx_user_follows_podcast_id ON user_follows(podcast_id);

-- User Likes Table
-- Track liked episodes
CREATE TABLE IF NOT EXISTS user_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  episode_guid TEXT REFERENCES episodes(guid) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, episode_guid)
);

CREATE INDEX idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX idx_user_likes_episode_guid ON user_likes(episode_guid);

-- User History Table
-- Track listening history
CREATE TABLE IF NOT EXISTS user_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  episode_guid TEXT REFERENCES episodes(guid) ON DELETE CASCADE,
  progress FLOAT DEFAULT 0,
  last_position FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, episode_guid)
);

CREATE INDEX idx_user_history_user_id ON user_history(user_id);
CREATE INDEX idx_user_history_episode_guid ON user_history(episode_guid);
CREATE INDEX idx_user_history_updated_at ON user_history(updated_at);

-- Smart Notes Table
-- Store user-created smart notes from AI content
CREATE TABLE IF NOT EXISTS smart_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  episode_guid TEXT REFERENCES episodes(guid) ON DELETE CASCADE,
  note_type TEXT CHECK (note_type IN ('SUMMARY', 'MINDMAP', 'CHAT')) NOT NULL,
  title TEXT,
  key_takeaway TEXT,
  content TEXT NOT NULL,
  cover_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_smart_notes_user_id ON smart_notes(user_id);
CREATE INDEX idx_smart_notes_episode_guid ON smart_notes(episode_guid);
CREATE INDEX idx_smart_notes_note_type ON smart_notes(note_type);
CREATE INDEX idx_smart_notes_created_at ON smart_notes(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allowing all operations for now - adjust in production)
CREATE POLICY "Enable all for podcasts" ON podcasts FOR ALL USING (true);
CREATE POLICY "Enable all for user_follows" ON user_follows FOR ALL USING (true);
CREATE POLICY "Enable all for user_likes" ON user_likes FOR ALL USING (true);
CREATE POLICY "Enable all for user_history" ON user_history FOR ALL USING (true);
CREATE POLICY "Enable all for smart_notes" ON smart_notes FOR ALL USING (true);
