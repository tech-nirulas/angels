// hooks/useOptimizedImage.ts
import { useState, useEffect } from 'react';

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * Optimized image loading hook with progressive enhancement
 * Handles different image orientations intelligently
 */
export const useOptimizedImage = (imageUrl: string, originalWidth?: number, originalHeight?: number) => {
  const [dimensions, setDimensions] = useState<ImageDimensions>({
    width: 0,
    height: 0,
    aspectRatio: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setLoading(false);
      return;
    }

    // If we have original dimensions, use them to determine orientation
    if (originalWidth && originalHeight) {
      const aspectRatio = originalWidth / originalHeight;
      setDimensions({
        width: originalWidth,
        height: originalHeight,
        aspectRatio,
      });
      setLoading(false);
      return;
    }

    // Otherwise, load the image to get dimensions
    const img = new window.Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      setDimensions({
        width: img.width,
        height: img.height,
        aspectRatio,
      });
      setLoading(false);
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
    img.src = imageUrl;
  }, [imageUrl, originalWidth, originalHeight]);

  // Determine if image is landscape, portrait, or square
  const orientation = dimensions.aspectRatio > 1.2 ? 'landscape' : 
                      dimensions.aspectRatio < 0.8 ? 'portrait' : 'square';

  return { dimensions, loading, error, orientation };
};