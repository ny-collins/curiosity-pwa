import React from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useAppState } from '../contexts/StateProvider';
export default function NotificationProvider() {
  const { themeColor, themeMode, themeFont } = useAppState();
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: themeFont,
          background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
          color: themeMode === 'dark' ? '#f1f5f9' : '#0f172a',
          border: `1px solid ${themeColor}`,
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          padding: '12px 16px',
          maxWidth: '400px',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: themeColor,
            secondary: '#ffffff',
          },
          style: {
            background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            borderColor: themeColor,
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
          style: {
            borderColor: '#ef4444',
          },
        },
        loading: {
          iconTheme: {
            primary: themeColor,
            secondary: '#ffffff',
          },
        },
      }}
      containerStyle={{
        bottom: 24,
        right: 24,
      }}
    />
  );
}
export const useToaster = () => {
    return toast;
};
