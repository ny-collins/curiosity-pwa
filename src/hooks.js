import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEYS } from './constants';

export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

export const useTheme = (localSettings) => {
  const [themeMode, setThemeMode] = useLocalStorage(STORAGE_KEYS.THEME_MODE, 'system');
  const [themeColor, setThemeColor] = useLocalStorage(STORAGE_KEYS.THEME_COLOR, '#14b8a6');
  const [themeFont, setThemeFont] = useLocalStorage(STORAGE_KEYS.THEME_FONT, "'Inter', sans-serif");
  const [fontSize, setFontSize] = useLocalStorage(STORAGE_KEYS.FONT_SIZE, '16px');
  const initializedRef = useRef(false);

  useEffect(() => {
    if (localSettings && !initializedRef.current) {
      if (localSettings.themeMode) setThemeMode(localSettings.themeMode);
      if (localSettings.themeColor) setThemeColor(localSettings.themeColor);
      if (localSettings.fontFamily) setThemeFont(localSettings.fontFamily);
      if (localSettings.fontSize) setFontSize(localSettings.fontSize);
      initializedRef.current = true;
    }
  }, [localSettings, setThemeMode, setThemeColor, setThemeFont, setFontSize]);

  // Apply theme immediately from localStorage, then update when IndexedDB loads
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--color-primary-hex', themeColor);
    
    let rgb = [20, 184, 172]; 
    if (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.test(themeColor)) {
         const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(themeColor);
         rgb = result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : rgb;
    }
    root.style.setProperty('--color-primary-rgb', `${rgb[0]},${rgb[1]},${rgb[2]}`);

  }, [themeColor]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--font-body', themeFont);
  }, [themeFont]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('font-size', fontSize);
  }, [fontSize]);

  return {
    themeMode, setThemeMode,
    themeColor, setThemeColor,
    themeFont, setThemeFont,
    fontSize, setFontSize
  };
};