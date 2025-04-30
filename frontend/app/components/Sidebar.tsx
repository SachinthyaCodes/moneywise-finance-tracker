"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';
import StripeSettings from '../recurringBills/StripeSettings';
import { LogOut } from 'lucide-react';
import styles from '../sidebar.module.css';

const Sidebar = () => {
  const pathname = usePathname();
  const [isRecurringBillsOpen, setIsRecurringBillsOpen] = useState(false);
  const [showStripeSettings, setShowStripeSettings] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isRecurringBillsActive = () => {
    return pathname?.startsWith('/recurringBills');
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      window.location.href = '/login';
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  // Get the first letter of the email for the avatar
  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">MoneyWise</h1>
        <p className="sidebar__subtitle">Finance Tracker</p>
      </div>

      <nav className="sidebar__nav">
        <Link 
          href="/" 
          className={`sidebar__link ${isActive('/') ? 'sidebar__link--active' : ''}`}
        >
          <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </Link>

        <div className={`sidebar__dropdown ${isRecurringBillsActive() ? 'sidebar__dropdown--active' : ''}`}>
          <button 
            className={`sidebar__link sidebar__dropdown-toggle ${isRecurringBillsActive() ? 'sidebar__link--active' : ''}`}
            onClick={() => setIsRecurringBillsOpen(!isRecurringBillsOpen)}
          >
            <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 8v13H3V8M1 3h22v5H1V3zM10 12h4" />
            </svg>
            Recurring Bills
            <svg 
              className={`sidebar__dropdown-arrow ${isRecurringBillsOpen ? 'sidebar__dropdown-arrow--open' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className={`sidebar__dropdown-content ${isRecurringBillsOpen ? 'sidebar__dropdown-content--open' : ''}`}>
            <Link 
              href="/recurringBills/add" 
              className={`sidebar__dropdown-link ${isActive('/recurringBills/add') ? 'sidebar__dropdown-link--active' : ''}`}
            >
              <svg className="sidebar__dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 4v16m8-8H4" />
              </svg>
              Add New Bill
            </Link>
            <Link 
              href="/recurringBills/manage" 
              className={`sidebar__dropdown-link ${isActive('/recurringBills/manage') ? 'sidebar__dropdown-link--active' : ''}`}
            >
              <svg className="sidebar__dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Manage Bills
            </Link>
            <Link 
              href="/recurringBills/dashboard" 
              className={`sidebar__dropdown-link ${isActive('/recurringBills/dashboard') ? 'sidebar__dropdown-link--active' : ''}`}
            >
              <svg className="sidebar__dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 8v8m-4-5v5M8 8v8m-5 0h18" />
              </svg>
              Bills Dashboard
            </Link>
            <Link 
              href="/recurringBills/stripe-settings" 
              className={`sidebar__dropdown-link ${isActive('/recurringBills/stripe-settings') ? 'sidebar__dropdown-link--active' : ''}`}
            >
              <svg className="sidebar__dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 10H2" />
                <path d="M7 15h4" />
              </svg>
              Auto-Pay Settings
            </Link>
          </div>
        </div>

        <Link 
          href="/expenses" 
          className={`sidebar__link ${isActive('/expenses') ? 'sidebar__link--active' : ''}`}
        >
          <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Expenses
        </Link>

        <Link 
          href="/budgets" 
          className={`sidebar__link ${isActive('/budgets') ? 'sidebar__link--active' : ''}`}
        >
          <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
            <path d="M12 8v4M8 8v4M16 8v4M12 2v6" />
          </svg>
          income
        </Link>

        <Link 
          href="/reports" 
          className={`sidebar__link ${isActive('/reports') ? 'sidebar__link--active' : ''}`}
        >
          <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Budget Analyzer
        </Link>

        <Link 
          href="/notifications" 
          className={`sidebar__link ${isActive('/notifications') ? 'sidebar__link--active' : ''}`}
        >
          <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notifications
        </Link>

        <Link 
          href="/settings" 
          className={`sidebar__link ${isActive('/settings') ? 'sidebar__link--active' : ''}`}
        >
          <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
      </nav>

      {!user ? (
        <div className={styles.logoutSection}>
          <Link href="/login" className={styles.loginButton}>
            <svg className="sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
            </svg>
            Sign In
          </Link>
        </div>
      ) : (
        <div className={styles.logoutSection}>
          <div className={styles.userAvatar}>
            {userInitial}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userEmail}>{user.email}</div>
            <button onClick={logout} className={styles.logoutButton}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}

      {showStripeSettings && (
        <div className="sidebar__modal">
          <div className="sidebar__modal-content">
            <div className="sidebar__modal-header">
              <h3 className="sidebar__modal-title">Auto-Pay Settings</h3>
              <button
                className="sidebar__modal-close"
                onClick={() => setShowStripeSettings(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="sidebar__modal-body">
              <StripeSettings isModal={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 