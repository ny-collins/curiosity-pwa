// src/custom-sw.js

// Make sure Workbox is loaded (vite-plugin-pwa handles this)
// if (workbox) { // Optional check
//   console.log(`Workbox is loaded`);
// } else {
//   console.log(`Workbox didn't load`);
// }

// Listen for Push Events
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  // Default title and options
  let title = 'Curiosity Reminder';
  let options = {
    body: 'You have a new reminder!',
    icon: '/icons/icon-192x192.png', // Icon shown in notification
    badge: '/icons/icon-96x96.png',  // Icon for notification tray (Android)
    // tag: 'reminder-notification', // Optional: Replace previous notifications with same tag
    // renotify: true,              // Optional: Vibrate/alert even if replacing
  };

  // Try to parse the incoming data as JSON
  try {
    const data = event.data.json();
    title = data.title || title;
    options = {
      ...options,
      body: data.body || options.body,
      // You can add more options like 'data' to pass info to notification click handler
      data: {
          url: data.url || '/', // URL to open on click
          // Add reminderId or entryId if needed
      },
      // actions: [ // Example actions
      //   { action: 'view-entry', title: 'View Entry' },
      //   { action: 'dismiss', title: 'Dismiss' },
      // ]
    };
  } catch (e) {
    // If data is not JSON, use the raw text as body
    options.body = event.data.text() || options.body;
  }


  // Show the notification
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Listen for Notification Click Events
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close(); // Close the notification

  // Get the URL from the notification's data (if set)
  const urlToOpen = event.notification.data?.url || '/'; 
  console.log('[Service Worker] Attempting to open:', urlToOpen);

  // Example action handling
  // if (event.action === 'view-entry') {
  //    // Logic for view entry action
  // } else {
  //    // Default action: Open the app
  // }

  // Focus or open the app window/tab
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true // Important to find clients not currently controlled
    }).then((clientList) => {
      // Check if a window/tab is already open
      for (const client of clientList) {
        // If found, focus it and navigate if needed
        if (client.url === urlToOpen && 'focus' in client) {
          console.log('[Service Worker] Focusing existing client.');
          return client.focus();
        }
      }
      // If not found, open a new window/tab
      if (clients.openWindow) {
        console.log('[Service Worker] Opening new window:', urlToOpen);
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
