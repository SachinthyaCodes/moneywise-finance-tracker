import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from './components/Sidebar';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import NotificationPreferences from './notifications/NotificationPreferences';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
                maxWidth: '400px',
                textAlign: 'center' as const,
              },
              success: {
                style: {
                  background: '#22c55e',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
          <div className="app-layout">
            <Sidebar />
            <main className="app-layout__main">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
