/*
  # Chat Storage Table

  1. New Tables
    - `chat_storage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `session_id` (text, unique identifier for chat session)
      - `messages` (jsonb array of messages)
      - `title` (text, conversation title)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `chat_storage` table
    - Add policies for users to manage their own chat sessions
    - Add indexes for performance optimization

  3. Functions
    - Function to update updated_at timestamp
*/

-- Create chat_storage table
CREATE TABLE IF NOT EXISTS chat_storage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id text NOT NULL,
  messages jsonb DEFAULT '[]'::jsonb NOT NULL,
  title text DEFAULT 'New Conversation'::text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create unique constraint on user_id and session_id
ALTER TABLE chat_storage ADD CONSTRAINT chat_storage_user_id_session_id_key UNIQUE (user_id, session_id);

-- Enable RLS
ALTER TABLE chat_storage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own chat sessions"
  ON chat_storage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
  ON chat_storage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
  ON chat_storage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
  ON chat_storage
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_storage_user_id ON chat_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_storage_session_id ON chat_storage(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_storage_updated_at ON chat_storage(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_storage_user_updated ON chat_storage(user_id, updated_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_storage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_chat_storage_updated_at
  BEFORE UPDATE ON chat_storage
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_storage_updated_at();