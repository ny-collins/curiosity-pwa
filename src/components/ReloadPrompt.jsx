import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import logger from '../logger';
function ReloadPrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      logger.error('PWA Service Worker registration error:', error);
    },
  });
  useEffect(() => {
    if (needRefresh) {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        }, { once: true });
      }
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);
  return null;
}
export default ReloadPrompt;
