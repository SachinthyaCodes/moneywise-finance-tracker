"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import IncomeChart from "./IncomeChart";
import IncomeTable from "./IncomeTable";
import IncomeForm from "./IncomeForm";

interface Income {
  id: string;
  source: string;
  date: string;
  category: string;
  amount: number;
  account?: string;
}

export default function IncomePage() {
  const [income, setIncome] = useState<Income[]>([]);
  const [editData, setEditData] = useState<Income | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleAddIncome = (source: string, amount: number, category: string) => {
    axios.post("http://localhost:5000/income", { source, amount, category })
      .then((response) => setIncome([...income, response.data]))
      .catch((error) => console.error("Error adding income:", error));
  };

  const handleUpdateIncome = (id: string, source: string, amount: number, category: string) => {
    axios.put(`http://localhost:5000/income/${id}`, { source, amount, category })
      .then((response) => {
        setIncome(income.map((item) => (item.id === id ? response.data : item)));
        setEditData(null);
      })
      .catch((error) => console.error("Error updating income:", error));
  };

  const handleDeleteIncome = (id: string) => {
    axios.delete(`http://localhost:5000/income/${id}`)
      .then(() => setIncome(income.filter((item) => item.id !== id)))
      .catch((error) => console.error("Error deleting income:", error));
  };

  // Filtered Income Data for Search
  const filteredIncome = income.filter((item) =>
    item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Category-wise Summation
  const categoryTotals = income.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* ✅ Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold">Welcome Back, John</h1>
        <p className="text-sm opacity-90">Manage and track your income goals effectively</p>
      </div>

      {/* ✅ Add Income Section */}
      <div className="w-[300px] mx-auto mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-center">Add or Edit Income</h2>
        <IncomeForm onAddIncome={handleAddIncome} onUpdateIncome={handleUpdateIncome} editData={editData} />
      </div>

      {/* ✅ Income History Table with Search */}
      <div className="max-w-4xl mx-auto mt-6 bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          
          <input
            type="text"
            placeholder="Search income..."
            className="p-2 border rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <IncomeTable income={filteredIncome} onDelete={handleDeleteIncome} onEdit={setEditData} />
      </div>

      {/* ✅ Charts Section */}
      <div className="w-[500px] mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Trends */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Income Trends</h2>
          <IncomeChart income={income} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-md ">
          <h2 className="text-lg font-semibold mb-4 ">Category Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-700">{category}</span>
                <span className="font-medium">Rs. {total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Progress Section */}
      <div className="w-[500px] mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {/* Progress Bar */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Progress Bar</h2>
            <span className="text-sm text-blue-600">70%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: "70%" }} />
          </div>
          <p className="mt-2 text-sm text-gray-500">70% completed</p>
        </div>

        {/* Income vs Expenses */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Income vs. Expenses</h2>
            <span className="text-sm text-green-600">110%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: "110%" }} />
          </div>
          <p className="mt-2 text-sm text-gray-500">110% of target</p>
        </div>
      </div>
    </div>
  );
}
