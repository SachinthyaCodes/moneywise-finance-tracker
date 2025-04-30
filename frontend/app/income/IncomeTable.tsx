import { motion } from "framer-motion";
import { HiOutlineChevronUp, HiOutlineChevronDown } from "react-icons/hi";
import { HiPencil, HiTrash } from "react-icons/hi";
import { FaEdit, FaTrash } from "react-icons/fa";

interface Income {
  id: string;
  source: string;
  date: string;
  category: string;
  amount: number;
}

interface SortConfig {
  key: 'date' | 'amount';
  direction: 'ascending' | 'descending';
}

interface Props {
  income: Income[];
  onDelete: (id: string) => void;
  onEdit: (income: Income) => void;
  sortConfig: SortConfig;
  requestSort: (key: 'date' | 'amount') => void;
}

export default function IncomeTable({ income, onDelete, onEdit, sortConfig, requestSort }: Props) {
  const getSortIcon = (columnKey: 'date' | 'amount') => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'ascending' ? 
        <HiOutlineChevronUp className="w-4 h-4" /> : 
        <HiOutlineChevronDown className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6">
        <h2 className="text-xl font-semibold text-gray-800 pl-2">Income History</h2>
        <span className="text-sm text-gray-500 pr-4">{income.length} records</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => requestSort('date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {getSortIcon('date')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => requestSort('amount')}
              >
                <div className="flex items-center space-x-1">
                  <span>Amount</span>
                  {getSortIcon('amount')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {income.map((item) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {item.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{item.category}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rs. {item.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {item.source}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(item)}
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => onDelete(item.id)}
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}