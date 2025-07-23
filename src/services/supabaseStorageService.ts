import { supabase } from '../lib/supabase';

/**
 * Uploads an image (File or Blob) to the Supabase 's3' storage bucket and returns the public URL.
 * @param file The image file or blob to upload
 * @param userId The user's ID
 * @param sessionId The chat session ID
 * @returns The public URL of the uploaded image
 */
export async function uploadImageToSupabase(file: File | Blob, userId: string, sessionId: string): Promise<string> {
  const fileName = `image-${Date.now()}.png`;
  const filePath = `${userId}/${sessionId}/${fileName}`;

  // Upload to the 's3' bucket
  const { error } = await supabase.storage.from('s3').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'image/png',
  });

  if (error) {
    throw new Error('Failed to upload image to Supabase: ' + error.message);
  }

  // Get the public URL
  const { data } = supabase.storage.from('s3').getPublicUrl(filePath);
  if (!data || !data.publicUrl) {
    throw new Error('Failed to get public URL for uploaded image.');
  }
  return data.publicUrl;
} 

/**
 * Uploads a video (File or Blob) to the Supabase 's3' storage bucket and returns the public URL.
 * @param file The video file or blob to upload
 * @param userId The user's ID
 * @param sessionId The chat session ID
 * @returns The public URL of the uploaded video
 */
export async function uploadVideoToSupabase(file: File | Blob, userId: string, sessionId: string): Promise<string> {
  const fileName = `video-${Date.now()}.mp4`;
  const filePath = `${userId}/${sessionId}/${fileName}`;

  // Upload to the 's3' bucket
  const { error } = await supabase.storage.from('s3').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: 'video/mp4',
  });

  if (error) {
    throw new Error('Failed to upload video to Supabase: ' + error.message);
  }

  // Get the public URL
  const { data } = supabase.storage.from('s3').getPublicUrl(filePath);
  if (!data || !data.publicUrl) {
    throw new Error('Failed to get public URL for uploaded video.');
  }
  return data.publicUrl;
} 