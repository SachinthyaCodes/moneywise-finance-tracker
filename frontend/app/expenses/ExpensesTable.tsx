import { FC, useState, useEffect } from "react";
import "./expensesTable.css"; // Importing the CSS file

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  method: string;
}

interface ExpensesTableProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit: (expense: Expense) => void;
  formRef: React.RefObject<HTMLDivElement | null>; // Allow null
}

const ExpensesTable: FC<ExpensesTableProps> = ({ expenses, onDelete, onEdit, formRef }) => {
  const [totalExpenses, setTotalExpenses] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 2000); // hide message after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleCalculateTotal = () => {
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    setTotalExpenses(total);
  };

  const handleEdit = (expense: Expense) => {
    onEdit(expense);
    setMessage("Edit successful!");
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    onDelete(id);
    setMessage("Delete successful!");
  };

  return (
    <div className="expenses-container">
      <h2 className="expenses-title">History of Expenses</h2>

      {/* Message popup */}
      {message && <div className="popup-message">{message}</div>}

      <div className="expenses-table-wrapper">
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.category}</td>
                  <td className="amount">Rs. {item.amount.toFixed(2)}</td>
                  <td>{item.method}</td>
                  <td className="actions">
                    <button onClick={() => handleEdit(item)} className="edit-btn">✏️</button>
                    <button onClick={() => handleDelete(item.id)} className="delete-btn">❌</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="no-records">No expense records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalExpenses !== null && (
        <div className="total-expenses">
          Total Expenses: Rs. {totalExpenses.toLocaleString()}
        </div>
      )}

      <div className="calculate-button-wrapper">
        <button onClick={handleCalculateTotal} className="calculate-btn">
          Calculate Total
        </button>
      </div>
    </div>
  );
};

export default ExpensesTable;
