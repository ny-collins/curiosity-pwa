import React, { useState, useEffect, createContext, useContext } from 'react';
import { messaging } from '../firebaseConfig';
import { getToken, onMessage } from 'firebase/messaging';
import { useAppState } from '../contexts/StateProvider';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { toast } from 'react-hot-toast';
import logger from '../logger';
const NotificationContext = createContext();
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
export const NotificationProvider = ({ children }) => {
  const { userId } = useAppState();
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [fcmToken, setFcmToken] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  useEffect(() => {
    if (userId) {
      const savedPreference = localStorage.getItem(`notifications_enabled_${userId}`);
      setNotificationsEnabled(savedPreference === 'true');
    } else {
      setNotificationsEnabled(false);
    }
  }, [userId]);
  const requestPermission = async () => {
    try {
      setIsLoading(true);
      if (!('Notification' in window)) {
        toast.error('This browser does not support notifications');
        return false;
      }
      if (!messaging) {
        toast.error('Firebase messaging is not available');
        return false;
      }
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationPermission('granted');
        toast.success('Notification permission granted!');
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });
        if (token) {
          setFcmToken(token);
          try {
            const updateFCMToken = httpsCallable(functions, 'updateFCMToken');
            await updateFCMToken({ fcmToken: token });
          } catch (error) {
            logger.error('Error saving FCM token:', error);
            toast.error('Notification token saved locally but may not persist');
          }
          return true;
        } else {
          toast.error('Failed to get notification token');
          return false;
        }
      } else {
        setNotificationPermission(permission);
        toast.error('Notification permission denied');
        return false;
      }
    } catch (error) {
      logger.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  const toggleNotifications = async (enabled) => {
    try {
      setIsLoading(true);
      if (enabled) {
        const success = await requestPermission();
        if (success) {
          setNotificationsEnabled(true);
          localStorage.setItem(`notifications_enabled_${userId}`, 'true');
          toast.success('Notifications enabled!');
        }
      } else {
        setNotificationsEnabled(false);
        localStorage.setItem(`notifications_enabled_${userId}`, 'false');
        toast.success('Notifications disabled');
      }
    } catch (error) {
      logger.error('Error toggling notifications:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };
  const sendTestNotification = async () => {
    if (!fcmToken) {
      toast.error('No notification token available');
      return;
    }
    try {
      const sendNotification = httpsCallable(functions, 'sendPushNotification');
      const result = await sendNotification({
        title: 'Curiosity',
        body: 'This is a test notification! 🎉',
        tag: 'test-notification',
        userId: userId
      });
      if (result.data.success) {
        toast.success('Test notification sent! Check your notifications.');
      } else {
        toast.error('Failed to send test notification');
      }
    } catch (error) {
      logger.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    }
  };
  useEffect(() => {
    if (messaging && notificationPermission === 'granted') {
      const unsubscribe = onMessage(messaging, (payload) => {
        toast(payload.notification?.body || 'New notification', {
          icon: '🔔',
          duration: 5000,
        });
        if (notificationPermission === 'granted') {
          new Notification(
            payload.notification?.title || 'Curiosity',
            {
              body: payload.notification?.body || 'You have a new notification',
              icon: '/icons/icon-192x192.png',
              tag: payload.data?.tag || 'foreground-notification'
            }
          );
        }
      });
      return () => unsubscribe();
    }
  }, [messaging, notificationPermission]);
  
  // Register Firebase Messaging Service Worker immediately on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js', { scope: '/firebase-cloud-messaging-push-scope' })
        .then((registration) => {
          logger.info('Firebase Messaging Service Worker registered:', registration);
        })
        .catch((error) => {
          logger.error('Firebase Messaging Service Worker registration failed:', error);
        });
    }
  }, []); // Run once on mount

  const value = {
    notificationPermission,
    fcmToken,
    notificationsEnabled,
    isLoading,
    requestPermission,
    toggleNotifications,
    sendTestNotification
  };
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
export default NotificationProvider;
