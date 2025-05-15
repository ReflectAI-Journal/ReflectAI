// Initialize Capacitor plugins
import { Http } from '@capacitor/http';
import { Capacitor } from '@capacitor/core';

// Configure HTTP plugin
export const initCapacitorPlugins = () => {
  if (Capacitor.isNativePlatform()) {
    console.log('Running on native platform, initializing Capacitor plugins');
    
    // Expose HTTP plugin globally for debugging
    (window as any).CapacitorHttp = Http;
    
    // Initialize other plugins as needed
  }
};

// Export the HTTP plugin for use in your app
export { Http }; 