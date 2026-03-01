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

  useEffect(() => {
    fetch("http://localhost:5000/api/bookstore/items")
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setItems(data.data);
          const q = {};
          data.data.forEach(i => { q[i.id] = 0; });
          setQuantities(q);
        } else {
          setError("Failed to load items.");
        }
      })
      .catch(() => setError("Server error. Please try again."))
      .finally(() => setLoading(false));
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

    setCart(prev => {
      const exists = prev.find(c => c.id === item.id);
      let updated;
      if (exists) {
        updated = prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + qty } : c);
      } else {
        updated = [...prev, { id: item.id, name: item.name, price: item.price, quantity: qty }];
      }
      sessionStorage.setItem("bs_cart", JSON.stringify(updated));
      return updated;
    });

    setQuantities(prev => ({ ...prev, [item.id]: 0 }));
    alert(`✅ ${item.name} added to cart!`);
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

          {!loading && !error && items.map(item => (
            <div key={item.id} className="item-card">
              <div className="item-card-top">
                <div className="item-icon-box">
                  {ICON_MAP[item.icon] || "📦"}
                </div>
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <span className="item-price">₹{item.price}</span>
                </div>
              </div>

              <div className="item-quantity-row">
                <label>Quantity</label>
                <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>−</button>
                <input
                  type="number"
                  className="qty-input"
                  value={quantities[item.id] || 0}
                  onChange={e => handleQtyInput(item.id, e.target.value)}
                  min="0"
                />
                <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
              </div>

              <button className="add-to-cart-btn" onClick={() => addToCart(item)}>
                🛒 Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}