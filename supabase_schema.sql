-- Supabase Database Schema for Podcast AI Platform
-- This schema supports caching transcriptions and AI analyses

-- Episodes Table
-- Stores basic episode information
CREATE TABLE IF NOT EXISTS episodes (
  guid TEXT PRIMARY KEY,
  podcast_id TEXT NOT NULL,
  title TEXT NOT NULL,
  enclosure_url TEXT,
  pub_date TIMESTAMP,
  content_snippet TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_episodes_podcast_id ON episodes(podcast_id);

-- Transcripts Table  
-- Stores transcribed audio text
CREATE TABLE IF NOT EXISTS transcripts (
  episode_guid TEXT PRIMARY KEY REFERENCES episodes(guid) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI Analyses Table
-- Stores generated summaries and mindmaps
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_guid TEXT NOT NULL REFERENCES episodes(guid) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('summary', 'mindmap')),
  content TEXT NOT NULL,
  model_used TEXT DEFAULT 'deepseek-ai/DeepSeek-V3.2-Exp',
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(episode_guid, analysis_type)
);

CREATE INDEX idx_ai_analyses_episode_guid ON ai_analyses(episode_guid);

-- Chat Messages Table
-- Stores chat conversation history per episode
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_guid TEXT NOT NULL REFERENCES episodes(guid) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_episode_guid ON chat_messages(episode_guid);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Adjust based on your authentication strategy)
-- For now, allowing all operations (you should restrict this in production)

CREATE POLICY "Enable all for episodes" ON episodes FOR ALL USING (true);
CREATE POLICY "Enable all for transcripts" ON transcripts FOR ALL USING (true);
CREATE POLICY "Enable all for ai_analyses" ON ai_analyses FOR ALL USING (true);
CREATE POLICY "Enable all for chat_messages" ON chat_messages FOR ALL USING (true);
