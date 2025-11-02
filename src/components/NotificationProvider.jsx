import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useTheme } from '../hooks';

export default function NotificationProvider() {
  const { themeColor, themeMode, themeFont } = useTheme();

  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 3000,
        style: {
          fontFamily: themeFont,
          background: themeMode === 'dark' ? '#1e293b' : '#ffffff', // slate-800 or white
          color: themeMode === 'dark' ? '#f1f5f9' : '#0f172a', // slate-100 or slate-900
          border: `1px solid ${themeColor}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        success: {
          iconTheme: {
            primary: themeColor,
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#f43f5e', // rose-500
            secondary: '#ffffff',
          },
          style: {
            borderColor: '#f43f5e',
          },
        },
      }}
    />
  );
}

export const useToaster = () => {
    return toast;
};
