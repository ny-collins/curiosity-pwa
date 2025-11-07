// src/components/ReloadPrompt.jsx
import React, { useEffect } from 'react'; // Added useEffect
// This virtual import is provided by vite-plugin-pwa
import { useRegisterSW } from 'virtual:pwa-register/react';
// Icons are no longer needed as the prompt is not rendered
// import { X, RefreshCw } from 'lucide-react';

function ReloadPrompt() {
  const {
    needRefresh: [needRefresh], // We only need to read this state
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('PWA Service Worker registration error:', error);
    },
  });

  // This effect runs when needRefresh changes to true
  useEffect(() => {
    if (needRefresh) {
      // Create a listener that waits for the new service worker
      // to take control of the page.
      if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // This event fires *after* the new SW has activated.
          // It's now safe to reload the page.
          window.location.reload();
        }, { once: true }); // Use { once: true } so the listener cleans itself up.
      }

      // Tell the new service worker to skip waiting and activate.
      // This will eventually trigger the 'controllerchange' event.
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]); // Dependencies for the effect

  // This component no longer renders any visible UI
  return null; 
}

export default ReloadPrompt;
