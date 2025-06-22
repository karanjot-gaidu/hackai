import { supabase } from './supabase';
import { ImageGeneration } from './supabase';

export interface StoreImageGenerationParams {
  userId: string;
  prompt: string;
  imageUrl: string;
  imagePath: string;
  generationTimeSeconds?: number;
  modelUsed?: string;
  metadata?: any;
}

export interface GetImageHistoryParams {
  userId: string;
  limit?: number;
  offset?: number;
}

/**
 * Store image generation record in database
 */
export async function storeImageGeneration(params: StoreImageGenerationParams): Promise<string | null> {
  const { data, error } = await supabase
    .rpc('store_image_generation', {
      p_user_id: params.userId,
      p_prompt: params.prompt,
      p_image_url: params.imageUrl,
      p_image_path: params.imagePath,
      p_generation_time_seconds: params.generationTimeSeconds || null,
      p_model_used: params.modelUsed || 'stable-diffusion-3.5-large',
      p_metadata: params.metadata || {}
    });

  if (error) {
    console.error('Database error storing image generation:', error);
    throw new Error(`Failed to store image generation: ${error.message}`);
  }

  return data;
}

/**
 * Get image generation history for a user
 */
export async function getImageHistory(params: GetImageHistoryParams): Promise<ImageGeneration[]> {
  const { data, error } = await supabase
    .rpc('get_image_history', {
      p_user_id: params.userId,
      p_limit: params.limit || 50,
      p_offset: params.offset || 0
    });

  if (error) {
    console.error('Database error fetching image history:', error);
    throw new Error(`Failed to fetch image history: ${error.message}`);
  }

  return data || [];
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImageToStorage(
  userId: string, 
  imageBuffer: ArrayBuffer, 
  filename: string
): Promise<{ imageUrl: string; imagePath: string }> {
  const filePath = `generated-images/${userId}/${filename}`;

  // Upload image to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('ai-generated-images')
    .upload(filePath, imageBuffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  // Get public URL for the uploaded image
  const { data: urlData } = supabase.storage
    .from('ai-generated-images')
    .getPublicUrl(filePath);

  return {
    imageUrl: urlData.publicUrl,
    imagePath: filePath
  };
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImageFromStorage(imagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from('ai-generated-images')
    .remove([imagePath]);

  if (error) {
    console.error('Supabase delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Delete image generation record from database
 */
export async function deleteImageGeneration(generationId: string): Promise<void> {
  const { error } = await supabase
    .from('image_generations')
    .delete()
    .eq('id', generationId);

  if (error) {
    console.error('Database error deleting image generation:', error);
    throw new Error(`Failed to delete image generation: ${error.message}`);
  }
} 