// Firebase Messaging Service Worker
// This file handles push notifications when the app is in the background
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// NOTE: This config needs to match your Firebase project
// Copy these values from your .env file (without the VITE_ prefix)
// Or better yet, update with your actual Firebase config values
const firebaseConfig = __FIREBASE_CONFIG__;

console.log('Firebase Messaging Service Worker initialized');

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Curiosity';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: payload.data?.tag || 'curiosity-notification',
    requireInteraction: false,
    silent: false,
    data: payload.data || {},
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // If not, open a new window/tab with the target URL
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push messages (fallback for when onBackgroundMessage doesn't work)
self.addEventListener('push', (event) => {
  console.log('Push received:', event);

  if (event.data) {
    const data = event.data.json();
    console.log('Push data:', data);

    const title = data.notification?.title || 'Curiosity';
    const options = {
      body: data.notification?.body || 'You have a new notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.data?.tag || 'curiosity-push',
      requireInteraction: false,
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'View'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});