import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reflectai.app',
  appName: 'ReflectAI',
  webDir: 'dist/public',
  bundledWebRuntime: false,
  // Server configuration - explicitly using the Render URL
  server: {
    url: 'https://reflectai-n3f0.onrender.com',
    cleartext: true,
    hostname: 'reflectai-n3f0.onrender.com',
    androidScheme: 'https'
  },
  // iOS specific settings
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
    // Force using server URL
    overrideUserAgent: 'ReflectAI iOS App'
  },
  // Plugin configuration
  plugins: {
    CapacitorCookies: {
      enabled: true
    }
  }
};

export default config; 