import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { FC } from "react";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Define Income type
interface Income {
  category: string;
  amount: number;
}

interface IncomeChartProps {
  income: Income[];
}

const IncomeChart: FC<IncomeChartProps> = ({ income }) => {
  const categories = Array.from(new Set(income.map(item => item.category)));
  const amounts = categories.map(cat => 
    income.filter(item => item.category === cat).reduce((sum, item) => sum + item.amount, 0)
  );

  const data = {
    labels: categories,
    datasets: [
      {
        label: "Income Amount",
        data: amounts,
        backgroundColor: ["#3B82F6", "#10B981"],
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

export default IncomeChart;