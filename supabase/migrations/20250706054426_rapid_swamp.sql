/*
  # Add Video Generation Support

  1. New Features
    - Add 'video' to chat_type_enum for video generation entries
    - Update get_user_chat_stats function to include video statistics

  2. Changes
    - Extend chat_type_enum with 'video' option
    - Drop and recreate get_user_chat_stats function with video_chats column
*/

-- Add 'video' to the existing chat_type_enum
ALTER TYPE chat_type_enum ADD VALUE IF NOT EXISTS 'video';

-- Drop the existing function first to avoid return type conflict
DROP FUNCTION IF EXISTS get_user_chat_stats(uuid);

-- Recreate the get_user_chat_stats function to include video statistics
CREATE OR REPLACE FUNCTION get_user_chat_stats(target_user_id uuid)
RETURNS TABLE (
  total_chats bigint,
  text_chats bigint,
  image_chats bigint,
  video_chats bigint,
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
    COUNT(*) FILTER (WHERE chat_type = 'video') as video_chats,
    COUNT(*) FILTER (WHERE chat_type = 'knowledge_search') as knowledge_search_chats,
    COUNT(DISTINCT session_id) as total_sessions,
    MIN(timestamp) as first_chat_date,
    MAX(timestamp) as last_chat_date
  FROM chat_history 
  WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;