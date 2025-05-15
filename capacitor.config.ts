import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reflectai.app',
  appName: 'ReflectAI',
  webDir: 'dist/public',
  bundledWebRuntime: false,
  // Add server config
  server: {
    url: 'https://reflectai-n3f0.onrender.com',
    cleartext: true
  },
  // iOS specific settings
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true
  },
  // HTTP configuration
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    CapacitorCookies: {
      enabled: true
    }
  }
};

export default config; 