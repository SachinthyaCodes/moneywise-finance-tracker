"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import ExpensesChart from "./ExpensesChart";
import ExpensesTable from "./ExpensesTable";
import ExpensesForm from "./ExpensesForm";
import "./expensespage.css"; // Import the CSS file
import Sidebar from "components/Sidebar";

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  method: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editData, setEditData] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalExpenses, setTotalExpenses] = useState<number | null>(null); // State for total expenses
  const formRef = useRef<HTMLDivElement>(null); // Reference to the form
  const tableRef = useRef<HTMLDivElement>(null); // Reference to the table

  useEffect(() => {
    axios
      .get<Expense[]>("http://localhost:5000/expense")
      .then((response) => {
        const formattedData = response.data.map((item) => ({
          ...item,
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
          }),
        }));
        setExpenses(formattedData);
      })
      .catch((error) => console.error("Error fetching expenses data:", error));
  }, []);

  const handleAddExpense = (category: string, amount: number, date: string, method: string) => {
    axios.post("http://localhost:5000/expense", { category, amount, date, method })
      .then((response) => setExpenses([...expenses, response.data]))
      .catch((error) => console.error("Error adding expense:", error));
  };

  const handleUpdateExpense = (id: string, category: string, amount: number, date: string, method: string) => {
    axios.put(`http://localhost:5000/expense/${id}`, { category, amount, date, method })
      .then((response) => {
        setExpenses(expenses.map((item) => (item.id === id ? response.data : item)));
        setEditData(null);
      })
      .catch((error) => console.error("Error updating expense:", error));
  };

  const handleDeleteExpense = (id: string) => {
    axios.delete(`http://localhost:5000/expense/${id}`)
      .then(() => setExpenses(expenses.filter((item) => item.id !== id)))
      .catch((error) => console.error("Error deleting expense:", error));
  };

  // Calculate Total Expenses
  const calculateTotalExpenses = () => {
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    setTotalExpenses(total);
  };

  // Filtered Expenses Data for Search
  const filteredExpenses = expenses.filter((item) =>
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Category-wise Summation
  const categoryTotals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* ✅ Header Section */}
      <div className="header">
        <h1>Welcome Back !</h1>
        <p>Manage and track your expenses effectively</p>
      </div>

      {/* ✅ Add Expense Section */}
      <div ref={formRef} className="add-expense">
        <h2>Add or Edit Expense</h2>
        <ExpensesForm
          onAddExpense={handleAddExpense}
          onUpdateExpense={handleUpdateExpense}
          editData={editData}
          tableRef={tableRef} // Pass the table reference
        />
      </div>

      {/* ✅ Expenses History Table with Search */}
      <div ref={tableRef} className="expenses-table">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search Category or Method..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ExpensesTable
          expenses={filteredExpenses}
          onDelete={handleDeleteExpense}
          onEdit={setEditData}
          formRef={formRef} // Pass the form reference
        />
      </div>

      {/* ✅ Charts Section */}
      <div className="chart-container">
        {/* Expenses Trends */}
        <div className="chart-card">
          <h2>Expenses Trends</h2>
          <ExpensesChart expenses={expenses} />
        </div>

        {/* Category Breakdown */}
        <div className="category-breakdown">
          <h2>Category Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div key={category} className="category-item">
                <span className="category-label">{category}</span>
                <span className="category-amount">Rs. {total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

  </div>
  );
}
