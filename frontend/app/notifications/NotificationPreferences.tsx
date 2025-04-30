"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { Bell, Mail, BellRing, Calendar } from 'lucide-react';
import styles from './notifications.module.css';

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  daysBeforeDue: number;
}

const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    daysBeforeDue: 3
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data);
    } catch (error) {
      toast.error('Failed to load notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Saving notification preferences...');

    try {
      // Save the preferences
      const response = await api.put('/notifications/preferences', preferences);
      
      // Verify the saved preferences
      const verifyResponse = await api.get('/notifications/preferences');
      const savedPreferences = verifyResponse.data;
      
      // Check if preferences were saved correctly
      const isCorrectlySaved = 
        savedPreferences.emailNotifications === preferences.emailNotifications &&
        savedPreferences.pushNotifications === preferences.pushNotifications &&
        savedPreferences.daysBeforeDue === preferences.daysBeforeDue;

      toast.dismiss(loadingToast);
      
      if (isCorrectlySaved) {
        toast.success('Notification preferences saved successfully!', {
          duration: 3000,
          icon: '✅',
        });
      } else {
        toast.error('Preferences may not have saved correctly. Please verify your settings.', {
          duration: 5000,
        });
        // Refresh preferences from server
        await fetchPreferences();
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error saving preferences:', error);
      toast.error('Failed to save notification preferences. Please try again.', {
        duration: 5000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.iconWrapper}>
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className={styles.headerTitle}>Notification Settings</h1>
              <p className={styles.headerSubtitle}>Manage how you receive notifications about your bills</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Email Notifications Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Mail className="h-6 w-6 text-blue-600" />
                <h2 className={styles.sectionTitle}>Email Notifications</h2>
              </div>
              <p className={styles.sectionDescription}>
                Receive email notifications about your upcoming bills and payment status.
              </p>
              <div className={styles.setting}>
                <div className={styles.settingInfo}>
                  <label className={styles.settingLabel}>Enable Email Notifications</label>
                  <p className={styles.settingDescription}>Get notified via email when bills are due</p>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      emailNotifications: e.target.checked
                    })}
                    className={styles.toggleInput}
                  />
                  <div className={styles.toggleTrack}>
                    <div className={styles.toggleThumb} />
                  </div>
                </label>
              </div>
            </div>

            {/* Push Notifications Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <BellRing className="h-6 w-6 text-blue-600" />
                <h2 className={styles.sectionTitle}>Push Notifications</h2>
              </div>
              <p className={styles.sectionDescription}>
                Receive instant push notifications on your device about bill reminders.
              </p>
              <div className={styles.setting}>
                <div className={styles.settingInfo}>
                  <label className={styles.settingLabel}>Enable Push Notifications</label>
                  <p className={styles.settingDescription}>Get instant notifications on your device</p>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={preferences.pushNotifications}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      pushNotifications: e.target.checked
                    })}
                    className={styles.toggleInput}
                  />
                  <div className={styles.toggleTrack}>
                    <div className={styles.toggleThumb} />
                  </div>
                </label>
              </div>
            </div>

            {/* Notification Timing Section */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Calendar className="h-6 w-6 text-blue-600" />
                <h2 className={styles.sectionTitle}>Notification Timing</h2>
              </div>
              <p className={styles.sectionDescription}>
                Choose how many days before a bill is due you want to receive notifications.
              </p>
              <div className={styles.setting}>
                <div className={styles.settingInfo}>
                  <label className={styles.settingLabel}>Days Before Due</label>
                  <p className={styles.settingDescription}>When to receive notifications before bill due date</p>
                </div>
                <div className={styles.setting}>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={preferences.daysBeforeDue}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      daysBeforeDue: parseInt(e.target.value)
                    })}
                    className={styles.timingInput}
                  />
                  <span className={styles.timingUnit}>days</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className={styles.saveButton}>
              <button type="submit" className={styles.button}>
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences; 