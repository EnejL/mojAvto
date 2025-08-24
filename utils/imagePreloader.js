// utils/imagePreloader.js
import { Image } from 'react-native';

// List of images to preload for better performance
const IMAGES_TO_PRELOAD = [
  require('../assets/welcomeScreenBg.png'),
  require('../assets/app-logo-white.png'),
  require('../assets/google-logo.png'),
];

/**
 * Preloads all critical images to improve app performance
 * Call this function when the app starts
 */
export const preloadImages = async () => {
  try {
    console.log('Starting image preloading...');
    
    const preloadPromises = IMAGES_TO_PRELOAD.map((imageSource) => {
      return new Promise((resolve, reject) => {
        Image.prefetch(imageSource)
          .then(() => {
            console.log('Image preloaded successfully');
            resolve();
          })
          .catch((error) => {
            console.warn('Failed to preload image:', error);
            // Don't reject, just log the warning
            resolve();
          });
      });
    });

    await Promise.all(preloadPromises);
    console.log('All images preloaded successfully');
  } catch (error) {
    console.warn('Error during image preloading:', error);
    // Don't throw error, just log it
  }
};

/**
 * Preload a specific image by source
 */
export const preloadImage = async (imageSource) => {
  try {
    await Image.prefetch(imageSource);
    console.log('Specific image preloaded successfully');
  } catch (error) {
    console.warn('Failed to preload specific image:', error);
  }
};
