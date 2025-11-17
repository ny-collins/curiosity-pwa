// Vite plugin to inject Firebase config into service worker
import { readFileSync } from 'fs';

export function injectFirebaseConfig() {
  return {
    name: 'inject-firebase-config',
    apply: 'build',
    generateBundle(options, bundle) {
      // Find the service worker file
      const swFile = Object.keys(bundle).find(file => file === 'firebase-messaging-sw.js');
      
      if (swFile && bundle[swFile]) {
        const firebaseConfig = {
          apiKey: process.env.VITE_FIREBASE_API_KEY,
          authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.VITE_FIREBASE_APP_ID
        };

        // Replace the placeholder with actual config
        bundle[swFile].code = bundle[swFile].code.replace(
          '__FIREBASE_CONFIG__',
          JSON.stringify(firebaseConfig)
        );

        console.log('✓ Injected Firebase config into service worker');
      }
    }
  };
}
