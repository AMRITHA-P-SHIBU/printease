import React from 'react';

export default function UserProfileModal({ user, isOpen, onClose }) {
  if (!isOpen || !user) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 999,
          display: isOpen ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto',
          display: isOpen ? 'block' : 'none',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            background: 'linear-gradient(135deg, #2bb5a0, #1e8b7f)',
            color: '#fff',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>User Profile</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Profile Avatar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: '#2bb5a0',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 700,
              }}
            >
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* User Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Full Name
              </label>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a2e35' }}>
                {user.full_name || 'N/A'}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Admission Number (Username)
              </label>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a2e35' }}>
                {user.username || 'N/A'}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Email
              </label>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a2e35' }}>
                {user.email || 'N/A'}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Phone
              </label>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a2e35' }}>
                {user.phone || 'N/A'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Branch
                </label>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a2e35' }}>
                  {user.branch || 'N/A'}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Year
                </label>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1a2e35' }}>
                  {user.year || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '12px 16px',
              background: '#2bb5a0',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = '#1e8b7f'}
            onMouseLeave={e => e.target.style.background = '#2bb5a0'}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
