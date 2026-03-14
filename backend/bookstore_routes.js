// ── bookstore_routes.js ──
// Place this file in your backend folder and require it in index.js:
// const bookstoreRoutes = require('./bookstore_routes');
// app.use('/api/bookstore', bookstoreRoutes);

const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const XLSX     = require('xlsx');
const db       = require('./db'); // adjust path if needed

// ── Multer for Excel uploads ──
const excelStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'excel_uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const excelUpload = multer({
  storage: excelStorage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls'].includes(ext)) cb(null, true);
    else cb(new Error('Only Excel files allowed'), false);
  }
});

// ════════════════════════════════
//  INVENTORY ROUTES
// ════════════════════════════════

// GET all items
router.get('/items', (req, res) => {
  db.query('SELECT * FROM bookstore_items ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, data: results });
  });
});

// POST upload Excel → bulk insert items
router.post('/items/upload-excel', excelUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  try {
    const workbook  = XLSX.readFile(req.file.path);
    const sheet     = workbook.Sheets[workbook.SheetNames[0]];
    const rows      = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) return res.status(400).json({ success: false, message: 'Excel file is empty' });

    const values = rows.map(row => [
      row.item_name        || row['Item Name']        || 'Unknown',
      row.image_url        || row['Image URL']        || null,
      parseFloat(row.price || row['Unit Price']       || row.unit_price || 0),
      parseInt(row.quantity || row['Quantity Available'] || row.quantity_available || 0),
      row.category         || row['Category']         || null,
      row.description      || row['Description']      || null,
    ]);

    const sql = `
      INSERT INTO bookstore_items (item_name, image_url, price, quantity, category, description)
      VALUES ?
    `;
    db.query(sql, [values], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error', error: err.message });
      // Clean up uploaded Excel file
      fs.unlinkSync(req.file.path);
      res.json({ success: true, message: `${result.affectedRows} items added successfully` });
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to parse Excel file' });
  }
});

// POST add single item
router.post('/items', (req, res) => {
  const { item_name, image_url, price, quantity, category, description } = req.body;
  if (!item_name || !price) return res.status(400).json({ success: false, message: 'item_name and price are required' });
  const sql = 'INSERT INTO bookstore_items (item_name, image_url, price, quantity, category, description) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [item_name, image_url || null, price, quantity || 0, category || null, description || null], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, message: 'Item added', id: result.insertId });
  });
});

// PUT edit item
router.put('/items/:id', (req, res) => {
  const { item_name, image_url, price, quantity, category, description } = req.body;
  const sql = 'UPDATE bookstore_items SET item_name=?, image_url=?, price=?, quantity=?, category=?, description=? WHERE id=?';
  db.query(sql, [item_name, image_url || null, price, quantity, category || null, description || null, req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, message: 'Item updated' });
  });
});

// DELETE item
router.delete('/items/:id', (req, res) => {
  db.query('DELETE FROM bookstore_items WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, message: 'Item deleted' });
  });
});

// PUT mark item out of stock
router.put('/items/:id/out-of-stock', (req, res) => {
  db.query('UPDATE bookstore_items SET quantity = 0 WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, message: 'Item marked as out of stock' });
  });
});

// ════════════════════════════════
//  ORDER ROUTES
// ════════════════════════════════

// GET all orders (admin)
router.get('/orders', (req, res) => {
  const sql = `
    SELECT 
      o.id, 
      COALESCE(o.full_name, o.username) as full_name, 
      oi.item_name, 
      oi.quantity, 
      (oi.price * oi.quantity) as total_price, 
      o.created_at as order_date,
      o.status
    FROM bookstore_orders o
    JOIN bookstore_order_items oi ON o.id = oi.order_id
    ORDER BY o.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, data: results });
  });
});

// GET bookstore order by ID (for BookstoreStatus.js)
router.get('/order/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT o.id, o.username, o.total_amount, o.status, o.created_at,
            oi.item_name, oi.price, oi.quantity
     FROM bookstore_orders o
     JOIN bookstore_order_items oi ON o.id = oi.order_id
     WHERE o.id = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
      if (!results.length) return res.status(404).json({ success: false, message: 'Order not found' });
      const order = {
        id: results[0].id, username: results[0].username,
        total_amount: results[0].total_amount, status: results[0].status,
        created_at: results[0].created_at,
        items: results.map(r => ({ item_name: r.item_name, price: r.price, quantity: r.quantity }))
      };
      res.json({ success: true, data: order });
    }
  );
});

// GET orders by username (user) for BookstorePreviousActivity.js
router.get('/orders/:username', (req, res) => {
  const { username } = req.params;
  db.query(
    `SELECT o.id, o.username, o.total_amount, o.status, o.created_at,
            oi.item_name, oi.price, oi.quantity
     FROM bookstore_orders o
     JOIN bookstore_order_items oi ON o.id = oi.order_id
     WHERE o.username = ?
     ORDER BY o.created_at DESC`,
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Database error' });
      const map = {};
      results.forEach(row => {
        if (!map[row.id]) map[row.id] = { id: row.id, username: row.username, total_amount: row.total_amount, status: row.status, created_at: row.created_at, items: [] };
        map[row.id].items.push({ item_name: row.item_name, price: row.price, quantity: row.quantity });
      });
      res.json({ success: true, data: Object.values(map) });
    }
  );
});

// POST place order (user cart batch)
router.post('/order', async (req, res) => {
  const { username, full_name, items } = req.body;
  
  if (!username || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Missing required fields or cart is empty' });
  }

  try {
    const doQuery = (sql, params) => new Promise((resolve, reject) => {
      db.query(sql, params, (err, result) => {
        if (err) reject(err); else resolve(result);
      });
    });

    let totalAmount = 0;
    
    // 1. Check stock for all items
    for (let i = 0; i < items.length; i++) {
      const cartItem = items[i];
      const rows = await doQuery('SELECT * FROM bookstore_items WHERE id=?', [cartItem.id]);
      if (!rows.length) return res.status(404).json({ success: false, message: `Item ${cartItem.name} not found` });
      
      const dbItem = rows[0];
      if (dbItem.quantity < cartItem.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${cartItem.name}` });
      }
      cartItem.dbPrice = dbItem.price;
      totalAmount += dbItem.price * cartItem.quantity;
    }

    // 2. Insert records & decrease stock
    const insertOrderRes = await doQuery(
      'INSERT INTO bookstore_orders (username, full_name, total_amount) VALUES (?, ?, ?)',
      [username, full_name || username, totalAmount]
    );
    const orderId = insertOrderRes.insertId;

    for (let i = 0; i < items.length; i++) {
      const cartItem = items[i];
      await doQuery(
        'INSERT INTO bookstore_order_items (order_id, item_id, item_name, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderId, cartItem.id, cartItem.name, cartItem.dbPrice, cartItem.quantity]
      );
      await doQuery('UPDATE bookstore_items SET quantity = quantity - ? WHERE id=?', [cartItem.quantity, cartItem.id]);
    }

    res.json({ success: true, message: 'Order placed successfully', order_id: orderId, total_amount: totalAmount });
  } catch (error) {
    console.error('Order Processing Error:', error);
    res.status(500).json({ success: false, message: 'Database error while placing order' });
  }
});

// PUT update order status (admin)
router.put('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const allowed = ['Pending', 'Confirmed', 'Ready for Pickup', 'Completed', 'Cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
  db.query('UPDATE bookstore_orders SET status=? WHERE id=?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    res.json({ success: true, message: 'Status updated' });
  });
});

// GET dashboard stats (admin)
router.get('/stats', (req, res) => {
  const queries = {
    totalItems:     'SELECT COUNT(*) as count FROM bookstore_items',
    totalOrders:    'SELECT COUNT(*) as count FROM bookstore_orders',
    pendingOrders:  'SELECT COUNT(*) as count FROM bookstore_orders WHERE status="Pending"',
    completedOrders:'SELECT COUNT(*) as count FROM bookstore_orders WHERE status="Completed"',
    revenue:        'SELECT COALESCE(SUM(total_amount),0) as total FROM bookstore_orders WHERE status IN ("Completed","Ready for Pickup","Confirmed")',
    lowStockItems:  'SELECT * FROM bookstore_items WHERE quantity <= 20 AND quantity > 0',
    outOfStockItems:'SELECT COUNT(*) as count FROM bookstore_items WHERE quantity = 0'
  };
  const stats = {};
  let done = 0;
  const keys = Object.keys(queries);
  keys.forEach(key => {
    db.query(queries[key], (err, results) => {
      if (!err) {
        if (key === 'lowStockItems') {
          stats[key] = results; // returns full array for alert
        } else {
          stats[key] = results[0]?.count ?? results[0]?.total ?? 0;
        }
      } else {
        stats[key] = key === 'lowStockItems' ? [] : 0;
      }
      done++;
      if (done === keys.length) res.json({ success: true, data: stats });
    });
  });
});

module.exports = router;