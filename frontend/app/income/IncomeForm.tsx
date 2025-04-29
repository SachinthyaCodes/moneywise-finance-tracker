import { useState, useEffect, FC } from "react";
import { 
  BsWallet2, 
  BsBank2,
  BsCheckCircleFill
} from "react-icons/bs";
import { 
  HiOutlineDocumentText,
  HiOutlineCash,
  HiOutlineCollection
} from "react-icons/hi";
import { TbCurrencyRupee } from "react-icons/tb";
import { AiOutlinePlus } from "react-icons/ai";

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

const categoryOptions = [
  "Salary",
  "Freelance Work",
  "Business Revenue",
  "Investments",
  "Rental Income",
  "Bonuses & Commissions",
  "Pensions & Retirement",
];

const sourceOptions = ["Checking", "Savings", "Cash", "Credit Card", "PayPal"];

const IncomeForm: FC<IncomeFormProps> = ({ onAddIncome, onUpdateIncome, editData }) => {
  const [source, setSource] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [customSource, setCustomSource] = useState("");
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [showSourceInput, setShowSourceInput] = useState(false);
  const [categories, setCategories] = useState(categoryOptions);
  const [sources, setSources] = useState(sourceOptions);

  useEffect(() => {
    if (editData) {
      setSource(editData.source);
      setAmount(editData.amount.toString());
      setCategory(editData.category);
    }
  }, [editData]);

  // Handle custom category addition
  const handleAddCategory = () => {
    if (customCategory.trim() && !categories.includes(customCategory.trim())) {
      setCategories([...categories, customCategory.trim()]);
      setCategory(customCategory.trim());
      setCustomCategory("");
      setShowCategoryInput(false);
      // You might want to save this to localStorage or your backend
      localStorage.setItem('customCategories', JSON.stringify([...categories, customCategory.trim()]));
    }
  };

  // Handle custom source addition
  const handleAddSource = () => {
    if (customSource.trim() && !sources.includes(customSource.trim())) {
      setSources([...sources, customSource.trim()]);
      setSource(customSource.trim());
      setCustomSource("");
      setShowSourceInput(false);
      // You might want to save this to localStorage or your backend
      localStorage.setItem('customSources', JSON.stringify([...sources, customSource.trim()]));
    }
  };

  // Load custom categories and sources from localStorage on component mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('customCategories');
    const savedSources = localStorage.getItem('customSources');
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    if (savedSources) {
      setSources(JSON.parse(savedSources));
    }
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Source validation
    if (!source) newErrors.source = "Account is required";
    
    // Amount validation
    if (!amount) newErrors.amount = "Amount is required";
    else if (isNaN(parseFloat(amount))) newErrors.amount = "Invalid amount";
    else if (parseFloat(amount) <= 0) newErrors.amount = "Amount must be positive";
    
    // Category validation
    if (!category) newErrors.category = "Category is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (editData) {
        await onUpdateIncome(editData.id, source, parseFloat(amount), category);
      } else {
        await onAddIncome(source, parseFloat(amount), category);
      }
      
      // Reset form only if successful
      setSource("");
      setAmount("");
      setCategory("");
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-10 flex items-center">
        {editData ? (
          <>
            <HiOutlineDocumentText className="text-indigo-600 mr-3" size={24} />
            Edit Income Entry
          </>
        ) : (
          <>
            <HiOutlineCash className="text-indigo-600 mr-3" size={24} />
            New Income Entry
          </>
        )}
      </h2>
      
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-8">
        {/* Source Selection/Creation */}
        <div className="form-group">
          <label htmlFor="source">
            <BsBank2 />
            Account Source
          </label>
          <div className="relative">
            {!showSourceInput ? (
              <div className="select-wrapper">
                <select
                  id="source"
                  value={source}
                  onChange={(e) => {
                    if (e.target.value === "add_new") {
                      setShowSourceInput(true);
                    } else {
                      setSource(e.target.value);
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.source ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                >
                  <option value="">Select Account</option>
                  {sources.map((option) => (
                    <option key={option} value={option} className="py-2">
                      {option}
                    </option>
                  ))}
                  <option value="add_new" className="text-indigo-600 font-medium border-t border-gray-200">
                    + Add New Account
                  </option>
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={customSource}
                  onChange={(e) => setCustomSource(e.target.value)}
                  placeholder="Enter new account name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddSource}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Add Account
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSourceInput(false);
                      setCustomSource("");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          {errors.source && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.source}</p>
          )}
        </div>

        {/* Amount Input */}
        <div className="form-group">
          <label htmlFor="amount">
            <TbCurrencyRupee />
            Amount
          </label>
          <input
            id="amount"
            type="text"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, '');
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setAmount(value);
              }
            }}
            className={`w-full px-4 py-3 rounded-lg border ${
              errors.amount ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
          />
          {errors.amount && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>
          )}
        </div>

        {/* Category Selection/Creation */}
        <div className="form-group mt-4">
          <label htmlFor="category">
            <HiOutlineCollection />
            Income Category
          </label>
          <div className="relative">
            {!showCategoryInput ? (
              <div className="select-wrapper">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === "add_new") {
                      setShowCategoryInput(true);
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  } focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
                >
                  <option value="">Select Category</option>
                  {categories.map((option) => (
                    <option key={option} value={option} className="py-2">
                      {option}
                    </option>
                  ))}
                  <option value="add_new" className="text-indigo-600 font-medium border-t border-gray-200">
                    + Add New Category
                  </option>
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Add Category
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryInput(false);
                      setCustomCategory("");
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          {errors.category && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`mt-auto w-full py-4 px-4 rounded-lg font-semibold text-white ${
            isSubmitting
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          } transition-all duration-200 shadow-md hover:shadow-lg`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              {editData ? "Update Income" : "Add Income"}
            </span>
          )}
        </button>
      </form>
    </div>
  );
};

export default IncomeForm;