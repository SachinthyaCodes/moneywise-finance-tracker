"use client";

import React from 'react';
import StripeSettings from '../StripeSettings';
import '../StripeSettings.css';

export default function StripeSettingsPage() {
  return (
    <div className="stripe-settings-page">
      <div className="stripe-settings-page__container">
        <StripeSettings />
      </div>
    </div>
  );
} 