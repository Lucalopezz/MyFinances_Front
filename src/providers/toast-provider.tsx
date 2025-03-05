'use client';
import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#F9FAFB', 
          color: '#1F2937',      
          border: '1px solid #9CA3AF', 
        },
        success: {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#F9FAFB',      
          },
          iconTheme: {
            primary: '#F9FAFB',
            secondary: '#10B981',
          },
        },
        error: {
          style: {
            background: '#EF4444',
            color: '#F9FAFB',      
          },
          iconTheme: {
            primary: '#F9FAFB',
            secondary: '#EF4444',
          },
        },
      }}
    />
  );
}
