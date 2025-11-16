import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});

  const startLoading = useCallback((key, message = 'Loading...') => {
    setLoadingStates(prev => ({ ...prev, [key]: { active: true, message } }));
  }, []);

  const stopLoading = useCallback((key) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  const isLoading = useCallback((key) => {
    return loadingStates[key]?.active || false;
  }, [loadingStates]);

  const getLoadingMessage = useCallback((key) => {
    return loadingStates[key]?.message || '';
  }, [loadingStates]);

  const globalLoading = Object.keys(loadingStates).length > 0;
  const globalMessage = Object.values(loadingStates)[0]?.message || 'Loading...';

  return (
    <LoadingContext.Provider value={{ startLoading, stopLoading, isLoading, getLoadingMessage, globalLoading }}>
      {children}
      
      {/* Global loading indicator */}
      <AnimatePresence>
        {globalLoading && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary" style={{ color: 'var(--color-primary-hex)' }} />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {globalMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;
