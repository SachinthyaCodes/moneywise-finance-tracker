"use client";

import { addIncome, getIncome } from "../income-dashboard-frontend/utils/api";

import { useState, useEffect } from "react";

// Define the Income interface to ensure TypeScript type safety
interface Income {
  id: string;
  source: string;
  amount: number;
  category: string; // Added category field
}

export default function Home() {
  // State to store income records
  const [income, setIncome] = useState<Income[]>([]);
  // Form fields state
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(""); // Added category state

  // Fetch income records when the component mounts
  useEffect(() => {
    fetchIncome();
  }, []);

  // Function to fetch income records from the backend
  const fetchIncome = async () => {
    try {
      const data = await getIncome();
      setIncome(data);
    } catch (error) {
      console.error("Error fetching income:", error);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input fields
    if (!source.trim() || !amount.trim() || !category.trim()) {
      alert("Please fill all fields.");
      return;
    }

    try {
      // Convert amount to a float before sending to the backend
      const newIncome = await addIncome(source, parseFloat(amount), category);

      if (newIncome) {
        // Update UI with the new income entry
        setIncome((prev) => [...prev, newIncome]);
        // Clear input fields after submission
        setSource("");
        setAmount("");
        setCategory("");
      }
    } catch (error) {
      console.error("Error adding income:", error);
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">💰 Income Dashboard</h1>

      {/* Add Income Form */}
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <input
          type="text"
          placeholder="Source of Income"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          Add Income
        </button>
      </form>

      {/* Display Income List */}
      <h2 className="text-xl font-semibold mb-2">📊 Income Records</h2>
      <ul className="space-y-2">
        {income.length === 0 ? (
          <p>No income records found.</p>
        ) : (
          income.map((item) => (
            <li key={item.id} className="border p-2">
              <strong>{item.source}</strong> ({item.category}): ${item.amount.toFixed(2)}
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
