import { FC } from "react";

interface Income {
  id: string;
  source: string;
  date: string;
  category: string;
  amount: number;
}

interface IncomeTableProps {
  income: Income[];
  onDelete: (id: string) => void;
  onEdit: (income: Income) => void;
}

const IncomeTable: FC<IncomeTableProps> = ({ income, onDelete, onEdit }) => {
  return (
    <div className="max-w-3xl mx-auto mt-6 bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-center">Income History</h2>
      <div className="w-full flex justify-center">
        <table className="w-[600px] border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Source</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {income.length > 0 ? (
              income.map((item) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{item.date}</td>
                  <td className="p-2">{item.source}</td>
                  <td className="p-2">{item.category}</td>
                  <td className="p-2 font-medium">Rs. {item.amount.toFixed(2)}</td>
                  <td className="p-2">
                    <button onClick={() => onEdit(item)} className="text-blue-600 mr-2">✏️</button>
                    <button onClick={() => onDelete(item.id)} className="text-red-600">❌</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-2 text-center text-gray-500">No income records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeTable;
