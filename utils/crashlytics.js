// utils/crashlytics.js - Firebase Crashlytics utility

import crashlytics from '@react-native-firebase/crashlytics';

/**
 * Log a message to Crashlytics
 * @param {string} message - Message to log
 */
export const logCrashlytics = (message) => {
  try {
    crashlytics().log(message);
  } catch (error) {
    console.error('Error logging to Crashlytics:', error);
  }
};

/**
 * Set a user identifier for Crashlytics
 * @param {string} userId - User ID to set
 */
export const setCrashlyticsUserId = (userId) => {
  try {
    crashlytics().setUserId(userId);
  } catch (error) {
    console.error('Error setting Crashlytics user ID:', error);
  }
};

/**
 * Set a custom attribute for Crashlytics
 * @param {string} key - Attribute key
 * @param {string|number|boolean} value - Attribute value
 */
export const setCrashlyticsAttribute = (key, value) => {
  try {
    crashlytics().setAttribute(key, String(value));
  } catch (error) {
    console.error('Error setting Crashlytics attribute:', error);
  }
};

/**
 * Record a non-fatal error
 * @param {Error} error - Error object to record
 * @param {object} attributes - Optional additional attributes
 */
export const recordError = (error, attributes = {}) => {
  try {
    // Set any additional attributes
    Object.entries(attributes).forEach(([key, value]) => {
      setCrashlyticsAttribute(key, value);
    });
    
    // Record the error
    crashlytics().recordError(error);
  } catch (crashlyticsError) {
    console.error('Error recording error to Crashlytics:', crashlyticsError);
  }
};

/**
 * Force a test crash (for testing purposes only)
 * WARNING: This will crash the app!
 */
export const crash = () => {
  crashlytics().crash();
};

/**
 * Initialize Crashlytics with user information
 * @param {object} userInfo - User information object
 */
export const initializeCrashlytics = (userInfo = {}) => {
  try {
    if (userInfo.userId) {
      setCrashlyticsUserId(userInfo.userId);
    }
    
    if (userInfo.email) {
      setCrashlyticsAttribute('user_email', userInfo.email);
    }
    
    if (userInfo.displayName) {
      setCrashlyticsAttribute('user_name', userInfo.displayName);
    }
    
    logCrashlytics('Crashlytics initialized');
  } catch (error) {
    console.error('Error initializing Crashlytics:', error);
  }
};

export default crashlytics;

