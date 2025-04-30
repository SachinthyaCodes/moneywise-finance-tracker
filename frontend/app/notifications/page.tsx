import React from 'react';
import NotificationPreferences from './NotificationPreferences';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Notification Settings</h1>
      <NotificationPreferences />
    </div>
  );
} 