import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
  { path: '/admin/requests', label: 'Print Requests', icon: '🖨' },
  { path: '/admin/bookstore', label: 'Bookstore', icon: '📚' },
  { path: '/admin/reports', label: 'Reports', icon: '📊' },
];

export default function AdminLayout({ children, adminName = 'Admin' }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Clear auth and redirect to login
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className={`admin-wrapper ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🖨️</span>
            {sidebarOpen && <span className="logo-text">Print<span>Ease</span></span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout} title={!sidebarOpen ? 'Logout' : ''}>
            <span className="nav-icon">⎋</span>
            {sidebarOpen && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Navbar */}
        <header className="admin-navbar">
          <div className="navbar-left">
            <h2 className="page-title">
              {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          <div className="navbar-right">
            <div className="navbar-date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="admin-profile">
              <div className="admin-avatar">{adminName.charAt(0).toUpperCase()}</div>
              <div className="admin-info">
                <span className="admin-name">{adminName}</span>
                <span className="admin-role">Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>

        {/* Footer */}
        <footer className="admin-footer">
          <span>© {new Date().getFullYear()} PrintEase — Campus Printing & Bookstore Management System</span>
          <span>All rights reserved</span>
        </footer>
      </div>
    </div>
  );
}
