import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import UserProfileModal from '../components/UserProfileModal';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.data);
        else setError('Failed to load users');
        setLoading(false);
      })
      .catch(() => {
        setError('Could not connect to server');
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? They will not be able to sign in again.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(user => user.id !== id));
      } else {
        alert(data.message || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Could not delete user');
    }
  };

  const openProfile = (user) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  return (
    <AdminLayout adminName="Admin">
      <div className="section-card">
        <div className="section-header">
          <div>
            <div className="section-title">Registered Users</div>
            <div className="section-subtitle">View and delete user accounts for the printing module</div>
          </div>
        </div>

        {loading && <p className="empty-msg">Loading users...</p>}
        {error && <p className="empty-msg" style={{ color: '#e53935' }}>{error}</p>}

        {!loading && !error && (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Admission No.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Phone</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="8" className="empty-msg">No registered users found.</td></tr>
                ) : users.map(user => (
                  <tr key={user.id}>
                    <td><strong>{String(user.id).padStart(3, '0')}</strong></td>
                    <td>
                      <button
                        onClick={() => openProfile(user)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2bb5a0',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                        }}
                      >
                        {user.username}
                      </button>
                    </td>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>{user.branch || '—'}</td>
                    <td>{user.year || '—'}</td>
                    <td>{user.phone}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '8px 14px' }}
                        onClick={() => handleDelete(user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserProfileModal user={selectedUser} isOpen={showUserProfile} onClose={() => setShowUserProfile(false)} />
    </AdminLayout>
  );
}
