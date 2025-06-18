"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './manageExpenses.module.css';
import { 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiTag, 
  FiDollarSign, 
  FiCalendar, 
  FiCreditCard, 
  FiFileText, 
  FiEye, 
  FiDownload,
  FiCalculator 
} from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast, Toaster } from 'react-hot-toast';

interface Expense {
  _id?: string;
  id?: string;
  userId: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  description?: string;
  createdAt?: string;
}

const ManageExpensesPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    date: '',
    paymentMethod: '',
    description: ''
  });
  const [showTotal, setShowTotal] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const categories = [
    'Food & Dining',
    'Transportation',
    'Housing',
    'Utilities',
    'Entertainment',
    'Shopping',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ];

  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'Bank Transfer',
    'Digital Wallet',
    'Other'
  ];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchExpenses();
  }, [user]);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      const data = await response.json();
      setExpenses(data.map((expense: any) => ({
        ...expense,
        id: expense._id
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      setExpenses(expenses.filter(expense => expense.id !== id));
      setShowDeleteConfirm(null);
      toast.success('Expense deleted successfully!', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to delete expense. Please try again.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      });
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense({
      ...expense,
      id: expense._id || expense.id
    });
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      date: formatDateForInput(expense.date),
      paymentMethod: expense.paymentMethod,
      description: expense.description || ''
    });
  };

  const handleView = (expense: Expense) => {
    setViewingExpense(expense);
  };

  const handleCloseView = () => {
    setViewingExpense(null);
  };

  const handleCloseEdit = () => {
    setEditingExpense(null);
    setFormData({
      category: '',
      amount: '',
      date: '',
      paymentMethod: '',
      description: ''
    });
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const validateDate = (date: string) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    return selectedDate <= today;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'date') {
      if (!validateDate(value)) {
        toast.error('Please select today\'s date or a past date', {
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        });
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !editingExpense.id) {
      setError('Invalid expense data');
      return;
    }

    if (!validateDate(formData.date)) {
      toast.error('Please select today\'s date or a past date', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      });
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          category: formData.category,
          amount: parseFloat(formData.amount),
          date: formData.date,
          paymentMethod: formData.paymentMethod,
          description: formData.description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update expense');
      }

      await fetchExpenses();
      handleCloseEdit();
      toast.success('Expense updated successfully!', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#10B981',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to update expense. Please try again.', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      });
    }
  };

  const downloadExpensePDF = (expense: Expense) => {
    const doc = new jsPDF();
    
    // Add title with styling
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246); // Blue color
    doc.text('Expense Details', 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // Gray color
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add expense information with better formatting
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55); // Dark gray color
    
    const details = [
      ['Category', expense.category],
      ['Amount', `$${expense.amount.toFixed(2)}`],
      ['Date', new Date(expense.date).toLocaleDateString()],
      ['Payment Method', expense.paymentMethod],
      ['Description', expense.description || 'N/A']
    ];

    autoTable(doc, {
      startY: 40,
      head: [['Field', 'Value']],
      body: details,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 12,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 11,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      styles: {
        cellPadding: 5,
        lineColor: [229, 231, 235],
        lineWidth: 0.5
      }
    });

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(
        'MoneyWise Finance Tracker',
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `expense-${expense._id || expense.id}-${date}.pdf`;
    
    // Save the PDF
    doc.save(filename);
  };

  const filteredExpenses = expenses.filter(expense => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      expense.description?.toLowerCase().includes(searchTermLower) ||
      expense.category.toLowerCase().includes(searchTermLower) ||
      expense.paymentMethod.toLowerCase().includes(searchTermLower) ||
      expense.amount.toString().includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    const matchesPaymentMethod = selectedPaymentMethod === 'all' || expense.paymentMethod === selectedPaymentMethod;
    return matchesSearch && matchesCategory && matchesPaymentMethod;
  });

  const calculateTotal = () => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalAmount(total);
    setShowTotal(true);
    toast.success(`Total Expenses: $${total.toFixed(2)}`, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading expenses...</p>
      </div>
    );
  }

  return (
    <div className={styles.manageExpensesPage}>
      <Toaster />
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Manage Expenses</h1>
          <p className={styles.pageSubtitle}>View and manage your expense records</p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={calculateTotal}
            className={styles.calculateButton}
            title="Calculate Total Expenses"
          >
            <FiDollarSign className={styles.calculateIcon} />
            Calculate Total
          </button>
          <button
            onClick={() => router.push('/expenses/add')}
            className={styles.addButton}
          >
            <FiPlus className={styles.addIcon} />
            Add Expense
          </button>
        </div>
      </div>

      {showTotal && (
        <div className={styles.totalContainer}>
          <div className={styles.totalCard}>
            <FiDollarSign className={styles.totalIcon} />
            <div className={styles.totalContent}>
              <h3 className={styles.totalLabel}>Total Expenses</h3>
              <p className={styles.totalAmount}>${totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.filtersContainer}>
        <div className={styles.searchContainer}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by description, category, payment method, or amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterContainer}>
          <FiFilter className={styles.filterIcon} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterContainer}>
          <FiFilter className={styles.filterIcon} />
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Payment Methods</option>
            {paymentMethods.map(method => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.expensesTableContainer}>
        {filteredExpenses.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No expenses found</p>
            <button
              onClick={() => router.push('/expenses/add')}
              className={styles.addButton}
            >
              <FiPlus className={styles.addIcon} />
              Add Your First Expense
            </button>
          </div>
        ) : (
          <table className={styles.expensesTable}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => (
                <tr key={expense.id}>
                  <td>{expense.category}</td>
                  <td>${expense.amount.toFixed(2)}</td>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>{expense.paymentMethod}</td>
                  <td>{expense.description}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleView(expense)}
                        className={styles.viewButton}
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleEdit(expense)}
                        className={styles.editButton}
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(expense.id)}
                        className={styles.deleteButton}
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Delete Expense</h2>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className={styles.closeButton}
                title="Close"
              >
                <FiX />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.warningIcon}>
                <FiTrash2 />
              </div>
              <p className={styles.confirmMessage}>
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className={styles.confirmDeleteButton}
              >
                Delete Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingExpense && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Expense Details</h2>
              <button onClick={handleCloseView} className={styles.closeButton} title="Close">
                <FiX />
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.detailCard}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FiTag className={styles.detailIcon} />
                    Category
                  </span>
                  <span className={styles.detailValue}>{viewingExpense.category}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FiDollarSign className={styles.detailIcon} />
                    Amount
                  </span>
                  <span className={styles.detailValue}>${viewingExpense.amount.toFixed(2)}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FiCalendar className={styles.detailIcon} />
                    Date
                  </span>
                  <span className={styles.detailValue}>{new Date(viewingExpense.date).toLocaleDateString()}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FiCreditCard className={styles.detailIcon} />
                    Payment Method
                  </span>
                  <span className={styles.detailValue}>{viewingExpense.paymentMethod}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>
                    <FiFileText className={styles.detailIcon} />
                    Description
                  </span>
                  <span className={styles.detailValue}>{viewingExpense.description || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => downloadExpensePDF(viewingExpense)}
                className={styles.downloadButton}
              >
                <FiDownload /> Download PDF
              </button>
              <button onClick={handleCloseView} className={styles.cancelButton}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editingExpense && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Edit Expense</h2>
              <button onClick={handleCloseEdit} className={styles.closeButton} title="Close">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="category">
                  <FiTag className={styles.labelIcon} />
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className={styles.select}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="amount">
                  <FiDollarSign className={styles.labelIcon} />
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="date">
                  <FiCalendar className={styles.labelIcon} />
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  max={getTodayDate()}
                  className={styles.input}
                />
                <small className={styles.helperText}>
                  Select today's date or a past date
                </small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="paymentMethod">
                  <FiCreditCard className={styles.labelIcon} />
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                  className={styles.select}
                >
                  <option value="">Select payment method</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">
                  <FiFileText className={styles.labelIcon} />
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  Save Changes
                </button>
                <button type="button" onClick={handleCloseEdit} className={styles.cancelButton}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageExpensesPage; 