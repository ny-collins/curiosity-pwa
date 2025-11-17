#!/usr/bin/env node
// Inject Firebase config into the service worker after build
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the .env file
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse Firebase config from .env
const config = {};
const envLines = envContent.split('\n');
envLines.forEach(line => {
  const match = line.match(/^VITE_FIREBASE_(\w+)=(.+)$/);
  if (match) {
    const key = match[1].toLowerCase();
    const value = match[2].trim().replace(/['"]/g, '');
    
    // Map env variable names to Firebase config keys
    const keyMap = {
      'api_key': 'apiKey',
      'auth_domain': 'authDomain',
      'project_id': 'projectId',
      'storage_bucket': 'storageBucket',
      'messaging_sender_id': 'messagingSenderId',
      'app_id': 'appId'
    };
    
    if (keyMap[key]) {
      config[keyMap[key]] = value;
    }
  }
});

console.log('Firebase config parsed:', Object.keys(config));

// Read the service worker file
const swPath = path.join(process.cwd(), 'dist', 'firebase-messaging-sw.js');

if (!fs.existsSync(swPath)) {
  console.error('❌ Service worker file not found at:', swPath);
  process.exit(1);
}

let swContent = fs.readFileSync(swPath, 'utf8');

// Replace the placeholder with actual config
const configString = JSON.stringify(config, null, 2);
swContent = swContent.replace('__FIREBASE_CONFIG__', configString);

// Write back to the file
fs.writeFileSync(swPath, swContent, 'utf8');

console.log('✅ Firebase config injected successfully!');