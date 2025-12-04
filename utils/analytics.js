// utils/analytics.js - Firebase Analytics utility

import analytics from '@react-native-firebase/analytics';

/**
 * Log a custom event
 * @param {string} eventName - Name of the event
 * @param {object} params - Optional event parameters
 */
export const logAnalyticsEvent = async (eventName, params = {}) => {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.error('Error logging analytics event:', error);
  }
};

/**
 * Set user ID for analytics
 * @param {string} userId - User ID to set (null to clear)
 */
export const setAnalyticsUserId = async (userId) => {
  try {
    if (userId) {
      await analytics().setUserId(userId);
    } else {
      await analytics().setUserId(null);
    }
  } catch (error) {
    console.error('Error setting analytics user ID:', error);
  }
};

/**
 * Set user properties
 * @param {object} properties - User properties object
 */
export const setAnalyticsUserProperties = async (properties) => {
  try {
    await Promise.all(
      Object.entries(properties).map(([key, value]) =>
        analytics().setUserProperty(key, String(value))
      )
    );
  } catch (error) {
    console.error('Error setting analytics user properties:', error);
  }
};

/**
 * Track screen view
 * @param {string} screenName - Name of the screen
 * @param {object} params - Optional screen parameters
 */
export const logScreenView = async (screenName, params = {}) => {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
      ...params,
    });
  } catch (error) {
    console.error('Error logging screen view:', error);
  }
};

// Pre-defined event helpers for common app actions
export const analyticsEvents = {
  // Authentication events
  login: (method) => logAnalyticsEvent('login', { method }),
  signUp: (method) => logAnalyticsEvent('sign_up', { method }),
  logout: () => logAnalyticsEvent('logout'),
  
  // Vehicle events
  vehicleAdded: (vehicleType) => logAnalyticsEvent('vehicle_added', { vehicle_type: vehicleType }),
  vehicleUpdated: () => logAnalyticsEvent('vehicle_updated'),
  vehicleDeleted: () => logAnalyticsEvent('vehicle_deleted'),
  vehicleViewed: () => logAnalyticsEvent('vehicle_viewed'),
  
  // Filling events
  fillingAdded: () => logAnalyticsEvent('filling_added'),
  fillingUpdated: () => logAnalyticsEvent('filling_updated'),
  fillingDeleted: () => logAnalyticsEvent('filling_deleted'),
  
  // Charging events
  chargingSessionAdded: () => logAnalyticsEvent('charging_session_added'),
  chargingSessionUpdated: () => logAnalyticsEvent('charging_session_updated'),
  chargingSessionDeleted: () => logAnalyticsEvent('charging_session_deleted'),
  
  // Settings events
  settingsChanged: (settingName) => logAnalyticsEvent('settings_changed', { setting_name: settingName }),
  languageChanged: (language) => logAnalyticsEvent('language_changed', { language }),
  
  // Export events
  dataExported: (format) => logAnalyticsEvent('data_exported', { format }),
};

export default analytics;

