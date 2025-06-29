import React from 'react';
import { ensureSafeImage } from '@/lib/utils';

// SafeImg component that tries direct URL first, then proxies through server on error
export const SafeImg: React.FC<React.ComponentProps<'img'>> = ({ src, ...props }) => {
  const handleError = async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    
    // Prevent infinite loop
    if (img.src.startsWith('data:') || img.getAttribute('data-retried') === 'true') {
      return;
    }
    
    try {
      // Mark as retried to prevent loops
      img.setAttribute('data-retried', 'true');
      
      // Try to get safe version through proxy
      const safeSrc = await ensureSafeImage(src as string);
      
      // Only update if we got a different (safe) URL
      if (safeSrc !== src) {
        img.src = safeSrc;
      }
    } catch (error) {
      console.warn('SafeImg fallback failed:', error);
    }
  };

  return (
    <img
      {...props}
      src={src}
      onError={handleError}
    />
  );
}; 