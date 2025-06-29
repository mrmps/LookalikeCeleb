import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Converts remote image URLs to base64 data URLs to avoid CORS/canvas tainting issues on mobile
export const ensureSafeImage = async (src: string): Promise<string> => {
  // If already a data URL, return as-is (no conversion needed)
  if (src.startsWith('data:')) return src;
  
  // If it's a relative URL or blob URL, return as-is (already safe)
  if (src.startsWith('/') || src.startsWith('blob:') || src.startsWith('./')) return src;
  
  try {
    const apiUrl = import.meta.env.PROD 
      ? `/api/base64?url=${encodeURIComponent(src)}`
      : `http://localhost:3001/api/base64?url=${encodeURIComponent(src)}`;
      
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.warn('API response not ok:', response.status, response.statusText);
      return src; // Fallback to original URL
    }
    
    const data = await response.json();
    
    // Return the converted base64 data URL or fallback to original
    return data.data || src;
  } catch (error) {
    console.warn('Failed to convert image to base64:', src, error);
    // Graceful fallback to original URL - images will still work on desktop
    return src;
  }
};

// Feature detection for clipboard image support
export const canWriteImageToClipboard = (): boolean => {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.clipboard &&
    !!navigator.clipboard.write &&
    typeof ClipboardItem !== 'undefined'
  );
};
