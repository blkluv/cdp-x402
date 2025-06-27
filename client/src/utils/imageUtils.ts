// Utility functions for image processing and downloads

/**
 * Converts a base64 image to JPEG format and triggers download
 * @param base64Image - Base64 data URL of the image
 * @param filename - Desired filename for the download
 * @param quality - JPEG quality (0-1, default 0.9)
 */
export const downloadImageAsJPEG = (
  base64Image: string, 
  filename: string, 
  quality: number = 0.9
): void => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Canvas context not available');
    return;
  }

  const img = new Image();

  img.onload = () => {
    try {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0);

      // Convert to JPEG blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename.endsWith('.jpeg') || filename.endsWith('.jpg') 
              ? filename 
              : `${filename}.jpeg`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the object URL
            URL.revokeObjectURL(url);
          } else {
            console.error('Failed to create blob from canvas');
          }
        },
        'image/jpeg',
        quality
      );
    } catch (error) {
      console.error('Error processing image:', error);
    }
  };

  img.onerror = (error) => {
    console.error('Error loading image:', error);
  };

  img.src = base64Image;
};

/**
 * Converts base64 image to a downloadable blob
 * @param base64Image - Base64 data URL of the image
 * @param format - Output format ('jpeg' | 'png')
 * @param quality - Image quality for JPEG (0-1)
 */
export const base64ToBlob = (
  base64Image: string, 
  format: 'jpeg' | 'png' = 'jpeg', 
  quality: number = 0.9
): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => resolve(blob),
        format === 'jpeg' ? 'image/jpeg' : 'image/png',
        quality
      );
    };

    img.onerror = () => resolve(null);
    img.src = base64Image;
  });
};

/**
 * Gets image dimensions from base64 data URL
 * @param base64Image - Base64 data URL of the image
 */
export const getImageDimensions = (base64Image: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = base64Image;
  });
}; 