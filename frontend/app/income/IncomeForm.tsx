import { useState, useEffect, FC } from "react";

interface Income {
  id: string;
  source: string;
  amount: number;
  category: string;
}

interface IncomeFormProps {
  onAddIncome: (source: string, amount: number, category: string) => void;
  onUpdateIncome: (id: string, source: string, amount: number, category: string) => void;
  editData: Income | null;
}

const IncomeForm: FC<IncomeFormProps> = ({ onAddIncome, onUpdateIncome, editData }) => {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    if (editData) {
      setSource(editData.source);
      setAmount(editData.amount.toString());
      setCategory(editData.category);
    }
  }, [editData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount || !category) {
      alert("Please fill all fields.");
      return;
    }

    if (editData) {
      onUpdateIncome(editData.id, source, parseFloat(amount), category);
    } else {
      onAddIncome(source, parseFloat(amount), category);
    }

    setSource("");
    setAmount("");
    setCategory("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" placeholder="Source" value={source} onChange={(e) => setSource(e.target.value)} className="w-full p-2 border rounded" />
      <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-2 border rounded" />
      <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded" />
      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">{editData ? "Update Income" : "Add Income"}</button>
    </form>
  );
};

export default IncomeForm;
