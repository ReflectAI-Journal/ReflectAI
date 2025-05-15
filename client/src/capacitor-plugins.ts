// Initialize Capacitor plugins
import { Capacitor } from '@capacitor/core';

// Keep track of initialization to prevent duplicate registration
let isInitialized = false;

// Configure Capacitor plugins
export const initCapacitorPlugins = () => {
  // Only initialize once to prevent duplicate interface errors
  if (Capacitor.isNativePlatform() && !isInitialized) {
    console.log('Running on native platform, initializing Capacitor plugins');
    
    // Mark as initialized
    isInitialized = true;
  }
}; 