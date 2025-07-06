/*
  # Chat History Storage System

  1. New Tables
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `chat_type` (enum: text, image, knowledge_search)
      - `message_content` (jsonb for flexible content storage)
      - `timestamp` (timestamptz)
      - `metadata` (jsonb for additional context)
      - `session_id` (text for grouping related messages)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `chat_history` table
    - Add policies for users to manage their own chat history
    - Add indexes for performance optimization

  3. Functions
    - Function to clean up old chat history
    - Function to get user chat statistics
*/

-- Create enum for chat types
CREATE TYPE chat_type_enum AS ENUM ('text', 'image', 'knowledge_search');

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  chat_type chat_type_enum NOT NULL,
  message_content jsonb NOT NULL,
  timestamp timestamptz DEFAULT now() NOT NULL,
  metadata jsonb DEFAULT '{}',
  session_id text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own chat history"
  ON chat_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history"
  ON chat_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat history"
  ON chat_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history"
  ON chat_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_timestamp ON chat_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON chat_history(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_chat_type ON chat_history(chat_type);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_timestamp ON chat_history(user_id, timestamp DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_chat_history_updated_at
  BEFORE UPDATE ON chat_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up old chat history (older than 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_chat_history()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM chat_history 
  WHERE created_at < now() - INTERVAL '1 year';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user chat statistics
CREATE OR REPLACE FUNCTION get_user_chat_stats(target_user_id uuid)
RETURNS TABLE (
  total_chats bigint,
  text_chats bigint,
  image_chats bigint,
  knowledge_search_chats bigint,
  total_sessions bigint,
  first_chat_date timestamptz,
  last_chat_date timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_chats,
    COUNT(*) FILTER (WHERE chat_type = 'text') as text_chats,
    COUNT(*) FILTER (WHERE chat_type = 'image') as image_chats,
    COUNT(*) FILTER (WHERE chat_type = 'knowledge_search') as knowledge_search_chats,
    COUNT(DISTINCT session_id) as total_sessions,
    MIN(timestamp) as first_chat_date,
    MAX(timestamp) as last_chat_date
  FROM chat_history 
  WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;