import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { RecurringBill } from './types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './RecurringCharts.css';
import { toast } from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

interface RecurringChartsProps {
  bills: RecurringBill[];
}

// Category mapping with common subscription names
const CATEGORY_MAPPING: { [key: string]: string[] } = {
  'Streaming': ['netflix', 'spotify', 'youtube', 'prime', 'hulu', 'disney', 'hbo', 'peacock', 'apple tv'],
  'Utilities': ['electricity', 'water', 'gas', 'internet', 'phone', 'mobile', 'cable', 'broadband'],
  'Housing': ['rent', 'mortgage', 'insurance', 'maintenance', 'hoa', 'property tax'],
  'Transportation': ['uber', 'lyft', 'transit', 'parking', 'fuel', 'gasoline', 'car insurance'],
  'Health & Fitness': ['gym', 'fitness', 'health insurance', 'medical', 'dental', 'pharmacy'],
  'Education': ['course', 'learning', 'education', 'student loan', 'university', 'college'],
  'Entertainment': ['gaming', 'subscription', 'membership', 'club', 'magazine'],
  'Shopping': ['amazon', 'walmart', 'target', 'costco', 'sam\'s club', 'subscription box'],
  'Financial': ['bank', 'credit card', 'loan', 'investment', 'brokerage', 'crypto'],
  'Other': [] // Default category
};

// Helper function to identify category from bill name
const identifyCategory = (billName: string): string => {
  const normalizedName = billName.toLowerCase().trim();
  
  for (const [category, keywords] of Object.entries(CATEGORY_MAPPING)) {
    if (keywords.some(keyword => normalizedName.includes(keyword))) {
      return category;
    }
  }
  
  return 'Other';
};

// Add DownloadIcon component
const DownloadIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const RecurringCharts: React.FC<RecurringChartsProps> = ({ bills }) => {
  const chartsRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!chartsRef.current) return;

    try {
      toast.loading('Generating PDF report...', {
        id: 'pdf-loading',
        duration: Infinity,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add header
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, 210, 30, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('Financial Analytics Report', 105, 20, { align: 'center' });

      // Add summary
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
      const autoPayCount = bills.filter(bill => bill.autoPay).length;
      
      pdf.text([
        `Generated: ${new Date().toLocaleDateString()}`,
        `Total Bills: ${bills.length}`,
        `Total Monthly Spending: $${totalAmount.toFixed(2)}`,
        `Auto-Pay Enabled: ${autoPayCount} bills`,
        `Manual Payments: ${bills.length - autoPayCount} bills`
      ], 20, 40);

      // Capture all charts
      const canvas = await html2canvas(chartsRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: 'white'
      });

      // Calculate dimensions
      const imgWidth = 190; // Slightly smaller than A4 width for margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const maxHeight = 277; // A4 height minus margins and header space
      
      // If image height is greater than available space, split into pages
      if (imgHeight > maxHeight) {
        const pageCount = Math.ceil(imgHeight / maxHeight);
        
        for (let i = 0; i < pageCount; i++) {
          if (i > 0) {
            pdf.addPage();
            // Add smaller header on continuation pages
            pdf.setFillColor(37, 99, 235);
            pdf.rect(0, 0, 210, 15, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(14);
            pdf.text('Financial Analytics Report (Continued)', 105, 10, { align: 'center' });
          }

          // Create a temporary canvas for this section
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          const sectionHeight = canvas.height / pageCount;
          
          tempCanvas.width = canvas.width;
          tempCanvas.height = sectionHeight;
          
          if (tempCtx) {
            tempCtx.drawImage(
              canvas,
              0,
              i * sectionHeight,
              canvas.width,
              sectionHeight,
              0,
              0,
              canvas.width,
              sectionHeight
            );
          }
          
          // Add the section to the PDF
          pdf.addImage(
            tempCanvas.toDataURL('image/png'),
            'PNG',
            10,
            i === 0 ? 60 : 20,
            imgWidth,
            imgHeight / pageCount
          );
          
          // Add page number
          pdf.setTextColor(128, 128, 128);
          pdf.setFontSize(8);
          pdf.text(`Page ${i + 1}/${pageCount}`, 105, pdf.internal.pageSize.height - 10, { align: 'center' });
        }
      } else {
        // If content fits on one page, add it directly
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          10,
          60,
          imgWidth,
          imgHeight
        );
      }

      // Save the PDF
      pdf.save('financial-report.pdf');
      
      toast.success('PDF report downloaded successfully!', {
        id: 'pdf-success',
        duration: 3000,
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF report. Please try again.', {
        id: 'pdf-error',
        duration: 3000,
      });
    } finally {
      toast.dismiss('pdf-loading');
    }
  };

  // Group bills by category
  const billsByCategory = bills.reduce((acc, bill) => {
    const category = identifyCategory(bill.name);
    if (!acc[category]) {
      acc[category] = {
        bills: [],
        total: 0
      };
    }
    acc[category].bills.push(bill);
    acc[category].total += bill.amount;
    return acc;
  }, {} as { [key: string]: { bills: RecurringBill[], total: number } });

  // Prepare data for bar chart (Monthly spending by category)
  const barChartData = {
    labels: Object.keys(billsByCategory),
    datasets: [
      {
        label: 'Monthly Amount',
        data: Object.values(billsByCategory).map(category => category.total),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for line chart (Monthly spending trend by category)
  const getMonthlyTotalByCategory = (month: number, category: string) => {
    return billsByCategory[category].bills.reduce((total, bill) => {
      const dueDate = new Date(bill.dueDate);
      if (dueDate.getMonth() === month) {
        return total + bill.amount;
      }
      return total;
    }, 0);
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const lineChartData = {
    labels: months,
    datasets: Object.keys(billsByCategory).map((category, index) => ({
      label: category,
      data: months.map((_, monthIndex) => getMonthlyTotalByCategory(monthIndex, category)),
      borderColor: `hsl(${index * 360 / Object.keys(billsByCategory).length}, 70%, 50%)`,
      tension: 0.1,
      fill: false,
    })),
  };

  // Prepare data for pie chart (Spending breakdown by category)
  const pieChartData = {
    labels: Object.keys(billsByCategory),
    datasets: [
      {
        data: Object.values(billsByCategory).map(category => category.total),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for donut chart (Auto-pay vs Manual by category)
  const autoPayByCategory = Object.entries(billsByCategory).reduce((acc, [category, data]) => {
    acc[category] = data.bills.filter(bill => bill.autoPay).length;
    return acc;
  }, {} as { [key: string]: number });

  const manualPayByCategory = Object.entries(billsByCategory).reduce((acc, [category, data]) => {
    acc[category] = data.bills.filter(bill => !bill.autoPay).length;
    return acc;
  }, {} as { [key: string]: number });

  const donutChartData = {
    labels: ['Auto-Pay', 'Manual Payment'],
    datasets: [
      {
        data: [
          Object.values(autoPayByCategory).reduce((a, b) => a + b, 0),
          Object.values(manualPayByCategory).reduce((a, b) => a + b, 0)
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for calendar heatmap
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const currentDate = new Date();
  const daysInMonth = getDaysInMonth(currentDate);

  // Create a map of day numbers to payment amounts
  const dailyPayments = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return bills.reduce((total, bill) => {
      const dueDate = new Date(bill.dueDate);
      if (dueDate.getDate() === day) {
        return total + bill.amount;
      }
      return total;
    }, 0);
  });

  // Find max payment amount for color scaling
  const maxPayment = Math.max(...dailyPayments);

  // Create heatmap data
  const heatmapData: ChartData<'bar'> = {
    labels: Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()),
    datasets: [
      {
        label: 'Payment Amount',
        data: dailyPayments,
        backgroundColor: dailyPayments.map(amount => {
          const intensity = amount / maxPayment;
          return `rgba(255, 99, 132, ${0.3 + intensity * 0.7})`;
        }),
        borderColor: dailyPayments.map(amount => {
          const intensity = amount / maxPayment;
          return `rgba(255, 99, 132, ${0.5 + intensity * 0.5})`;
        }),
        borderWidth: 1,
        barPercentage: 0.9,
        categoryPercentage: 0.9,
      },
    ],
  };

  // Custom tooltip for heatmap
  const heatmapOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const day = items[0].label;
            const amount = items[0].parsed.y;
            const billsOnDay = bills.filter(bill => {
              const dueDate = new Date(bill.dueDate);
              return dueDate.getDate() === parseInt(day);
            });
            
            return [
              `Day ${day}`,
              `Total: $${amount.toFixed(2)}`,
              billsOnDay.length > 0 ? 'Bills:' : '',
              ...billsOnDay.map(bill => `- ${bill.name}: $${bill.amount.toFixed(2)}`)
            ];
          },
        },
        titleFont: {
          size: 12
        },
        bodyFont: {
          size: 11
        },
        padding: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Payment Amount ($)',
          font: {
            size: 12
          }
        },
        ticks: {
          font: {
            size: 10
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Day of Month',
          font: {
            size: 12
          }
        },
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          padding: 8,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        titleFont: {
          size: 12
        },
        bodyFont: {
          size: 11
        },
        padding: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  return (
    <>
      <div className="recurring-charts__header">
        <h2 className="recurring-charts__main-title">Recurring Bills Analytics</h2>
        <button 
          onClick={downloadPDF} 
          className="recurring-charts__download-btn"
        >
          <DownloadIcon />
          Download Report
        </button>
      </div>
      <div ref={chartsRef} className="recurring-charts__grid">
        <div className="recurring-charts__card">
          <h3 className="recurring-charts__title">Monthly Spending by Category</h3>
          <Bar data={barChartData} options={chartOptions} />
        </div>

        <div className="recurring-charts__card">
          <h3 className="recurring-charts__title">Monthly Spending Trend by Category</h3>
          <Line data={lineChartData} options={chartOptions} />
        </div>

        <div className="recurring-charts__card">
          <h3 className="recurring-charts__title">Spending Breakdown by Category</h3>
          <Pie data={pieChartData} options={chartOptions} />
        </div>

        <div className="recurring-charts__card">
          <h3 className="recurring-charts__title">Auto-Pay vs Manual Payment</h3>
          <Doughnut data={donutChartData} options={chartOptions} />
        </div>

        <div className="recurring-charts__card recurring-charts__card--full-width">
          <h3 className="recurring-charts__title">Payment Due Date Heatmap</h3>
          <Bar data={heatmapData} options={heatmapOptions} />
        </div>
      </div>
    </>
  );
};

export default RecurringCharts; 