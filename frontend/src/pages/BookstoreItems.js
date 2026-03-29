import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaHome, FaArrowLeft, FaShoppingCart, FaPlus, FaMinus } from "react-icons/fa";
import "./Bookstore.css";
import "./Dashboard.css";

const ICON_MAP = {
  book: "📒",
  "book-open": "📖",
  notebook: "📓",
  file: "🗒️"
};

export default function BookstoreItems() {
  const navigate = useNavigate();
  const { role } = useParams();
  const fullName = localStorage.getItem("full_name");

  const [items, setItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("bs_cart")) || []; }
    catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchItems = () => {
    fetch("http://localhost:5000/api/bookstore/items")
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setItems(data.data);
          // Only initialize quantities if not already set, to avoid wiping user input
          setQuantities(prev => {
            const newQ = { ...prev };
            data.data.forEach(i => {
              if (newQ[i.id] === undefined) newQ[i.id] = 0;
            });
            return newQ;
          });
        } else {
          setError("Failed to load items.");
        }
      })
      .catch(() => setError("Server error. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
    // Poll every 3 seconds for real-time stock updates
    const intervalId = setInterval(fetchItems, 3000);
    return () => clearInterval(intervalId);
  }, []);

  const updateQty = (id, delta) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const handleQtyInput = (id, val) => {
    const n = parseInt(val);
    setQuantities(prev => ({ ...prev, [id]: isNaN(n) || n < 0 ? 0 : n }));
  };

  const addToCart = (item) => {
    const qty = quantities[item.id] || 0;
    if (qty === 0) return alert("Please set a quantity first.");
    if (qty > item.quantity) return alert(`Not enough stock. Only ${item.quantity} available.`);

    setCart(prev => {
      const exists = prev.find(c => c.id === item.id);
      let updated;
      if (exists) {
        // Enforce max stock
        const newQty = Math.min(exists.quantity + qty, item.quantity);
        updated = prev.map(c => c.id === item.id ? { ...c, quantity: newQty } : c);
      } else {
        updated = [...prev, { id: item.id, name: item.item_name, price: item.price, quantity: qty }];
      }
      sessionStorage.setItem("bs_cart", JSON.stringify(updated));
      return updated;
    });

    setQuantities(prev => ({ ...prev, [item.id]: 0 }));
    alert(`✅ ${item.item_name} added to cart!`);
  };

  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <div className="dashboard-wrapper" style={{ overflow: 'hidden' }}>
      <style>{`
        /* Antigravity Modern UI / Glassmorphism */
        
        /* Floating background decoration */
        .page-bg-accent {
          position: fixed;
          top: -20%;
          left: -10%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          z-index: 0;
          pointer-events: none;
        }
        .page-bg-accent-2 {
          position: fixed;
          bottom: -20%;
          right: -10%;
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, rgba(43, 181, 160, 0.08) 0%, rgba(255,255,255,0) 70%);
          border-radius: 50%;
          z-index: 0;
          pointer-events: none;
        }

        .bookstore-items-page {
          position: relative;
          z-index: 1;
          background: transparent;
        }

        .bookstore-items-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.7);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(31, 38, 135, 0.04);
        }

        /* Redesign Grid */
        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 32px;
          margin-top: 32px;
        }

        /* Idle floating animation */
        @keyframes floatIdle {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }

        /* Antigravity Card */
        .ag-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05), 0 2px 10px rgba(0,0,0,0.02);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: floatIdle 5s ease-in-out infinite;
        }

        /* Slightly offset animation for natural feel */
        .ag-card:nth-child(even) {
          animation-delay: -2.5s;
        }
        .ag-card:nth-child(3n) {
          animation-delay: -1s;
        }
        .ag-card:nth-child(4n) {
          animation-delay: -4s;
        }

        /* Hover states */
        .ag-card:hover {
          transform: translateY(-14px) scale(1.03) !important;
          box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1), 0 10px 25px rgba(43, 181, 160, 0.15);
          border-color: rgba(255, 255, 255, 1);
          animation-play-state: paused;
          z-index: 10;
        }

        /* Glow effect on hover */
        .ag-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
          z-index: 1;
        }
        .ag-card:hover::before {
          opacity: 1;
        }

        .ag-card.out-of-stock-card {
          opacity: 0.65;
          filter: grayscale(40%);
        }

        .ag-card-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .ag-icon-box {
          height: 170px;
          background: linear-gradient(135deg, #f0fdfa, #ccfbf1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 64px;
          margin-bottom: 24px;
          box-shadow: inset 0 2px 10px rgba(0,0,0,0.03);
          overflow: hidden;
          transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .ag-card:hover .ag-icon-box {
          transform: scale(1.05);
        }

        .ag-icon-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 16px;
        }

        .ag-info {
          flex: 1;
        }

        .ag-info h4 {
          font-size: 1.15rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .ag-price {
          font-size: 1.3rem;
          font-weight: 800;
          color: #1a9e8e;
          display: block;
          margin-bottom: 14px;
        }

        .ag-badge {
          display: inline-block;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        
        .ag-qty-row {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 14px;
          padding: 6px;
          margin: 24px 0;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
        }

        .ag-qty-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: none;
          background: white;
          color: #4b5563;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .ag-qty-btn:not(:disabled):hover {
          background: #f3f4f6;
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          color: #111827;
        }
        
        .ag-qty-btn:not(:disabled):active {
          transform: scale(0.95);
        }

        .ag-qty-input {
          flex: 1;
          text-align: center;
          border: none;
          background: transparent;
          font-size: 1.05rem;
          font-weight: 700;
          color: #1f2937;
          width: 100%;
        }
        
        .ag-qty-input:focus {
          outline: none;
        }

        .ag-add-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #2bb5a0, #1a9e8e);
          color: white;
          font-weight: 700;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 6px 15px rgba(26, 158, 142, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .ag-add-btn:not(:disabled):hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(26, 158, 142, 0.4);
          background: linear-gradient(135deg, #32cdb6, #1fbaaa);
        }
        
        .ag-add-btn:not(:disabled):active {
          transform: translateY(0);
          box-shadow: 0 3px 10px rgba(26, 158, 142, 0.3);
        }

        .ag-add-btn:disabled, .ag-qty-btn:disabled {
          background: #e5e7eb;
          color: #9ca3af;
          box-shadow: none;
          transform: none;
          cursor: not-allowed;
        }

        /* Cart Badge Refined */
        .cart-badge-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white !important;
          color: #1a9e8e !important;
          padding: 12px 24px;
          border-radius: 14px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 700 !important;
          font-size: 1.05rem !important;
        }
        
        .cart-badge-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .cart-count {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 12px;
          height: 24px;
          min-width: 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.4);
          padding: 0 6px;
        }

        @media (max-width: 768px) {
          .bookstore-items-wrapper {
            padding: 24px 16px;
          }
          .items-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 20px;
          }
        }
      `}</style>
      
      <div className="page-bg-accent"></div>
      <div className="page-bg-accent-2"></div>

      {/* ── NAVBAR ── */}
      <div className="navbar" style={{ position: 'relative', zIndex: 10 }}>
        <div className="nav-left">
          <button 
            className="nav-icon-btn" 
            onClick={() => navigate(-1)}
            title="Go Back"
            aria-label="Go back to previous page"
          >
            <FaArrowLeft />
          </button>
          <h2 className="brand" style={{ color: '#2bb5a0' }}>PRINTEASE</h2>
        </div>
        <div className="nav-right">
          <button 
            className="nav-icon-btn" 
            onClick={() => navigate('/')}
            title="Go Home"
            aria-label="Go to home page"
          >
            <FaHome />
          </button>
          <div 
            className="avatar"
            onClick={() => navigate(`/${role}/profile`)}
            style={{ cursor: "pointer" }}
          >
            {fullName ? fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <span 
            className="username"
            onClick={() => navigate(`/${role}/profile`)}
            style={{ cursor: "pointer" }}
          >{fullName}</span>
          <span className="logout" onClick={() => { localStorage.clear(); navigate('/'); }}>
            Logout
          </span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="bookstore-items-page">
        <div className="bookstore-items-wrapper">
          <div className="bookstore-items-header" style={{ marginBottom: 0 }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1f2937', margin: 0 }}>Available Items</h2>
            <button className="cart-badge-btn" onClick={() => navigate(`/${role}/bookstore/cart`)} style={{ position: 'relative' }}>
              <FaShoppingCart size={18} />
              <span>Cart</span>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>

          {loading && <div className="bs-loading" style={{ fontSize: '1.2rem', padding: '100px 0', fontWeight: '600' }}>Loading items magically... ✨</div>}
          {error && <div className="bs-error">{error}</div>}

          {!loading && !error && (
            <div className="items-grid">
              {items.map(item => {
                const isOutOfStock = item.quantity === 0;
                const isLowStock = item.quantity > 0 && item.quantity <= 20;

                return (
                  <div key={item.id} className={`ag-card ${isOutOfStock ? "out-of-stock-card" : ""}`}>
                    <div className="ag-card-content">
                      
                      <div className="ag-icon-box">
                        {item.image_url ? 
                          <img src={item.image_url} alt={item.item_name} /> :
                          (ICON_MAP[item.category] || "📦")
                        }
                      </div>
                      
                      <div className="ag-info">
                        <h4>{item.item_name}</h4>
                        <span className="ag-price">₹{item.price}</span>
                        <div>
                          <span className="ag-badge" style={{
                            background: isOutOfStock ? '#fee2e2' : isLowStock ? '#fef3c7' : '#d1fae5',
                            color:      isOutOfStock ? '#b91c1c' : isLowStock ? '#b45309' : '#065f46',
                          }}>
                            {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${item.quantity} left!` : 'In Stock'}
                          </span>
                        </div>
                      </div>

                      <div className="ag-qty-row">
                        <button className="ag-qty-btn" onClick={() => updateQty(item.id, -1)} disabled={isOutOfStock}>
                          <FaMinus size={12} />
                        </button>
                        <input
                          type="number"
                          className="ag-qty-input"
                          value={quantities[item.id] || 0}
                          onChange={e => handleQtyInput(item.id, e.target.value)}
                          min="0"
                          max={item.quantity}
                          disabled={isOutOfStock}
                        />
                        <button className="ag-qty-btn" onClick={() => updateQty(item.id, 1)} disabled={isOutOfStock || quantities[item.id] >= item.quantity}>
                          <FaPlus size={12} />
                        </button>
                      </div>

                      <button 
                        className={`ag-add-btn ${isOutOfStock ? "btn-disabled" : ""}`} 
                        onClick={() => addToCart(item)}
                        disabled={isOutOfStock}
                      >
                        {isOutOfStock ? "Out of Stock" : <><FaShoppingCart /> Add to Cart</>}
                      </button>
                      
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}