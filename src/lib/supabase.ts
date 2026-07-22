import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = 'https://tcmvqqueoicnjuzzhshw.supabase.co';
const supabaseAnonKey = 'sb_publishable_cpEotn0Cf5MDJjDOuqfftA_FQcTOiCX';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper pour les uploads de screenshots
export async function uploadScreenshot(
  file: File,
  userId: string,
  symbol: string,
  slot: 'entry' | 'management' | 'close'
): Promise<string | null> {
  // Compression côté client
  const compressed = await compressImage(file);
  if (!compressed) return null;

  const timestamp = Date.now();
  const ext = compressed.type === 'image/png' ? 'png' : 'jpg';
  const fileName = `${userId}/${symbol}-${slot}-${timestamp}.${ext}`;

  const { error } = await supabase.storage
    .from('trade-screenshots')
    .upload(fileName, compressed, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('trade-screenshots')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export async function deleteScreenshot(url: string): Promise<boolean> {
  const path = url.split('/trade-screenshots/')[1];
  if (!path) return false;

  const { error } = await supabase.storage
    .from('trade-screenshots')
    .remove([path]);

  return !error;
}

// Compression d'image côté client
async function compressImage(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const maxWidth = 900;
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.72
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}
