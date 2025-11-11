import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AppProvider } from './contexts/AppProvider.jsx';
import NotificationProvider from './components/NotificationProvider.jsx';
import { initPerformanceMonitoring } from './utils.js';

// Initialize performance monitoring
initPerformanceMonitoring();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <NotificationProvider />
      <App />
    </AppProvider>
  </React.StrictMode>,
);