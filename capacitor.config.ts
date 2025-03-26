
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d1194a390e7b4684ab9d7a0ca4289d00',
  appName: 'safegroup-alerts',
  webDir: 'dist',
  server: {
    url: 'https://d1194a39-0e7b-4684-ab9d-7a0ca4289d00.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    contentInset: 'always',
  }
};

export default config;
