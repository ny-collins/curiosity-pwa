/**
 * Safe logging utility that respects production environment
 * Prevents sensitive data from being logged in production
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  // Log general information (disabled in production)
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  // Log warnings (enabled in production)
  warn: (...args) => {
    console.warn(...args);
  },

  // Log errors (enabled in production, but sanitize sensitive data)
  error: (message, error) => {
    if (isDevelopment) {
      console.error(message, error);
    } else {
      // In production, log only the message and error type, not full stack
      console.error(message, error?.name || 'Error', error?.message || '');
    }
  },

  // Debug logging (development only)
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  // Performance logging (development only)
  perf: (label, fn) => {
    if (isDevelopment) {
      console.time(label);
    }
    const result = fn();
    if (isDevelopment) {
      console.timeEnd(label);
    }
    return result;
  },

  // Async performance logging (development only)
  perfAsync: async (label, fn) => {
    if (isDevelopment) {
      console.time(label);
    }
    const result = await fn();
    if (isDevelopment) {
      console.timeEnd(label);
    }
    return result;
  },
};

export default logger;
