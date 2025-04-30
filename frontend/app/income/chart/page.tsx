"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Bar, 
  Line, 
  Pie, 
  Doughnut 
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Income {
  id: string;
  source: string;
  date: string;
  category: string;
  amount: number;
}

export default function IncomeChartPage() {
  const [income, setIncome] = useState<Income[]>([]);
  
  // Add state for date range
  const [dateRange, setDateRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    axios
      .get<Income[]>("http://localhost:5000/income")
      .then((response) => {
        const formattedData = response.data.map((item) => ({
          ...item,
          // Keep full date information for daily chart
          fullDate: new Date(item.date),
          date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
        }));
        setIncome(formattedData);
      })
      .catch((error) => console.error("Error fetching income data:", error));
  }, []);

  // Function to get daily data for the last N days
  const getDailyData = (days: number) => {
    const now = new Date();
    const startDate = new Date(now.setDate(now.getDate() - days));
    
    const dailyData = income
      .filter(item => new Date(item.date) >= startDate)
      .reduce((acc, curr) => {
        const date = new Date(curr.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        });
        acc[date] = (acc[date] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>);

    // Fill in missing dates with zero
    for (let d = 0; d < days; d++) {
      const date = new Date(now.setDate(now.getDate() + 1)).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
      if (!dailyData[date]) {
        dailyData[date] = 0;
      }
    }

    return dailyData;
  };

  // Monthly Income Trend Data
  const monthlyData = income.reduce((acc, curr) => {
    const month = curr.date;
    acc[month] = (acc[month] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Category Distribution Data
  const categoryData = income.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Source Distribution Data
  const sourceData = income.reduce((acc, curr) => {
    acc[curr.source] = (acc[curr.source] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  // Function to calculate daily growth rates
  const getDailyGrowthData = (days: number) => {
    const now = new Date();
    const startDate = new Date(now.setDate(now.getDate() - days));
    
    // Get daily totals first
    const dailyTotals = income
      .filter(item => new Date(item.date) >= startDate)
      .reduce((acc, curr) => {
        const date = new Date(curr.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        });
        acc[date] = (acc[date] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>);

    // Calculate growth rates
    const growthRates: Record<string, number> = {};
    const dates = Object.keys(dailyTotals);
    
    dates.forEach((date, index) => {
      if (index === 0) {
        growthRates[date] = 0; // First day has no growth rate
      } else {
        const currentAmount = dailyTotals[date];
        const previousAmount = dailyTotals[dates[index - 1]];
        
        // Calculate growth rate as percentage
        const growthRate = previousAmount !== 0 
          ? ((currentAmount - previousAmount) / previousAmount) * 100
          : 0;
          
        growthRates[date] = Number(growthRate.toFixed(2)); // Round to 2 decimal places
      }
    });

    return growthRates;
  };

  // Add this function inside your component, after other data processing functions
  const getForecastData = () => {
    // Get last 6 months of data for forecasting
    const monthlyTotals = income.reduce((acc, curr) => {
      const month = new Date(curr.date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      acc[month] = (acc[month] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    const values = Object.values(monthlyTotals);
    const months = Object.keys(monthlyTotals);

    // Simple moving average forecast for next 3 months
    const avgIncrease = values.slice(-3).reduce((a, b, i, arr) => {
      if (i === 0) return 0;
      return a + (b - arr[i - 1]);
    }, 0) / 2;

    const lastValue = values[values.length - 1];
    const forecast = Array(3).fill(0).map((_, i) => {
      return lastValue + (avgIncrease * (i + 1));
    });

    // Generate next 3 month names
    const lastDate = new Date(months[months.length - 1]);
    const nextMonths = Array(3).fill(0).map((_, i) => {
      const nextDate = new Date(lastDate);
      nextDate.setMonth(lastDate.getMonth() + i + 1);
      return nextDate.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    });

    return {
      labels: [...months, ...nextMonths],
      actual: [...values, ...Array(3).fill(null)],
      forecast: [...Array(values.length).fill(null), ...forecast]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const generateReport = async () => {
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const chartsContainer = document.querySelector('.charts-grid');
      
      if (!chartsContainer) return;

      // Add report header
      doc.setFontSize(20);
      doc.setTextColor(29, 78, 216); // Blue color
      doc.text('Income Analytics Report', 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99); // Gray color
      doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 30);

      // Add summary statistics
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text('Summary Statistics', 20, 45);

      const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
      const monthlyAverage = totalIncome / (new Set(income.map(item => item.date)).size || 1);

      doc.setFontSize(12);
      doc.text(`Total Income: Rs.${totalIncome.toLocaleString()}`, 25, 55);
      doc.text(`Monthly Average: Rs.${monthlyAverage.toLocaleString()}`, 25, 62);

      // Convert each chart to image and add to PDF
      let verticalOffset = 75;
      const charts = chartsContainer.querySelectorAll('.chart-card');
      
      for (const chart of Array.from(charts)) {
        const canvas = await html2canvas(chart as HTMLElement, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add new page if chart doesn't fit
        if (verticalOffset + imgHeight > 280) {
          doc.addPage();
          verticalOffset = 20;
        }

        doc.addImage(imgData, 'PNG', 20, verticalOffset, imgWidth, imgHeight);
        verticalOffset += imgHeight + 15;
      }

      // Save the PDF
      const fileName = `income-analytics-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);

      // Show success toast
      toast.custom((t) => (
        <div className={`modern-toast-content ${t.visible ? 'show' : ''}`}>
          <div className="toast-icon-container success">
            <svg className="toast-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
            </svg>
          </div>
          <div className="toast-message">
            <h4>Success!</h4>
            <p>Report generated successfully</p>
          </div>
        </div>
      ));

    } catch (error) {
      console.error('Error generating report:', error);
      toast.custom((t) => (
        <div className={`modern-toast-content ${t.visible ? 'show' : ''}`}>
          <div className="toast-icon-container error">
            <svg className="toast-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.31 7.526c-.099-.807.528-1.526 1.348-1.526.771 0 1.377.676 1.28 1.451l-.757 6.053c-.035.283-.276.496-.561.496s-.526-.213-.562-.496l-.748-5.978zm1.31 10.724c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
            </svg>
          </div>
          <div className="toast-message">
            <h4>Error</h4>
            <p>Failed to generate report</p>
          </div>
        </div>
      ));
    }
  };

  return (
    <div className="income-page">
      <div className="page-header">
        <div>
          <h1 className="income-header">Income Analytics</h1>
          <p className="income-header2">Comprehensive income analysis</p>
        </div>
        <button
          onClick={generateReport}
          className="download-report-btn"
        >
          <FiDownload className="mr-2" />
          Download Report
        </button>
      </div>
      
      <div className="income-content">
        <div className="charts-grid">
          {/* Category Distribution */}
          <div className="chart-card">
            <h3 className="chart-title">Income by Category</h3>
            <div className="chart-container-medium">
              <Doughnut
                data={{
                  labels: Object.keys(categoryData),
                  datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                      'rgba(99, 102, 241, 0.8)',
                      'rgba(16, 185, 129, 0.8)',
                      'rgba(244, 63, 94, 0.8)',
                      'rgba(245, 158, 11, 0.8)',
                      'rgba(139, 92, 246, 0.8)',
                    ]
                  }]
                }}
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false,
                  responsive: true
                }}
              />
            </div>
          </div>

          {/* Income Sources */}
          <div className="chart-card">
            <h3 className="chart-title">Income Sources</h3>
            <div className="chart-container-medium">
              <Bar
                data={{
                  labels: Object.keys(sourceData),
                  datasets: [{
                    label: 'Amount',
                    data: Object.values(sourceData),
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderRadius: 8
                  }]
                }}
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `Rs.${value}`
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Income Growth Rate Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Daily Income Growth Rate</h3>
              <div className="chart-controls">
                <button
                  className={`chart-control-btn ${dateRange === 'week' ? 'active' : ''}`}
                  onClick={() => setDateRange('week')}
                >
                  Last 7 Days
                </button>
                <button
                  className={`chart-control-btn ${dateRange === 'month' ? 'active' : ''}`}
                  onClick={() => setDateRange('month')}
                >
                  Last 30 Days
                </button>
              </div>
            </div>
            <div className="chart-container-medium">
              <Line
                data={{
                  labels: Object.keys(getDailyGrowthData(dateRange === 'week' ? 7 : 30)),
                  datasets: [{
                    label: 'Growth Rate',
                    data: Object.values(getDailyGrowthData(dateRange === 'week' ? 7 : 30)),
                    borderColor: '#10b981',
                    backgroundColor: (context) => {
                      const ctx = context.chart.ctx;
                      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)');
                      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                      return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    segment: {
                      borderColor: (context) => {
                        // Change line color based on positive/negative values
                        const value = context.p1.parsed.y;
                        return value >= 0 ? '#10b981' : '#ef4444';
                      }
                    }
                  }]
                }}
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `${value}%`,
                        color: (context) => {
                          const value = context.tick.value;
                          return value >= 0 ? '#10b981' : '#ef4444';
                        }
                      },
                      grid: {
                        color: '#f3f4f6'
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      backgroundColor: '#1f2937',
                      titleColor: '#ffffff',
                      bodyColor: '#e5e7eb',
                      padding: 12,
                      displayColors: false,
                      callbacks: {
                        label: (context) => {
                          const value = context.raw as number;
                          const sign = value >= 0 ? '+' : '';
                          return `Growth Rate: ${sign}${value}%`;
                        }
                      }
                    },
                    legend: {
                      display: false
                    }
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index'
                  }
                }}
              />
            </div>
            
            {/* Add a legend explanation */}
            <div className="growth-rate-legend">
              <div className="legend-item">
                <span className="legend-dot positive"></span>
                <span>Positive Growth</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot negative"></span>
                <span>Negative Growth</span>
              </div>
            </div>
          </div>

          {/* Income Forecast Chart */}
          <div className="chart-card">
            <h3 className="chart-title">Income Forecast</h3>
            <div className="chart-container-large">
              <Line
                data={{
                  labels: getForecastData().labels,
                  datasets: [
                    {
                      label: 'Actual Income',
                      data: getForecastData().actual,
                      borderColor: '#6366f1',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                    },
                    {
                      label: 'Forecasted Income',
                      data: getForecastData().forecast,
                      borderColor: '#10b981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      fill: true,
                      tension: 0.4,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                      borderDash: [5, 5], // Creates dashed line for forecast
                    }
                  ]
                }}
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `Rs.${value}`
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      backgroundColor: '#1f2937',
                      titleColor: '#ffffff',
                      bodyColor: '#e5e7eb',
                      padding: 12,
                      callbacks: {
                        label: (context) => {
                          const value = context.raw as number;
                          if (value === null) return '';
                          return `${context.dataset.label}: Rs.${value.toLocaleString()}`;
                        }
                      }
                    },
                    legend: {
                      position: 'top',
                      labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 20,
                      }
                    }
                  }
                }}
              />
            </div>
            <div className="forecast-legend">
              <p className="forecast-note">
                * Forecast based on 3-month moving average
              </p>
            </div>
          </div>

          {/* Monthly Income Trend */}
          <div className="chart-card">
            <h3 className="chart-title">Monthly Income Trend</h3>
            <div className="chart-container-large">
              <Line
                data={{
                  labels: Object.keys(monthlyData),
                  datasets: [{
                    label: 'Monthly Income',
                    data: Object.values(monthlyData),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4
                  }]
                }}
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false, // Important for custom sizing
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `Rs.${value}`
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Daily Income Trend - Moved to the bottom */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Daily Income Trend</h3>
              <div className="chart-controls">
                <button
                  className={`chart-control-btn ${dateRange === 'week' ? 'active' : ''}`}
                  onClick={() => setDateRange('week')}
                >
                  Last 7 Days
                </button>
                <button
                  className={`chart-control-btn ${dateRange === 'month' ? 'active' : ''}`}
                  onClick={() => setDateRange('month')}
                >
                  Last 30 Days
                </button>
              </div>
            </div>
            <div className="chart-container-large">
              <Line
                data={{
                  labels: Object.keys(getDailyData(dateRange === 'week' ? 7 : 30)),
                  datasets: [{
                    label: 'Daily Income',
                    data: Object.values(getDailyData(dateRange === 'week' ? 7 : 30)),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2
                  }]
                }}
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false,
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `Rs.${value}`
                      }
                    },
                    x: {
                      grid: {
                        display: false
                      }
                    }
                  },
                  plugins: {
                    ...chartOptions.plugins,
                    tooltip: {
                      backgroundColor: '#1f2937',
                      titleColor: '#ffffff',
                      bodyColor: '#e5e7eb',
                      padding: 12,
                      displayColors: false,
                      callbacks: {
                        label: (context) => `Income: Rs.${context.raw}`
                      }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 