import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { MdDownload } from 'react-icons/md';
import './Dashboard.css';

// ── Sidebar links ──
const navLinks = [
  { key: 'dashboard',  label: '🏠 Dashboard'  },
  { key: 'inventory',  label: '📦 Inventory'   },
  { key: 'orders',     label: '🛒 Orders'      },
  { key: 'reports',    label: '📊 Reports'     },
];

export default function BookstoreAdminDashboard() {
  const navigate  = useNavigate();
  const [page, setPage] = useState('dashboard');
  const fullName = localStorage.getItem("full_name") || "Bookstore Admin";

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarBrand}>
          <span style={styles.brandIcon}>📚</span>
          <span style={styles.brandText}>Bookstore</span>
        </div>
        <nav style={styles.nav}>
          {navLinks.map(link => (
            <button
              key={link.key}
              style={{ ...styles.navBtn, ...(page === link.key ? styles.navBtnActive : {}) }}
              onClick={() => setPage(link.key)}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <button style={styles.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Topbar */}
        <div style={styles.topbar}>
          <h2 style={styles.pageTitle}>
            {page === 'dashboard' ? 'Dashboard'  : ''}
            {page === 'inventory' ? 'Inventory'  : ''}
            {page === 'orders'    ? 'Orders'     : ''}
            {page === 'reports'   ? 'Reports'    : ''}
          </h2>
          <div style={styles.adminInfo}>
            <div className="avatar" style={{width: 36, height: 36, fontSize: 15}}>{fullName.charAt(0).toUpperCase()}</div>
            <span className="username">{fullName}</span>
          </div>
        </div>

        {/* Page Content */}
        <div style={styles.content}>
          {page === 'dashboard' && <DashboardPage />}
          {page === 'inventory' && <InventoryPage />}
          {page === 'orders'    && <OrdersPage    />}
          {page === 'reports'   && <ReportsPage   />}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════
//  DASHBOARD PAGE
// ════════════════════════════════
function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/bookstore/stats')
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); });
  }, []);

  const cards = stats ? [
    { icon: '📦', label: 'Total Items',      value: stats.totalItems,      color: '#2bb5a0' },
    { icon: '🛒', label: 'Total Orders',     value: stats.totalOrders,     color: '#3b82f6' },
    { icon: '⏳', label: 'Pending Orders',   value: stats.pendingOrders,   color: '#f59e0b' },
    { icon: '✅', label: 'Completed Orders', value: stats.completedOrders, color: '#10b981' },
    { icon: '₹',  label: 'Revenue',          value: `₹${Number(stats.revenue).toFixed(0)}`, color: '#8b5cf6' },
  ] : [];

  return (
    <div>
      {stats && stats.lowStockItems && stats.lowStockItems.length > 0 && (
        <div style={{ background: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '16px 20px', borderRadius: '8px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <h4 style={{ margin: '0 0 8px', color: '#b45309', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚠️</span> Low Stock Alerts
          </h4>
          <ul style={{ margin: 0, paddingLeft: 20, color: '#92400e', fontSize: 14 }}>
            {stats.lowStockItems.map(item => (
              <li key={item.id}><strong>{item.item_name}</strong> is running low (Only {item.quantity} left!)</li>
            ))}
          </ul>
        </div>
      )}
      <div style={styles.statGrid}>
        {cards.map(card => (
          <div key={card.label} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: card.color + '20' }}>
              <span style={{ fontSize: 22 }}>{card.icon}</span>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, color: card.color }}>{card.value ?? '…'}</div>
              <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>
      {!stats && <p style={{ color: '#aaa', padding: 20 }}>Loading stats...</p>}
    </div>
  );
}

// ════════════════════════════════
//  INVENTORY PAGE
// ════════════════════════════════
function InventoryPage() {
  const [items,       setItems]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [uploading,   setUploading]   = useState(false);
  const [uploadMsg,   setUploadMsg]   = useState('');
  const [editItem,    setEditItem]    = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ item_name: '', price: '', quantity: '', image_url: '' });

  const fetchItems = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/bookstore/items')
      .then(r => r.json())
      .then(d => { if (d.success) setItems(d.data); setLoading(false); });
  };

  useEffect(() => { fetchItems(); }, []);

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res  = await fetch('http://localhost:5000/api/bookstore/items/upload-excel', { method: 'POST', body: fd });
      const data = await res.json();
      setUploadMsg(data.message || (data.success ? 'Uploaded!' : 'Failed'));
      if (data.success) fetchItems();
    } catch { setUploadMsg('Upload failed'); }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await fetch(`http://localhost:5000/api/bookstore/items/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  const handleMarkOutOfStock = async (id) => {
    if (!window.confirm('Mark this item as out of stock?')) return;
    await fetch(`http://localhost:5000/api/bookstore/items/${id}/out-of-stock`, { method: 'PUT' });
    fetchItems();
  };

  const handleSave = async () => {
    const url    = editItem ? `http://localhost:5000/api/bookstore/items/${editItem.id}` : 'http://localhost:5000/api/bookstore/items';
    const method = editItem ? 'PUT' : 'POST';
    const res    = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) { fetchItems(); setEditItem(null); setShowAddForm(false); setForm({ item_name: '', price: '', quantity: '', image_url: '' }); }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ item_name: item.item_name, price: item.price, quantity: item.quantity, image_url: item.image_url || '' });
    setShowAddForm(true);
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <button style={styles.btnPrimary} onClick={() => { setEditItem(null); setForm({ item_name: '', price: '', quantity: '', image_url: '' }); setShowAddForm(true); }}>
          + Add Item
        </button>
        <label style={styles.btnOutline}>
          {uploading ? 'Uploading...' : '📊 Upload Excel'}
          <input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} style={{ display: 'none' }} />
        </label>
        {uploadMsg && <span style={{ fontSize: 13, color: uploadMsg.includes('success') || uploadMsg.includes('added') ? '#10b981' : '#e53935', fontWeight: 600 }}>{uploadMsg}</span>}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div style={styles.formCard}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>{editItem ? 'Edit Item' : 'Add New Item'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { key: 'item_name',   label: 'Item Name *',  type: 'text'   },
              { key: 'price',       label: 'Price (₹) *',  type: 'number' },
              { key: 'quantity',    label: 'Quantity *',   type: 'number' },
              /* { key: 'category',    label: 'Category',     type: 'text'   }, */
              { key: 'image_url',   label: 'Image URL',    type: 'text'   },
            ].map(f => (
              <div key={f.key}>
                <label style={styles.formLabel}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={styles.formInput}
                />
              </div>
            ))}
            {/*<div style={{ gridColumn: 'span 2' }}>
              <label style={styles.formLabel}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                style={{ ...styles.formInput, resize: 'vertical' }}
              />
            </div>*/}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button style={styles.btnPrimary} onClick={handleSave}>{editItem ? 'Save Changes' : 'Add Item'}</button>
            <button style={styles.btnGhost} onClick={() => { setShowAddForm(false); setEditItem(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Items Table */}
      {loading ? <p style={{ color: '#aaa' }}>Loading items...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Image</th>
                <th style={styles.th}>Item Name</th>
                {/* <th style={styles.th}>Category</th> */}
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan="7" style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>No items yet. Add items or upload an Excel file.</td></tr>
              )}
              {items.map(item => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.td}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.item_name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />
                      : <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📚</div>
                    }
                  </td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>{item.item_name}</td>
                  {/* <td style={styles.td}>{item.category || '—'}</td> */}
                  <td style={styles.td}>₹{Number(item.price).toFixed(2)}</td>
                  <td style={styles.td}>{item.quantity}</td>
                  <td style={styles.td}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700,
                      background: item.quantity === 0 ? 'rgba(239,68,68,0.12)' : item.quantity <= 20 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                      color:      item.quantity === 0 ? '#b91c1c'              : item.quantity <= 20 ? '#b45309'               : '#065f46',
                    }}>
                      {item.quantity === 0 ? 'Out of Stock' : item.quantity <= 20 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button style={styles.editBtn}   onClick={() => openEdit(item)}>✏️ Edit</button>
                      {item.quantity > 0 && <button style={styles.outOfStockBtn} onClick={() => handleMarkOutOfStock(item.id)}>🚫 Zero Stock</button>}
                      <button style={styles.deleteBtn} onClick={() => handleDelete(item.id)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════
//  ORDERS PAGE
// ════════════════════════════════
function OrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/bookstore/orders')
      .then(r => r.json())
      .then(d => { if (d.success) setOrders(d.data); setLoading(false); });
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5000/api/bookstore/orders/${id}/status`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const statusColors = {
    'Pending':          { bg: 'rgba(245,158,11,0.12)',  color: '#b45309' },
    'Confirmed':        { bg: 'rgba(59,130,246,0.12)',  color: '#1d4ed8' },
    'Ready for Pickup': { bg: 'rgba(139,92,246,0.12)',  color: '#6d28d9' },
    'Completed':        { bg: 'rgba(16,185,129,0.12)',  color: '#065f46' },
    'Cancelled':        { bg: 'rgba(239,68,68,0.12)',   color: '#b91c1c' },
  };

  return (
    <div>
      {loading ? <p style={{ color: '#aaa' }}>Loading orders...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Order ID</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Item</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Total</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan="8" style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>No orders yet.</td></tr>
              )}
              {orders.map(order => {
                const sc = statusColors[order.status] || statusColors['Pending'];
                return (
                  <tr key={order.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: 700 }}>BS-{String(order.id).padStart(3,'0')}</td>
                    <td style={styles.td}>{order.full_name}</td>
                    <td style={styles.td}>{order.item_name}</td>
                    <td style={styles.td}>{order.quantity}</td>
                    <td style={styles.td}><strong>₹{Number(order.total_price).toFixed(2)}</strong></td>
                    <td style={styles.td}>{new Date(order.order_date).toLocaleDateString('en-IN')}</td>
                    <td style={styles.td}>
                      <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.color }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        style={styles.statusSelect}
                      >
                        {['Pending','Confirmed','Ready for Pickup','Completed'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════
//  REPORTS PAGE
// ════════════════════════════════
function IncomeCard({ icon, value, label, color }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '20px 24px',
      borderRadius: '12px',
      background: 'white',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ fontSize: 32 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#1a2e35' }}>₹{value.toFixed(2)}</div>
      </div>
    </div>
  );
}

function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dailyIncome, setDailyIncome] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [annualIncome, setAnnualIncome] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  
  const chartRef = useRef(null);

  const calculateIncomes = useCallback((orders) => {
    const generateMonthlyComparison = (ordersData) => {
      const today = new Date();
      const months = [];

      for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const month = date.getMonth();
        const year = date.getFullYear();

        const monthlyOrders = ordersData.filter(o => {
          const orderDate = new Date(o.order_date);
          return orderDate.getMonth() === month && orderDate.getFullYear() === year;
        });

        const income = monthlyOrders.reduce((sum, o) => sum + Number(o.total_price), 0);

        months.push({
          month: date.toLocaleString('default', { month: 'short' }),
          fullMonth: date.toLocaleString('default', { month: 'long' }),
          year: year,
          income: income,
          count: monthlyOrders.length
        });
      }

      return months;
    };

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Daily Income
    const todayStr = today.toDateString();
    const dailyOrders = orders.filter(
      o => new Date(o.order_date).toDateString() === todayStr
    );
    const daily = dailyOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
    setDailyIncome(daily);

    // Monthly Income
    const monthlyOrders = orders.filter(o => {
      const orderDate = new Date(o.order_date);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });
    const monthly = monthlyOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
    setMonthlyIncome(monthly);

    // Annual Income
    const annualOrders = orders.filter(o => {
      const orderDate = new Date(o.order_date);
      return orderDate.getFullYear() === currentYear;
    });
    const annual = annualOrders.reduce((sum, o) => sum + Number(o.total_price), 0);
    setAnnualIncome(annual);

    // Monthly Comparison
    const monthlyComparison = generateMonthlyComparison(orders);
    setMonthlyData(monthlyComparison);
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/bookstore/orders')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          calculateIncomes(d.data);
        } else {
          setError('Failed to load orders');
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
        link.download = `bookstore-income-report-${new Date().toISOString().split('T')[0]}.png`;
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

        pdf.save(`bookstore-income-report-${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (err) {
        console.error('Error downloading chart as PDF:', err);
        alert('Failed to download chart as PDF');
      }
    }
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 800, color: '#1a2e35' }}>📊 Income Report</h2>

      {loading && <p style={{ color: '#999', padding: '20px', textAlign: 'center' }}>Loading report data...</p>}
      {error && <p style={{ color: '#e53935', padding: '20px', textAlign: 'center' }}>{error}</p>}

      {!loading && !error && (
        <>
          {/* Income Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 18, marginBottom: 28 }}>
            <IncomeCard icon="📅" value={dailyIncome} label="Today's Income" color="#2bb5a0" />
            <IncomeCard icon="📆" value={monthlyIncome} label="This Month's Income" color="#3498db" />
            <IncomeCard icon="📈" value={annualIncome} label="This Year's Income" color="#27ae60" />
          </div>

          {/* Chart */}
          <div ref={chartRef} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '2px solid #f0f0f0' }}>
              <h3 style={{ margin: 0, marginBottom: '16px', fontSize: 16, fontWeight: 700, color: '#1a2e35' }}>
                Monthly Income Comparison (Last 12 Months)
              </h3>
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
                No income data available yet. Complete some bookstore orders to see the chart.
              </p>
            ) : (
              <div style={{ display: 'flex', gap: 30, position: 'relative', height: 320 }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 12, minWidth: 50, fontSize: 11, color: '#999', fontWeight: 500 }}>
                  <div>{formatYAxisLabel(maxIncome)}</div>
                  <div>{formatYAxisLabel(maxIncome * 0.75)}</div>
                  <div>{formatYAxisLabel(maxIncome * 0.5)}</div>
                  <div>{formatYAxisLabel(maxIncome * 0.25)}</div>
                  <div>₹0</div>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8, paddingBottom: 40, borderLeft: '2px solid #e0e0e0', borderBottom: '2px solid #e0e0e0', position: 'relative' }}>
                  {monthlyData.map((data, idx) => (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: '100%', height: 240, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'linear-gradient(180deg, rgba(43, 181, 160, 0.05) 0%, rgba(43, 181, 160, 0) 100%)', borderRadius: '8px 8px 0 0', paddingBottom: 4, minHeight: 20 }}>
                        <div
                          style={{
                            width: '70%',
                            height: maxIncome > 0 ? `${(data.income / maxIncome) * 100}%` : '0%',
                            background: 'linear-gradient(180deg, #2bb5a0 0%, #1f9a82 100%)',
                            borderRadius: '6px 6px 0 0',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            paddingTop: 8,
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(180deg, #1f9a82 0%, #17806b 100%)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(43, 181, 160, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(180deg, #2bb5a0 0%, #1f9a82 100%)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          title={`${data.fullMonth} ${data.year}: ₹${data.income.toFixed(2)}`}
                        >
                          {data.income > 0 && (
                            <span style={{ fontSize: 10, fontWeight: 700, color: 'white', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                              ₹{data.income.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1a2e35', textAlign: 'center' }}>{data.month}</div>
                      <div style={{ fontSize: 10, color: '#999', textAlign: 'center' }}>{data.count} orders</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#1a2e35', paddingBottom: 16, borderBottom: '2px solid #f0f0f0' }}>
              Monthly Details
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9f9f9' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#1a2e35', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e0e0e0' }}>Month</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#1a2e35', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e0e0e0' }}>Orders</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#1a2e35', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e0e0e0' }}>Total Income</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#1a2e35', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid #e0e0e0' }}>Avg Per Order</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((data, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#2bb5a0' }}>
                        <strong>{data.fullMonth} {data.year}</strong>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#333' }}>{data.count}</td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#1a2e35' }}>
                        ₹{data.income.toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: '#333' }}>
                        ₹{data.count > 0 ? (data.income / data.count).toFixed(2) : '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Styles ──
const styles = {
  shell:        { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", background: '#f8fafc' },
  sidebar:      { width: 220, background: '#1a2e35', display: 'flex', flexDirection: 'column', padding: '24px 0', position: 'sticky', top: 0, height: '100vh' },
  sidebarBrand: { display: 'flex', alignItems: 'center', gap: 10, padding: '0 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  brandIcon:    { fontSize: 24 },
  brandText:    { color: 'white', fontWeight: 800, fontSize: 18, letterSpacing: 0.3 },
  nav:          { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  navBtn:       { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.65)', padding: '10px 14px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' },
  navBtnActive: { background: 'rgba(43,181,160,0.2)', color: '#2bb5a0' },
  logoutBtn:    { margin: '0 12px 16px', background: 'transparent', border: '1.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  main:         { flex: 1, display: 'flex', flexDirection: 'column' },
  topbar:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10 },
  pageTitle:    { margin: 0, fontSize: 20, fontWeight: 800, color: '#1a2e35' },
  adminInfo:    { display: 'flex', alignItems: 'center', gap: 10 },
  avatar:       { width: 36, height: 36, borderRadius: '50%', background: '#2bb5a0', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15 },
  adminName:    { fontWeight: 600, fontSize: 14, color: '#1e293b' },
  content:      { padding: '28px 32px', flex: 1 },
  statGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 },
  statCard:     { background: 'white', borderRadius: 16, padding: '20px 24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16 },
  statIcon:     { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  table:        { width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  thead:        { background: '#f8fafc' },
  th:           { padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #e5e7eb' },
  tr:           { borderBottom: '1px solid #f3f4f6' },
  td:           { padding: '14px 16px', fontSize: 13, color: '#374151' },
  formCard:     { background: 'white', borderRadius: 16, padding: '24px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  formLabel:    { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 },
  formInput:    { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 14, color: '#1f2937', outline: 'none', boxSizing: 'border-box' },
  btnPrimary:   { padding: '10px 20px', background: 'linear-gradient(135deg, #1b8a6b, #2bb5a0)', border: 'none', borderRadius: 10, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  btnOutline:   { padding: '10px 20px', background: 'white', border: '1.5px solid #2bb5a0', borderRadius: 10, color: '#2bb5a0', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-block' },
  btnGhost:     { padding: '10px 20px', background: '#f3f4f6', border: 'none', borderRadius: 10, color: '#6b7280', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
  editBtn:      { padding: '5px 12px', background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: 6, color: '#1d4ed8', fontWeight: 600, fontSize: 12, cursor: 'pointer' },
  deleteBtn:    { padding: '5px 12px', background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, color: '#b91c1c', fontWeight: 600, fontSize: 12, cursor: 'pointer' },
  outOfStockBtn:{ padding: '5px 12px', background: 'rgba(245,158,11,0.1)', border: 'none', borderRadius: 6, color: '#d97706', fontWeight: 600, fontSize: 12, cursor: 'pointer' },
  statusSelect: { padding: '5px 8px', border: '1.5px solid #e5e7eb', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#1a2e35', background: 'white', cursor: 'pointer', outline: 'none' },
};