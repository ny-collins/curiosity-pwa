import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AppProvider } from './contexts/AppProvider.jsx';
import NotificationProvider from './components/NotificationProvider.jsx';
import PushNotificationProvider from './components/PushNotificationProvider.jsx';
import LoadingProvider from './components/LoadingProvider.jsx';
import { initPerformanceMonitoring } from './utils.js';
initPerformanceMonitoring();
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LoadingProvider>
      <AppProvider>
        <NotificationProvider />
        <PushNotificationProvider>
          <App />
        </PushNotificationProvider>
      </AppProvider>
    </LoadingProvider>
  </React.StrictMode>,
);