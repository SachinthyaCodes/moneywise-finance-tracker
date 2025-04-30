"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './NavSidebar.css';

const Sidebar = () => {
  const pathname = usePathname();
  const [isRecurringBillsOpen, setIsRecurringBillsOpen] = useState(false);
  const [isIncomeOpen, setIsIncomeOpen] = useState(false);
  const [isAddIncomeSidebarOpen, setIsAddIncomeSidebarOpen] = useState(false);

  // Listen for the add income sidebar state
  useEffect(() => {
    const handleSidebarState = (e: CustomEvent) => {
      setIsAddIncomeSidebarOpen(e.detail.isOpen);
    };

    window.addEventListener('addIncomeSidebarState', handleSidebarState as EventListener);
    return () => {
      window.removeEventListener('addIncomeSidebarState', handleSidebarState as EventListener);
    };
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isIncomeActive = () => {
    return pathname?.startsWith('/income');
  };

  const isRecurringBillsActive = () => {
    return pathname?.startsWith('/recurringBills');
  };

  return (
    <div className={`nav-sidebar ${isAddIncomeSidebarOpen ? 'nav-sidebar--blurred' : ''}`}>
      <div className="nav-sidebar__header">
        <h1 className="nav-sidebar__title">MoneyWise</h1>
        <p className="nav-sidebar__subtitle">Finance Tracker</p>
      </div>

      <nav className="nav-sidebar__menu">
        <Link 
          href="/" 
          className={`nav-sidebar__link ${isActive('/') ? 'nav-sidebar__link--active' : ''}`}
        >
          <svg className="nav-sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </Link>

        <div className={`nav-sidebar__dropdown ${isIncomeActive() ? 'nav-sidebar__dropdown--active' : ''}`}>
          <button 
            className={`nav-sidebar__link nav-sidebar__dropdown-toggle ${isIncomeActive() ? 'nav-sidebar__link--active' : ''}`}
            onClick={() => setIsIncomeOpen(!isIncomeOpen)}
          >
            <svg className="nav-sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Income
            <svg 
              className={`nav-sidebar__dropdown-arrow ${isIncomeOpen ? 'nav-sidebar__dropdown-arrow--open' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className={`nav-sidebar__dropdown-content ${isIncomeOpen ? 'nav-sidebar__dropdown-content--open' : ''}`}>
            <Link 
              href="/income" 
              className={`nav-sidebar__dropdown-link ${isActive('/income') ? 'nav-sidebar__dropdown-link--active' : ''}`}
            >
              Overview
            </Link>
            <Link 
              href="/income/chart" 
              className={`nav-sidebar__dropdown-link ${isActive('/income/chart') ? 'nav-sidebar__dropdown-link--active' : ''}`}
            >
              Analytics
            </Link>
          </div>
        </div>

        <Link 
          href="/expenses" 
          className={`nav-sidebar__link ${isActive('/expenses') ? 'nav-sidebar__link--active' : ''}`}
        >
          <svg className="nav-sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Expenses
        </Link>

        <Link 
          href="/budgets" 
          className={`nav-sidebar__link ${isActive('/budgets') ? 'nav-sidebar__link--active' : ''}`}
        >
          <svg className="nav-sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Budgets
        </Link>

        <div className={`nav-sidebar__dropdown ${isRecurringBillsActive() ? 'nav-sidebar__dropdown--active' : ''}`}>
          <button 
            className={`nav-sidebar__link nav-sidebar__dropdown-toggle ${isRecurringBillsActive() ? 'nav-sidebar__link--active' : ''}`}
            onClick={() => setIsRecurringBillsOpen(!isRecurringBillsOpen)}
          >
            <svg className="nav-sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Recurring Bills
            <svg 
              className={`nav-sidebar__dropdown-arrow ${isRecurringBillsOpen ? 'nav-sidebar__dropdown-arrow--open' : ''}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className={`nav-sidebar__dropdown-content ${isRecurringBillsOpen ? 'nav-sidebar__dropdown-content--open' : ''}`}>
            <Link 
              href="/recurringBills/add" 
              className={`nav-sidebar__dropdown-link ${isActive('/recurringBills/add') ? 'nav-sidebar__dropdown-link--active' : ''}`}
            >
              Add New Bill
            </Link>
            <Link 
              href="/recurringBills/manage" 
              className={`nav-sidebar__dropdown-link ${isActive('/recurringBills/manage') ? 'nav-sidebar__dropdown-link--active' : ''}`}
            >
              Manage Bills
            </Link>
          </div>
        </div>

        <Link 
          href="/settings" 
          className={`nav-sidebar__link ${isActive('/settings') ? 'nav-sidebar__link--active' : ''}`}
        >
          <svg className="nav-sidebar__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
      </nav>

      <div className="nav-sidebar__footer">
        <Link href="/profile" className="nav-sidebar__profile">
          <div className="nav-sidebar__avatar">
            <svg className="nav-sidebar__avatar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="nav-sidebar__profile-info">
            <span className="nav-sidebar__profile-name">User Profile</span>
            <span className="nav-sidebar__profile-email">user@example.com</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar; 