// Script to generate firebase-messaging-sw.js with environment variables
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const template = readFileSync(join(__dirname, '../public/firebase-messaging-sw.template.js'), 'utf-8');

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const output = template.replace('__FIREBASE_CONFIG__', JSON.stringify(config, null, 2));

writeFileSync(join(__dirname, '../dist/firebase-messaging-sw.js'), output);
console.log('✓ Generated firebase-messaging-sw.js with environment config');
