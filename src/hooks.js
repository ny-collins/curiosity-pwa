import { useState, useEffect } from 'react';

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

export const useTheme = (defaultSettings) => {
  const [themeMode, setThemeMode] = useLocalStorage('curiosity-theme-mode', 'system');
  const [themeColor, setThemeColor] = useLocalStorage('curiosity-theme-color', '#14b8a6');
  const [themeFont, setThemeFont] = useLocalStorage('curiosity-theme-font', "'Inter', sans-serif");
  const [fontSize, setFontSize] = useLocalStorage('curiosity-font-size', '16px'); // New state
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (defaultSettings && !isInitialized) {
      if (defaultSettings.themeColor) setThemeColor(defaultSettings.themeColor);
      if (defaultSettings.fontFamily) setThemeFont(defaultSettings.fontFamily);
      if (defaultSettings.fontSize) setFontSize(defaultSettings.fontSize); // New
      setIsInitialized(true);
    }
  }, [defaultSettings, isInitialized, setThemeColor, setThemeFont, setFontSize]);

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

  // New effect for font size
  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('font-size', fontSize);
  }, [fontSize]);

  return {
    themeMode, setThemeMode,
    themeColor, setThemeColor,
    themeFont, setThemeFont,
    fontSize, setFontSize // Expose new state
  };
};
