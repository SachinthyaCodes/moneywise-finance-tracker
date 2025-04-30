import { FC, useState } from "react";

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  method: string;
}

interface ExpensesEditModalProps {
  expense: Expense | null;
  onClose: () => void;
  onSave: (expense: Expense) => void;
}

const ExpensesEditModal: FC<ExpensesEditModalProps> = ({ expense, onClose, onSave }) => {
  const [category, setCategory] = useState(expense?.category || "");
  const [amount, setAmount] = useState(expense?.amount.toString() || "");
  const [date, setDate] = useState(expense?.date || "");
  const [method, setMethod] = useState(expense?.method || "");

  const handleSave = () => {
    if (!category || !amount || !date || !method) {
      alert("Please fill all fields.");
      return;
    }

    onSave({
      id: expense?.id || "",
      category,
      amount: parseFloat(amount),
      date,
      method,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Edit Expense</h2>
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="date"
          placeholder="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <input
          type="text"
          placeholder="Method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-red-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpensesEditModal;
