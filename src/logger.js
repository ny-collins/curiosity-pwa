const isDevelopment = import.meta.env.DEV;
export const logger = {
  log: (...args) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  info: (...args) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  warn: (...args) => {
    console.warn(...args);
  },
  error: (message, error) => {
    if (isDevelopment) {
      console.error(message, error);
    } else {
      console.error(message, error?.name || 'Error', error?.message || '');
    }
  },
  debug: (...args) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
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