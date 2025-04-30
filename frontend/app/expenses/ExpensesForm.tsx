import { useState, useEffect, FC, RefObject } from "react";
import "./expenseform.css"; // Importing the CSS file

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  method: string;
}

interface ExpensesFormProps {
  onAddExpense: (category: string, amount: number, date: string, method: string) => void;
  onUpdateExpense: (id: string, category: string, amount: number, date: string, method: string) => void;
  editData: Expense | null;
  tableRef: RefObject<HTMLDivElement | null>; // Add tableRef property
}

const ExpensesForm: FC<ExpensesFormProps> = ({ onAddExpense, onUpdateExpense, editData, tableRef }) => {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [method, setMethod] = useState("");

  useEffect(() => {
    if (editData) {
      setCategory(editData.category);
      setAmount(editData.amount.toString());
      setDate(new Date(editData.date).toISOString().split("T")[0]); // Ensure date is in YYYY-MM-DD format
      setMethod(editData.method);
    }
  }, [editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !amount || !date || !method) {
      alert("Please fill all fields.....");
      return;
    }

    const selectedDate = new Date(date);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      alert("Date cannot be in the future...");
      return;
    }

    if (editData) {
      onUpdateExpense(editData.id, category, parseFloat(amount), date, method);
    } else {
      onAddExpense(category, parseFloat(amount), date, method);
    }

    setCategory("");
    setAmount("");
    setDate("");
    setMethod("");

    // Scroll to the ExpensesTable
    tableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <div className="input-group">
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Transport">Transport</option>
          <option value="Bills">Bills</option>
          <option value="Shopping">Shopping</option>
          <option value="Education">Education</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Medicine">Medicine</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="input-group">
        <label>Amount</label>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input-field"
          min="0"
          step="0.01"
        />
      </div>

      <div className="input-group">
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={today}
          className="input-field"
          onKeyDown={(e) => e.preventDefault()} // Prevent manual typing
        />
      </div>

      <div className="input-group">
        <label>Payment Method</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)} className="input-field">
          <option value="">Select Method</option>
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Bank Transfer">Bank Transfer</option>
        </select>
      </div>

      <button type="submit" className="submit-button">
        {editData ? "Update Expense" : "Add Expense"}
      </button>
    </form>
  );
};

export default ExpensesForm;
