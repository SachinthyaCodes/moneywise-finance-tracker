"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import IncomeTable from "./IncomeTable";
import IncomeForm from "./IncomeForm";
import "../../styles/incomeStyles.css";
import "../../styles/globals.css";
import { FaPlus, FaEdit, FaTrash, FaSort } from "react-icons/fa";
import { HiOutlineCash, HiOutlineX } from "react-icons/hi";
import { BiMoneyWithdraw } from "react-icons/bi";
import { BsWallet2 } from "react-icons/bs";
import { FaWallet, FaMoneyBillWave, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";
import { IoWalletOutline } from "react-icons/io5";
import { BsCashStack, BsClock } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { MdAccountBalance, MdAttachMoney, MdAccessTime } from "react-icons/md";
import { HiOutlineCurrencyDollar, HiOutlineChartBar, HiOutlineCreditCard } from "react-icons/hi";

interface Income {
  id: string;
  source: string;
  date: string;
  category: string;
  amount: number;
  
}

type SortKey = 'date' | 'amount';
type SortDirection = 'ascending' | 'descending';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export default function IncomePage() {
  const [income, setIncome] = useState<Income[]>([]);
  const [editData, setEditData] = useState<Income | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'date',
    direction: 'descending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios
      .get<Income[]>("http://localhost:5000/income")
      .then((response) => {
        const formattedData = response.data.map((item) => ({
          ...item,
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          }),
        }));
        setIncome(formattedData);
      })
      .catch((error) => console.error("Error fetching income data:", error));
  }, []);

  const handleAddIncome = async (source: string, amount: number, category: string) => {
    try {
      const response = await axios.post("http://localhost:5000/income", { 
        source, 
        amount, 
        category 
      });
      setIncome([...income, response.data]);
      
      // Success notification
      toast.custom((t) => (
        <div className={`modern-toast-content ${t.visible ? 'show' : ''}`}>
          <div className="toast-icon-container success">
            <svg className="toast-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
            </svg>
          </div>
          <div className="toast-message">
            <h4>Success!</h4>
            <p>New income added successfully</p>
          </div>
        </div>
      ));
    } catch (error) {
      toast.custom((t) => (
        <div className={`modern-toast-content ${t.visible ? 'show' : ''}`}>
          <div className="toast-icon-container error">
            <svg className="toast-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.31 7.526c-.099-.807.528-1.526 1.348-1.526.771 0 1.377.676 1.28 1.451l-.757 6.053c-.035.283-.276.496-.561.496s-.526-.213-.562-.496l-.748-5.978zm1.31 10.724c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
            </svg>
          </div>
          <div className="toast-message">
            <h4>Error</h4>
            <p>Failed to add income. Please try again.</p>
          </div>
        </div>
      ));
      console.error("Error adding income:", error);
    }
  };

  const handleUpdateIncome = async (id: string, source: string, amount: number, category: string) => {
    try {
      const response = await axios.put(`http://localhost:5000/income/${id}`, { 
        source, 
        amount, 
        category 
      });
      setIncome(income.map((item) => (item.id === id ? response.data : item)));
      setEditData(null);
      setIsModalOpen(false);
      
      // Success notification
      toast.custom((t) => (
        <div className={`modern-toast-content ${t.visible ? 'show' : ''}`}>
          <div className="toast-icon-container success">
            <svg className="toast-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
            </svg>
          </div>
          <div className="toast-message">
            <h4>Success!</h4>
            <p>Income updated successfully</p>
          </div>
        </div>
      ));
    } catch (error) {
      toast.custom((t) => (
        <div className={`modern-toast-content ${t.visible ? 'show' : ''}`}>
          <div className="toast-icon-container error">
            <svg className="toast-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.31 7.526c-.099-.807.528-1.526 1.348-1.526.771 0 1.377.676 1.28 1.451l-.757 6.053c-.035.283-.276.496-.561.496s-.526-.213-.562-.496l-.748-5.978zm1.31 10.724c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
            </svg>
          </div>
          <div className="toast-message">
            <h4>Error</h4>
            <p>Failed to update income. Please try again.</p>
          </div>
        </div>
      ));
      console.error("Error updating income:", error);
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/income/${id}`);
      setIncome(income.filter((item) => item.id !== id));
      
      // Success notification
      toast.custom((t) => (
        <div className={`modern-toast-content ${t.visible ? 'show' : ''}`}>
          <div className="toast-icon-container success">
            <svg className="toast-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
            </svg>
          </div>
          <div className="toast-message">
            <h4>Success!</h4>
            <p>Income deleted successfully</p>
          </div>
        </div>
      ));
    } catch (error) {
      toast.custom((t) => (
        <div className={`modern-toast-content ${t.visible ? 'show' : ''}`}>
          <div className="toast-icon-container error">
            <svg className="toast-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.31 7.526c-.099-.807.528-1.526 1.348-1.526.771 0 1.377.676 1.28 1.451l-.757 6.053c-.035.283-.276.496-.561.496s-.526-.213-.562-.496l-.748-5.978zm1.31 10.724c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
            </svg>
          </div>
          <div className="toast-message">
            <h4>Error</h4>
            <p>Failed to delete income. Please try again.</p>
          </div>
        </div>
      ));
      console.error("Error deleting income:", error);
    }
  };

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedIncome = [...income].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
    } else {
      return sortConfig.direction === 'ascending' 
        ? a.amount - b.amount 
        : b.amount - a.amount;
    }
  });

  const handleFormSubmit = async (source: string, amount: number, category: string, id?: string) => {
    try {
      setIsSubmitting(true);
      if (editData && id) {
        await handleUpdateIncome(id, source, amount, category);
      } else {
        await handleAddIncome(source, amount, category);
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.custom((t) => (
        <div className={`modern-toast-content ${t.visible ? 'show' : ''}`}>
          <div className="toast-icon-container error">
            <svg className="toast-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.31 7.526c-.099-.807.528-1.526 1.348-1.526.771 0 1.377.676 1.28 1.451l-.757 6.053c-.035.283-.276.496-.561.496s-.526-.213-.562-.496l-.748-5.978zm1.31 10.724c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
            </svg>
          </div>
          <div className="toast-message">
            <h4>Error</h4>
            <p>Something went wrong. Please try again.</p>
          </div>
        </div>
      ));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalOpen = (isOpen: boolean) => {
    setIsModalOpen(isOpen);
    const event = new CustomEvent('addIncomeModalState', { 
      detail: { isOpen } 
    });
    window.dispatchEvent(event);
  };

  const closeModal = () => {
    handleModalOpen(false);
  };

  return (
    <div className="income-page">
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          className: 'modern-toast',
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            padding: '16px 24px',
            borderRadius: '12px',
            fontSize: '14px',
            maxWidth: '380px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            backdropFilter: 'blur(8px)',
          },
          success: {
            style: {
              background: 'linear-gradient(to right, #10B981, #059669)',
              color: '#ffffff',
              border: 'none',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#059669',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(to right, #EF4444, #DC2626)',
              color: '#ffffff',
              border: 'none',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#DC2626',
            },
          },
        }}
      />
      <h1 className="income-header">Welcome Back, John</h1>
      <p className="income-header2">Track your income goals effectively</p>
      <button
        className="add-income-btn"
        onClick={() => handleModalOpen(true)}
      >
        <FaPlus size={14} />
        Add Income
      </button>

      <div className="income-content">
        <div className="income-summary">
          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="income-card group relative overflow-hidden"
          >
            <div className="flex items-center justify-between relative">
              <div>
                <div className="flex items-center mb-3">
                  <div className="text-lg font-semibold text-gray-700">
                    <h3>Total Balance</h3>
                    <p className="text-sm text-gray-500">All time earnings</p>
                  </div>
                </div>
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.p 
                    className="text-3xl font-bold text-gray-800"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    Rs. {income.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </motion.p>
                </motion.div>
              </div>
              <div className="flex flex-col items-end">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <HiOutlineCurrencyDollar size={24} className="text-indigo-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="income-card group relative overflow-hidden"
          >
            <div className="flex items-center justify-between relative">
              <div>
                <div className="flex items-center mb-3">
                  <div className="text-lg font-semibold text-gray-700">
                    <h3>Monthly Income</h3>
                    <p className="text-sm text-gray-500">Current month</p>
                  </div>
                </div>
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.p 
                    className="text-3xl font-bold text-gray-800"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    Rs. {
                      income
                        .filter((item) => new Date(item.date).getMonth() + 1 === new Date().getMonth() + 1)
                        .reduce((sum, item) => sum + item.amount, 0)
                        .toLocaleString()
                    }
                  </motion.p>
                </motion.div>
              </div>
              <div className="flex flex-col items-end">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <HiOutlineChartBar size={24} className="text-emerald-600" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="income-card group relative overflow-hidden"
          >
            <div className="flex items-center justify-between relative">
              <div>
                <div className="flex items-center mb-3">
                  <div className="text-lg font-semibold text-gray-700">
                    <h3>Recent Income</h3>
                    <p className="text-sm text-gray-500">Latest transaction</p>
                  </div>
                </div>
                {income.length > 0 ? (
                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-sm text-gray-500 mb-1">{income[income.length - 1].source}</p>
                    <motion.p 
                      className="text-3xl font-bold text-gray-800"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      +Rs. {income[income.length - 1].amount.toLocaleString()}
                    </motion.p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(income[income.length - 1].date).toLocaleDateString()}
                    </p>
                  </motion.div>
                ) : (
                  <p className="text-gray-500">No income added yet.</p>
                )}
              </div>
              <div className="flex flex-col items-end">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <HiOutlineCreditCard size={24} className="text-purple-600" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="income-table-container">
          <IncomeTable 
            income={sortedIncome} 
            onDelete={handleDeleteIncome} 
            onEdit={(data) => {
              setEditData(data);
              setIsModalOpen(true);
            }}
            sortConfig={sortConfig}
            requestSort={requestSort}
          />
        </div>

        <AnimatePresence mode="wait">
          {isModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="modal-overlay"
                onClick={() => closeModal()}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  type: 'spring',
                  damping: 20,
                  stiffness: 300
                }}
                className="modal-container"
              >
                <div className="modal-content">
                  <motion.div 
                    className="modal-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.2 }}
                  >
                    <h2 className="modal-title">
                      {editData ? (
                        <>
                          <BsWallet2 size={20} className="text-indigo-600" />
                          Edit Income
                        </>
                      ) : (
                        <>
                          <HiOutlineCash size={20} className="text-indigo-600" />
                          Add New Income
                        </>
                      )}
                    </h2>
                    <button
                      className="modal-close-btn"
                      onClick={() => closeModal()}
                    >
                      <IoClose size={18} />
                    </button>
                  </motion.div>
                  
                  <motion.div 
                    className="modal-body"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15, duration: 0.2 }}
                  >
                    <IncomeForm 
                      onAddIncome={(source, amount, category) => handleFormSubmit(source, amount, category)}
                      onUpdateIncome={(id, source, amount, category) => handleFormSubmit(source, amount, category, id)}
                      editData={editData}
                    />
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}