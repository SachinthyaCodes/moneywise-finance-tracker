import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { FC } from "react";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Expense {
  category: string;
  amount: number;
}

interface ExpensesChartProps {
  expenses: Expense[];
}

const ExpensesChart: FC<ExpensesChartProps> = ({ expenses }) => {
  const categories = Array.from(new Set(expenses.map(item => item.category)));
  const amounts = categories.map(cat =>
    expenses.filter(item => item.category === cat).reduce((sum, item) => sum + item.amount, 0)
  );

  const data = {
    labels: categories,
    datasets: [
      {
        label: "Expenses Amount",
        data: amounts,
        backgroundColor: ["#EF4444", "#F59E0B"],
        borderWidth: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => {
            if (typeof value === "number") {
              return `Rs. ${value}`;
            }
            return value;
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default ExpensesChart;
