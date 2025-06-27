import { StyleFilter } from '../types';
import { AxiosInstance } from 'axios';

// AI rendering using the server API
export const renderImage = async (
  imageFile: File, 
  filter: StyleFilter, 
  apiClient: AxiosInstance,
  onProgress?: (progress: number) => void,
): Promise<string> => {
  try {
    // Validate file type before sending
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(imageFile.type)) {
      throw new Error(`Unsupported file type: ${imageFile.type}. Please use JPEG, PNG, GIF, or WebP format.`);
    }
    
    // Convert image file to base64
    const base64Image = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 data
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(imageFile);
    });
    
    // Simulate progress updates while preparing request
    onProgress?.(10);
    
    // Send request to server API with base64 image data
    const response = await apiClient.post('/api/generate-image', {
      image: base64Image,
      filterId: filter.id,
    });
    
    if (response.status !== 200) {
      throw new Error('Failed to generate image');
    }
    
    onProgress?.(30);
    
    onProgress?.(60);
    
    const result = response.data;
    
    onProgress?.(90);
    
    if (!result.success) {
      throw new Error(result.error || 'Image generation failed');
    }
    
    onProgress?.(100);
    
    // Return the base64 image data URL
    return `data:image/png;base64,${result.image}`;
    
  } catch (error) {
    console.error('AI rendering error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate image');
  }
};