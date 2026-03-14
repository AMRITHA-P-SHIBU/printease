import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
    <div className="dashboard-wrapper">

      {/* ── NAVBAR ── */}
      <div className="navbar">
        <h2 className="brand">PRINTEASE</h2>
        <div className="nav-right">
          <button className="nav-btn" onClick={() => navigate(-1)}>← Back</button>
          <button className="nav-btn" onClick={() => navigate('/')}>🏠 Home</button>
          <div className="avatar">
            {fullName ? fullName.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="username">{fullName}</span>
          <span className="logout" onClick={() => { localStorage.clear(); navigate('/'); }}>
            Logout
          </span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="bookstore-items-page">
        <div className="bookstore-items-wrapper">
          <div className="bookstore-items-header">
            <h2>Available Items</h2>
            <button className="cart-badge-btn" onClick={() => navigate(`/${role}/bookstore/cart`)}>
              🛒 Cart
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </button>
          </div>

          {loading && <div className="bs-loading">Loading items...</div>}
          {error && <div className="bs-error">{error}</div>}

          {!loading && !error && items.map(item => {
            const isOutOfStock = item.quantity === 0;
            const isLowStock = item.quantity > 0 && item.quantity <= 20;
            return (
            <div key={item.id} className={`item-card ${isOutOfStock ? "out-of-stock-card" : ""}`}>
              <div className="item-card-top">
                <div className="item-icon-box" style={{ padding: 0, overflow: 'hidden' }}>
                  {item.image_url ? 
                    <img src={item.image_url} alt={item.item_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                    (ICON_MAP[item.category] || "📦")
                  }
                </div>
                <div className="item-info">
                  <h4 style={{ margin: '0 0 4px 0' }}>{item.item_name}</h4>
                  <span className="item-price">₹{item.price}</span>
                  <div style={{ marginTop: 8 }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
                      background: isOutOfStock ? '#fee2e2' : isLowStock ? '#fef3c7' : '#d1fae5',
                      color:      isOutOfStock ? '#b91c1c' : isLowStock ? '#b45309' : '#065f46',
                    }}>
                      {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${item.quantity} left!` : 'In Stock'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="item-quantity-row">
                <label>Quantity</label>
                <button className="qty-btn" onClick={() => updateQty(item.id, -1)} disabled={isOutOfStock}>−</button>
                <input
                  type="number"
                  className="qty-input"
                  value={quantities[item.id] || 0}
                  onChange={e => handleQtyInput(item.id, e.target.value)}
                  min="0"
                  max={item.quantity}
                  disabled={isOutOfStock}
                />
                <button className="qty-btn" onClick={() => updateQty(item.id, 1)} disabled={isOutOfStock || quantities[item.id] >= item.quantity}>+</button>
              </div>

              <button 
                className={`add-to-cart-btn ${isOutOfStock ? "btn-disabled" : ""}`} 
                onClick={() => addToCart(item)}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? "Out of Stock" : "🛒 Add to Cart"}
              </button>
            </div>
          )})}
        </div>
      </div>

    </div>
  );
}