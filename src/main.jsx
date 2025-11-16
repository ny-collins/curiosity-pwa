import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AppProvider } from './contexts/AppProvider.jsx';
import NotificationProvider from './components/NotificationProvider.jsx';
import PushNotificationProvider from './components/PushNotificationProvider.jsx';
import LoadingProvider from './components/LoadingProvider.jsx';
import { initPerformanceMonitoring } from './utils.js';

// Initialize performance monitoring
initPerformanceMonitoring();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <LoadingProvider>
        <NotificationProvider />
        <PushNotificationProvider />
        <App />
      </LoadingProvider>
    </AppProvider>
  </React.StrictMode>,
);