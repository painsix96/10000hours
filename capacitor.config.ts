import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.onehour.app',
  appName: '一万小时',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
