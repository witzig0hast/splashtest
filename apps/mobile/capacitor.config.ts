import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.splashparty.app',
  appName: 'Splash Party',
  // The built web app is bundled into the APK (works even without the
  // Google Play services some WebViews need for a remote-URL shell).
  // The app talks to the Socket.IO game server separately over the
  // network — see src/lib/serverUrl.ts. That address is configurable at
  // runtime from the home screen, so the same APK works for the public
  // deployment and for offline LAN parties.
  webDir: '../web/dist',
  android: {
    allowMixedContent: true,
  },
};

export default config;
