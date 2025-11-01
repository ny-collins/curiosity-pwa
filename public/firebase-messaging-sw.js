import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: "AIzaSyBmfZu_t_WtS1fZFQ6v2HqcitA8ODw6cWk",
  authDomain: "curiosity-pwa.firebaseapp.com",
  projectId: "curiosity-pwa",
  storageBucket: "curiosity-pwa.firebasestorage.app",
  messagingSenderId: "361925578003",
  appId: "1:361925578003:web:93fa63e239180f32061ee6",
  measurementId: "G-H6TK2EPB53"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icons/icon-192x192.png"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
