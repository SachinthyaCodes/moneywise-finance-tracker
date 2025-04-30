import { FC, useState } from "react";

interface Income {
  id: string;
  source: string;
  amount: number;
  category: string;
}

interface IncomeEditModalProps {
  income: Income | null;
  onClose: () => void;
  onSave: (income: Income) => void;
}

const IncomeEditModal: FC<IncomeEditModalProps> = ({ income, onClose, onSave }) => {
  const [source, setSource] = useState(income?.source || "");
  const [amount, setAmount] = useState(income?.amount.toString() || "");
  const [category, setCategory] = useState(income?.category || "");

  const handleSave = () => {
    if (!source || !amount || !category) {
      alert("Please fill all fields.");
      return;
    }

    onSave({
      id: income?.id || "",
      source,
      amount: parseFloat(amount),
      category,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Edit Income</h2>
        <input
          type="text"
          placeholder="Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
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
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded mb-3"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomeEditModal;