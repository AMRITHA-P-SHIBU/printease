import React, { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from './AdminLayout';
import './AdminReport.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MdDownload } from 'react-icons/md';

function IncomeCard({ icon, value, label, color }) {
  return (
    <div className={`income-card ${color}`}>
      <div className="income-icon">{icon}</div>
      <div className="income-info">
        <span className="income-label">{label}</span>
        <span className="income-value">₹{value.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function AdminReport() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [dailyIncome, setDailyIncome] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [annualIncome, setAnnualIncome] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  
  const chartRef = useRef(null);

  const generateMonthlyComparison = (paid) => {
    const today = new Date();
    const months = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();

      const monthlyRequests = paid.filter(r => {
        const reqDate = new Date(r.created_at);
        return reqDate.getMonth() === month && reqDate.getFullYear() === year;
      });

      const income = monthlyRequests.reduce((sum, r) => sum + Number(r.amount), 0);

      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        fullMonth: date.toLocaleString('default', { month: 'long' }),
        year: year,
        income: income,
        count: monthlyRequests.length
      });
    }

    return months;
  };

  const calculateIncomes = useCallback((paidRequests) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const paid = paidRequests.filter(r => r.payment_status === 'paid');

    // Daily Income
    const todayStr = today.toDateString();
    const dailyRequests = paid.filter(
      r => new Date(r.created_at).toDateString() === todayStr
    );
    const daily = dailyRequests.reduce((sum, r) => sum + Number(r.amount), 0);
    setDailyIncome(daily);

    // Monthly Income
    const monthlyRequests = paid.filter(r => {
      const reqDate = new Date(r.created_at);
      return (
        reqDate.getMonth() === currentMonth &&
        reqDate.getFullYear() === currentYear
      );
    });
    const monthly = monthlyRequests.reduce((sum, r) => sum + Number(r.amount), 0);
    setMonthlyIncome(monthly);

    // Annual Income
    const annualRequests = paid.filter(r => {
      const reqDate = new Date(r.created_at);
      return reqDate.getFullYear() === currentYear;
    });
    const annual = annualRequests.reduce((sum, r) => sum + Number(r.amount), 0);
    setAnnualIncome(annual);

    // Monthly Comparison
    const monthlyComparison = generateMonthlyComparison(paid);
    setMonthlyData(monthlyComparison);
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/print-requests')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          calculateIncomes(data.data);
        } else {
          setError('Failed to load requests');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Could not connect to server');
        setLoading(false);
      });
  }, [calculateIncomes]);

  const maxIncome =
    monthlyData.length > 0
      ? Math.max(...monthlyData.map(m => m.income))
      : 0;

  // Format Y-axis labels based on scale
  const formatYAxisLabel = (value) => {
    if (value === 0) return '₹0';
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value.toFixed(0)}`;
  };

  const downloadChartAsImage = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
        });
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `income-report-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
      } catch (err) {
        console.error('Error downloading chart as image:', err);
        alert('Failed to download chart as image');
      }
    }
  };

  const downloadChartAsPDF = async () => {
    if (chartRef.current) {
      try {
        const canvas = await html2canvas(chartRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4',
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight - 20;
        }

        pdf.save(`income-report-${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (err) {
        console.error('Error downloading chart as PDF:', err);
        alert('Failed to download chart as PDF');
      }
    }
  };

  return (
    <AdminLayout adminName="Admin">
      <div className="report-header">
        <h1 className="report-title">📊 Income Report</h1>
        <button
          className="btn btn-outline"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>
      </div>

      {loading && <p className="loading-msg">Loading report data...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && (
        <>
          {/* Income Summary */}
          <div className="income-summary">
            <IncomeCard
              icon="📅"
              value={dailyIncome}
              label="Today's Income"
              color="teal"
            />
            <IncomeCard
              icon="📆"
              value={monthlyIncome}
              label="This Month's Income"
              color="blue"
            />
            <IncomeCard
              icon="📈"
              value={annualIncome}
              label="This Year's Income"
              color="green"
            />
          </div>

          {/* Chart */}
          <div ref={chartRef} className="report-card">
            <div className="report-card-header">
              <h2 className="report-subtitle" style={{ marginBottom: '16px' }}>
                Monthly Income Comparison (Last 12 Months)
              </h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={downloadChartAsImage}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  title="Download chart as PNG"
                >
                  <MdDownload size={16} /> Image
                </button>
                <button
                  onClick={downloadChartAsPDF}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  title="Download chart as PDF"
                >
                  <MdDownload size={16} /> PDF
                </button>
              </div>
            </div>

            {maxIncome === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px 24px', color: '#999' }}>
                No income data available yet. Complete some print requests with payment to see the chart.
              </p>
            ) : (
              <div className="chart-container">
                <div className="chart-wrapper">
                  {monthlyData.map((data, idx) => (
                    <div key={idx} className="chart-bar-group">
                      <div className="chart-bar-wrapper">
                        <div
                          className="chart-bar"
                          style={{
                            height:
                              maxIncome > 0
                                ? `${(data.income / maxIncome) * 100}%`
                                : '0%'
                          }}
                          title={`${data.fullMonth} ${data.year}: ₹${data.income.toFixed(2)}`}
                        >
                          {data.income > 0 && (
                            <span className="bar-value">
                              ₹{data.income >= 1000 ? (data.income / 1000).toFixed(1) : data.income.toFixed(0)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="chart-label">{data.month}</div>
                      <div className="chart-count">{data.count} orders</div>
                    </div>
                  ))}
                </div>

                <div className="y-axis">
                  <div className="y-label">{formatYAxisLabel(maxIncome)}</div>
                  <div className="y-label">{formatYAxisLabel(maxIncome * 0.75)}</div>
                  <div className="y-label">{formatYAxisLabel(maxIncome * 0.5)}</div>
                  <div className="y-label">{formatYAxisLabel(maxIncome * 0.25)}</div>
                  <div className="y-label">₹0</div>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="report-card">
            <div className="report-card-header">
              <h2 className="report-subtitle">Monthly Details</h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Orders</th>
                    <th>Total Income</th>
                    <th>Avg Per Order</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((data, idx) => (
                    <tr key={idx}>
                      <td className="month-cell">
                        <strong>
                          {data.fullMonth} {data.year}
                        </strong>
                      </td>
                      <td>{data.count}</td>
                      <td className="income-cell">
                        ₹{data.income.toFixed(2)}
                      </td>
                      <td>
                        ₹
                        {data.count > 0
                          ? (data.income / data.count).toFixed(2)
                          : '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}