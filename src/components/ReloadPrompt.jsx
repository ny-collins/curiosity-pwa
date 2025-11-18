import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import logger from '../logger';
import { motion, AnimatePresence } from 'framer-motion';

function ReloadPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      logger.error('PWA Service Worker registration error:', error);
    },
    onRegistered(registration) {
      logger.info('PWA Service Worker registered');
    },
    onNeedRefresh() {
      setShowPrompt(true);
    },
  });

  const handleUpdate = () => {
    setShowPrompt(false);
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-slate-800 border border-teal-500/20 rounded-lg shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200">
                  Update Available
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  A new version of Curiosity is available. Reload to update?
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleUpdate}
                    className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Reload
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium rounded-md transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ReloadPrompt;
